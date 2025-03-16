from lang.parser import *

class Interpreter:
    def __init__(self):
        self.variables = {}  # Stores variable values
        self.output = []     # Stores output for print statements
        self.debug_mode = False  # Add debug mode flag
        self.input_callback = None  # Callback for getting input
        self.output_callback = None  # Callback for sending output

    def reset(self):
        """Reset interpreter state for a new execution."""
        self.variables = {}
        self.output = []

    def set_callbacks(self, input_callback=None, output_callback=None):
        """Set callbacks for input and output."""
        self.input_callback = input_callback
        self.output_callback = output_callback

    def visit(self, node):
        if isinstance(node, Program):
            if self.debug_mode:
                print("\n=== Starting Program Execution ===\n")
            for statement in node.statements:
                if self.debug_mode:
                    print("Current Variables:", self.variables)
                    print("Executing:", self._get_statement_description(statement))
                self.visit(statement)
                if self.debug_mode:
                    print("Output:", self.output[-1] if self.output else "No output")
                    print("-" * 50)
            if self.debug_mode:
                print("\n=== Program Execution Completed ===\n")
            return "\n".join(self.output)

        elif isinstance(node, PrintStatement):
            value = str(self.evaluate(node.expression))
            self.output.append(value)
            if self.output_callback:
                self.output_callback(value)

        elif isinstance(node, VariableDeclaration):
            if isinstance(node.value, Literal) and node.value.value == "INPUT":
                if self.input_callback:
                    user_input = self.input_callback()
                    try:
                        self.variables[node.name] = int(user_input) if user_input.isdigit() else user_input
                    except ValueError:
                        self.variables[node.name] = user_input
                else:
                    user_input = input(f"Bro, enter a value for {node.name}: ")
                    try:
                        self.variables[node.name] = int(user_input) if user_input.isdigit() else user_input
                    except ValueError:
                        self.variables[node.name] = user_input
            else:
                self.variables[node.name] = self.evaluate(node.value)

        elif isinstance(node, WhileLoop):
            max_iterations = 1000  # Safety limit
            iteration_count = 0
            while self.evaluate(node.condition):
                if iteration_count >= max_iterations:
                    raise RuntimeError("Bro, your while loop exceeded the maximum number of iterations!")
                if iteration_count >= 10:
                    self.output.append("Bro, I ain’t doing allat")
                    if self.output_callback:
                        self.output_callback("Bro, I ain’t doing allat")
                    break  # Stop the loop after 10 iterations
                if self.debug_mode:
                    print(f"While Loop Iteration {iteration_count + 1}")
                iteration_count += 1
                for statement in node.body:
                    self.visit(statement)

        elif isinstance(node, IfStatement):
            condition_result = self.evaluate(node.condition)
            if self.debug_mode:
                print(f"IF condition evaluated to: {condition_result}")
            if condition_result:
                for statement in node.if_body:
                    self.visit(statement)
            elif node.else_body:
                for statement in node.else_body:
                    self.visit(statement)

    def evaluate(self, node):
        if isinstance(node, Literal):
            return node.value

        elif isinstance(node, VariableReference):
            if node.name not in self.variables:
                raise NameError(f"Bro, variable '{node.name}' is not defined")
            return self.variables[node.name]

        elif isinstance(node, BinaryOperation):
            left_value = self.evaluate(node.left)
            right_value = self.evaluate(node.right)

            if node.operator == "+":
                if isinstance(left_value, str) or isinstance(right_value, str):
                    return str(left_value) + str(right_value)
                return left_value + right_value
            elif node.operator == "-":
                return left_value - right_value
            elif node.operator == "*":
                return left_value * right_value
            elif node.operator == "/":
                if right_value == 0:
                    raise ZeroDivisionError("Bro, you can't divide by zero!")
                return left_value / right_value
            elif node.operator == ">":
                return left_value > right_value
            elif node.operator == "<":
                return left_value < right_value
            elif node.operator == ">=":
                return left_value >= right_value
            elif node.operator == "<=":
                return left_value <= right_value
            elif node.operator == "==":
                return left_value == right_value
            elif node.operator == "!=":
                return left_value != right_value
            elif node.operator == "%":
                return left_value % right_value
            else:
                raise SyntaxError(f"Bro, unsupported operator: {node.operator}")

        raise TypeError(f"Bro, I don't know how to evaluate this: {node}")

    def _get_statement_description(self, statement, node):
        if isinstance(statement, PrintStatement):
            return "PRINT statement"
        elif isinstance(statement, VariableDeclaration):
            if isinstance(statement.value, Literal) and statement.value.value == "INPUT":
                return f"INPUT statement for variable '{statement.name}'"
            return f"Variable Declaration: {statement.name}"
        elif isinstance(node, WhileLoop):
            return "WHILE Loop"
        elif isinstance(node, IfStatement):
            return "IF Statement"
        return "Unknown Statement"  # Fixed typo: 'node' to 'statement'

if __name__ == "__main__":
    from lexer import tokenize
    from parser import parse

    code = '''
yo bro
bro this is x = 10
bro this is y = 5

# Test if-else statement
bro if x > y
    bro say "x is greater than y"
else
    bro say "x is not greater than y"

# Test while loop
bro this is counter = 12
keep going bro counter > 0
    bro say "Counting down: " + counter
    bro this is counter = counter - 1

# Test input with if-else
bro ask num
bro if num > 5
    bro say "Your number is greater than 5"
else
    bro say "Your number is less than or equal to 5"

peace out bro
'''
    tokens = tokenize(code)
    ast = parse(tokens)
    interpreter = Interpreter()
    interpreter.set_callbacks(input_callback=lambda: input("Enter a value: "))
    output = interpreter.visit(ast)
    print(output)