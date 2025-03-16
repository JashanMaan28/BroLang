class ASTNode:
    pass

class Program(ASTNode):
    def __init__(self, statements):
        self.statements = statements

class PrintStatement(ASTNode):
    def __init__(self, expression):
        self.expression = expression

class VariableDeclaration(ASTNode):
    def __init__(self, name, value):
        self.name = name
        self.value = value

class IfStatement(ASTNode):
    def __init__(self, condition, if_body, else_body=None):
        self.condition = condition
        self.if_body = if_body
        self.else_body = else_body

class WhileLoop(ASTNode):
    def __init__(self, condition, body):
        self.condition = condition
        self.body = body

class BinaryOperation(ASTNode):
    def __init__(self, left, operator, right):
        self.left = left
        self.operator = operator
        self.right = right

class Literal(ASTNode):
    def __init__(self, value):
        self.value = value

class VariableReference(ASTNode):
    def __init__(self, name):
        self.name = name

def parse_expression(tokens):
    """Parse an expression (supports binary operations and parentheses)."""
    if not tokens:
        raise SyntaxError("Bro, unexpected end of input while parsing an expression")

    token_type, token_value = tokens.pop(0)
    # print(f"Parsing expression: {token_type}, {token_value}")  # Debugging log

    # Handle literals (numbers or strings)
    if token_type == "NUMBER":
        left = Literal(int(token_value))
    elif token_type == "STRING":
        left = Literal(token_value.strip('"'))
    elif token_type == "IDENTIFIER":
        left = VariableReference(token_value)
    elif token_type == "LBRACE":  # Handle opening parenthesis '('
        left = parse_expression(tokens)  # Recursively parse the inner expression
        if not tokens or tokens[0][0] != "RBRACE":  # Ensure closing parenthesis ')'
            raise SyntaxError("Bro, you forgot to close your parentheses!")
        tokens.pop(0)  # Consume the closing parenthesis ')'
    else:
        raise SyntaxError(f"Bro, unexpected token in expression: {token_value}")

    # Handle binary operations like +, -, *, /, %
    while tokens and tokens[0][0] == "OPERATOR":
        operator_token_type, operator_value = tokens.pop(0)
        right = parse_expression(tokens)
        left = BinaryOperation(left, operator_value, right)

    return left

def parse_parentheses(tokens):
    """Parse an expression enclosed in parentheses."""
    if not tokens or tokens[0][0] != "LPAREN":
        raise SyntaxError("Bro, expected '(' to start an expression")
    
    tokens.pop(0)  # Remove '('
    
    expression = parse_expression(tokens)
    
    if not tokens or tokens[0][0] != "RPAREN":
        raise SyntaxError("Bro, expected ')' to end an expression")
    
    tokens.pop(0)  # Remove ')'
    
    return expression

def parse_block(tokens):
    """Parse a block of statements enclosed in `{}`."""
    if not tokens or tokens[0][0] != "LBRACE_BLOCK":
        raise SyntaxError("Bro, expected '{' to start a block")
    
    tokens.pop(0)  # Remove '{'
    
    statements = []
    
    while tokens and tokens[0][0] != "RBRACE_BLOCK":
        statements.append(parse_statement(tokens))
    
    if not tokens or tokens[0][0] != "RBRACE_BLOCK":
        raise SyntaxError("Bro, expected '}' to end a block")
    
    tokens.pop(0)  # Remove '}'
    
    return statements


def parse_statement(tokens):
    """Parse a single statement."""
    if not tokens:
        raise SyntaxError("Bro, unexpected end of input while parsing a statement")

    token_type, token_value = tokens[0]
    # print(f"Parsing statement: {token_type}, {token_value}")  # Debugging log

    if token_type == "PRINT":
        tokens.pop(0)
        expression = parse_expression(tokens)
        return PrintStatement(expression)
    
    elif token_type == "VAR_DECL":
        tokens.pop(0)
        
        var_name_token_type, var_name_value = tokens.pop(0)
        if var_name_token_type != "IDENTIFIER":
            raise SyntaxError(f"Bro, invalid variable name: {var_name_value}")
        
        equals_token_type, equals_value = tokens.pop(0)
        if equals_value != "=":
            raise SyntaxError("Bro, use '=' to assign values")
        
        value_expression = parse_expression(tokens)
        return VariableDeclaration(var_name_value, value_expression)

    elif token_type == "IF":
        tokens.pop(0)  # Remove 'bro if'
        
        condition = parse_expression(tokens)
        
        if_body = parse_block(tokens)
        
        else_body = None
        if tokens and tokens[0][0] == "ELSE":
            tokens.pop(0)  # Remove 'bro else'
            else_body = parse_block(tokens)
        
        return IfStatement(condition, if_body, else_body)

    elif token_type == "WHILE":
        tokens.pop(0)  # Remove 'keep going bro'
        
        condition = parse_expression(tokens)
        
        body_statements = parse_block(tokens)
        
        return WhileLoop(condition, body_statements)
    
    elif token_type == "INPUT":
        tokens.pop(0)  # Remove 'bro ask'
        var_name_token_type, var_name_value = tokens.pop(0)
        if var_name_token_type != "IDENTIFIER":
            raise SyntaxError(f"Bro, invalid variable name: {var_name_value}")
        return VariableDeclaration(var_name_value, Literal("INPUT"))

    elif token_type == "IDENTIFIER":
        # Handle variable assignment (e.g., x = x - 1)
        var_name_token_type, var_name_value = tokens.pop(0)
        
        if not tokens or tokens[0][1] != "=":
            raise SyntaxError(f"Bro, unexpected token: {var_name_value} while parsing a statement")
        
        tokens.pop(0)  # Remove '='
        value_expression = parse_expression(tokens)
        
        return VariableDeclaration(var_name_value, value_expression)

    else:
        raise SyntaxError(f"Bro, unexpected token: {token_value} while parsing a statement")



def parse(tokens):
    """Parse the entire program."""
    if not tokens or tokens[0][0] != "START":
        raise SyntaxError("Bro, every program must start with 'yo bro'")
    
    if tokens[-1][0] != "END":
        raise SyntaxError("Bro, every program must end with 'peace out bro'")
    
    # Remove START and END tokens
    tokens.pop(0)  # Remove 'START'
    tokens.pop()   # Remove 'END'

    statements = []
    
    while tokens:
        statements.append(parse_statement(tokens))
    
    return Program(statements)

# Testing the parser with if-else and while loops
if __name__ == "__main__":
    from lexer import tokenize

    code = '''
yo bro
bro this is x = 10
bro this is y = 5

# Test if-else statement
bro if x > y {
    bro say "x is greater than y"
} bro else {
    bro say "x is not greater than y"
}

# Test while loop
bro this is counter = 3
keep going bro counter > 0 {
    bro say "Counting down: " + counter
    counter = counter - 1
}

# Test input with if-else
bro ask num
bro if num > 5 {
    bro say "Your number is greater than 5"
} bro else {
    bro say "Your number is less than or equal to 5"
}

peace out bro

'''
    tokens = tokenize(code)
    ast = parse(tokens)
    print(ast)
