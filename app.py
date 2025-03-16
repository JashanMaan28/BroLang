from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
import sys
from queue import Queue
from threading import Lock, Thread

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from lang.lexer import tokenize
from lang.parser import parse
from lang.interpreter import Interpreter

# Configure logging
logging.basicConfig(
    level='INFO',
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'default-secret-key-bro'

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ['http://localhost:3000', 'http://localhost:5173'],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

class CodeExecutor:
    def __init__(self):
        self.timeout = 5
        self.interpreter = Interpreter()
        self.input_queue = Queue()
        self.output = []
        self.waiting_for_input = False
        self.lock = Lock()
        self.execution_complete = False
        self.result = None

    def reset(self):
        with self.lock:
            self.input_queue = Queue()
            self.output = []
            self.waiting_for_input = False
            self.execution_complete = False
            self.result = None
            self.interpreter.reset()

    def execute(self, code):
        logger.info("Starting code execution")
        self.reset()

        def run_execution():
            try:
                tokens = tokenize(code)
                logger.info(f"Tokens generated: {tokens}")
                ast = parse(tokens)
                logger.info("AST parsing complete")

                def input_callback():
                    logger.info("Waiting for input")
                    self.waiting_for_input = True
                    input_value = self.input_queue.get()  # Blocks until input
                    self.waiting_for_input = False
                    logger.info(f"Received input: {input_value}")
                    return input_value

                def output_callback(value):
                    self.output.append(value)
                    logger.info(f"Output captured: {value}")

                self.interpreter.set_callbacks(input_callback, output_callback)
                logger.info("Callbacks set, starting interpreter")
                self.interpreter.visit(ast)
                logger.info("Interpreter execution complete")

                with self.lock:
                    self.result = {
                        'success': True,
                        'output': '\n'.join(self.output),
                        'waiting_for_input': self.waiting_for_input
                    }
                    self.execution_complete = True

            except Exception as e:
                logger.error(f'Error executing code: {str(e)}')
                with self.lock:
                    self.result = {
                        'success': False,
                        'output': f'Bro, there was an error: {str(e)}',
                        'waiting_for_input': False
                    }
                    self.execution_complete = True

        # Check if the code contains 'bro ask' to determine if threading is needed
        if 'bro ask' in code.lower():
            logger.info("Code requires input, running in thread")
            Thread(target=run_execution).start()
            return {
                'success': True,
                'output': '',
                'waiting_for_input': False
            }
        else:
            logger.info("Code does not require input, running synchronously")
            run_execution()
            with self.lock:
                return self.result

    def provide_input(self, input_value):
        logger.info(f"Providing input: {input_value}")
        with self.lock:
            if not self.waiting_for_input:
                logger.warning("Not waiting for input, rejecting request")
                return {'success': False, 'error': 'Not waiting for input'}
            
            self.input_queue.put(input_value)
            logger.info("Input added to queue")
            return {'success': True, 'message': 'Input accepted, waiting for execution to complete'}

    def get_result(self):
        with self.lock:
            if self.execution_complete:
                return self.result
            elif self.waiting_for_input:
                return {'success': True, 'output': '\n'.join(self.output), 'waiting_for_input': True}
            else:
                return {'success': True, 'output': '\n'.join(self.output), 'waiting_for_input': False}

executor = CodeExecutor()

@app.route('/run', methods=['POST'])
def run_code():
    logger.info("Received /run request")
    try:
        code = request.json.get('code')
        if not code:
            logger.warning("No code provided in request")
            return jsonify({'error': 'Bro, you need to provide some code!'}), 400

        logger.info(f"Executing code: {code}")
        result = executor.execute(code)
        logger.info(f"Run result: {result}")
        return jsonify(result)

    except Exception as e:
        logger.error(f'Server error in /run: {str(e)}')
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/input', methods=['POST'])
def provide_input():
    logger.info("Received /input request")
    try:
        input_value = request.json.get('input')
        if input_value is None:
            logger.warning("No input provided in request")
            return jsonify({'error': 'Bro, you need to provide input!'}), 400

        logger.info(f"Processing input: {input_value}")
        result = executor.provide_input(input_value)
        logger.info(f"Input result: {result}")
        return jsonify(result)

    except Exception as e:
        logger.error(f'Server error in /input: {str(e)}')
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/result', methods=['GET'])
def get_result():
    logger.info("Received /result request")
    result = executor.get_result()
    logger.info(f"Result response: {result}")
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health_check():
    logger.info("Received /health request")
    response = {
        'status': 'healthy',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    }
    logger.info(f"Health check response: {response}")
    return jsonify(response)

if __name__ == '__main__':
    port = 5000
    host = '0.0.0.0'
    debug = True
    logger.info(f"Starting Flask server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)
    