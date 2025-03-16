import { CodeEditor } from '../components/CodeEditor';

const initialPlaygroundCode = `yo bro
bro say "Welcome to the Playground!"
bro ask num
bro say "You entered: " + num
peace out bro`;

export function Playground() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Playground</h1>
      <p className="text-lg text-text/80 mb-6">
        Experiment with BroLang code here. Try running the example below or write your own!
      </p>
      <CodeEditor
        initialValue={initialPlaygroundCode}
        height="500px"
        showRunButton={true}
      />
    </div>
  );
}