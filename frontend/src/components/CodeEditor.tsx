import { useEffect, useCallback, useState, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { debounce } from '../lib/utils';
import toast from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import { Play, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'brolang-playground-code';

interface CodeEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  height?: string;
  onRun?: () => void;
  showRunButton?: boolean;
}

interface TerminalMessage {
  type: 'output' | 'input' | 'error';
  content: string;
}

export function CodeEditor({
  initialValue = '',
  onChange,
  height = '400px',
  onRun,
  showRunButton = true,
}: CodeEditorProps) {
  const [code, setCode] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || initialValue;
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessage[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const lastOutput = useRef<string | null>(null);

  const debouncedSave = useCallback(
    debounce((value: string) => {
      localStorage.setItem(STORAGE_KEY, value);
    }, 500),
    []
  );

  const handleChange = (value: string) => {
    setCode(value);
    debouncedSave(value);
    onChange?.(value);
  };

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalMessages, waitingForInput]);

  const pollResult = useCallback(async () => {
    try {
      console.log('Polling /result');
      const response = await axios.get('http://localhost:5000/result');
      console.log('Poll response:', response.data);

      if (response.data.waiting_for_input === true) {
        console.log('Setting waitingForInput to true');
        setWaitingForInput(true);
        if (response.data.output && response.data.output !== lastOutput.current) {
          setTerminalMessages((prev) => [
            ...prev,
            { type: 'output', content: response.data.output }
          ]);
          lastOutput.current = response.data.output;
        }
      } else if (response.data.success === true && response.data.waiting_for_input === false) {
        console.log('Execution complete or intermediate output, waitingForInput false');
        setWaitingForInput(false);
        if (response.data.output && response.data.output !== lastOutput.current) {
          setTerminalMessages((prev) => [
            ...prev,
            { type: 'output', content: response.data.output }
          ]);
          lastOutput.current = response.data.output;
        }
        if (pollingInterval.current && !response.data.waiting_for_input) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
          console.log('Polling stopped');
        }
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error('Poll error:', error.message, error.response?.data);
      setTerminalMessages((prev) => [...prev, { type: 'error', content: 'Failed to fetch result' }]);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    }
  }, []);

  const handleInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && waitingForInput) {
      const input = currentInput;
      console.log('Submitting input:', input);
      setCurrentInput('');
      setTerminalMessages((prev) => [...prev, { type: 'input', content: input }]);
      setWaitingForInput(false);

      try {
        const response = await axios.post('http://localhost:5000/input', { input });
        console.log('Input response:', response.data);
        toast.success('Input submitted, waiting for result');
        if (!pollingInterval.current) {
          pollingInterval.current = setInterval(pollResult, 500);
          console.log('Restarted polling after input');
        }
      } catch (err: unknown) {
        const error = err as AxiosError;
        console.error('Input error:', error.message, error.response?.data);
        setTerminalMessages((prev) => [...prev, { type: 'error', content: `Failed to send input: ${error.message}` }]);
      }
    }
  };

  const handleRun = async () => {
    console.log('handleRun called');
    if (onRun) {
      console.log('onRun prop exists, calling it');
      onRun();
      return;
    }

    console.log('Starting code execution with code:', code);
    setIsRunning(true);
    setTerminalMessages([]);
    setWaitingForInput(false);
    lastOutput.current = null;

    try {
      console.log('Sending POST request to http://localhost:5000/run');
      const response = await axios.post('http://localhost:5000/run', { code }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Received response from /run:', response.data);

      if (response.data.error) {
        console.log('Error in response:', response.data.error);
        setTerminalMessages([{ type: 'error', content: response.data.error }]);
      } else {
        console.log('Success response, updating terminal with output:', response.data.output);
        if (response.data.output) {
          setTerminalMessages([{ type: 'output', content: response.data.output }]);
          lastOutput.current = response.data.output;
        }
        console.log('Starting polling');
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
        pollingInterval.current = setInterval(pollResult, 500);
      }
      toast.success('Code execution started!');
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error('Error during axios request:', error.message, error.response?.data);
      setTerminalMessages([{ type: 'error', content: `Failed to execute code: ${error.message}` }]);
      toast.error('Failed to execute code');
    } finally {
      setIsRunning(false);
      console.log('handleRun completed');
    }
  };

  const handleReset = () => {
    console.log('Resetting editor');
    setCode(initialValue);
    setTerminalMessages([]);
    setWaitingForInput(false);
    setCurrentInput('');
    lastOutput.current = null;
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    toast.success('Editor reset to initial state!');
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        console.log('Cmd+Enter detected, running code');
        handleRun();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [code]);

  useEffect(() => {
    console.log('waitingForInput changed to:', waitingForInput);
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingForInput]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={handleReset}
          className="rounded-sm border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600"
        >
          Reset
        </button>
        {showRunButton && (
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </>
            )}
          </button>
        )}
      </div>

      <div className="relative rounded border border-gray-600 overflow-hidden" style={{ height }}>
        <CodeMirror
          value={code}
          height={height}
          theme={oneDark}
          extensions={[javascript()]}
          onChange={handleChange}
          className="h-full overflow-auto"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      <div className="rounded border border-gray-600 bg-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Terminal</h3>
        <div
          ref={terminalRef}
          className="font-mono text-sm h-48 overflow-auto whitespace-pre-wrap"
        >
          {terminalMessages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.type === 'error'
                  ? 'text-red-400'
                  : msg.type === 'input'
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }
            >
              {msg.type === 'input' ? '> ' : ''}{msg.content}
            </div>
          ))}
          {waitingForInput && (
            <div className="flex items-center">
              <span className="text-yellow-400">{'> '}</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleInput}
                className="flex-1 bg-transparent outline-none text-yellow-400"
                placeholder="Enter input..."
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400">
        Press <kbd className="rounded border border-gray-600 px-1.5 py-0.5 text-xs">⌘</kbd>+
        <kbd className="rounded border border-gray-600 px-1.5 py-0.5 text-xs">Enter</kbd> to run code
      </p>
    </div>
  );
}