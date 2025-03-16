import sys
from lexer import tokenize
from parser import parse
from interpreter import Interpreter

def main():
    """
    Entry point for executing the Bro language interpreter.
    """
    if len(sys.argv) != 2:
        print("Usage: python bro_lang.py <filename>")
        return

    filename = sys.argv[1]
    try:
        with open(filename, 'r') as file:
            code = file.read()
            tokens = tokenize(code)
            ast = parse(tokens)
            interpreter = Interpreter()
            output = interpreter.visit(ast)
            print(output)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
