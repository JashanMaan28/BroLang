import re

TOKENS = [
    ("START", r"yo bro|wassup fam|let’s roll gang"),
    ("END", r"peace out bro|gtfo bro|catch you later fam|vibe out squad"),
    ("PRINT", r"bro say|fam spill|yeet the tea|drop the vibe"),
    ("VAR_DECL", r"bro this is|fam got|slay with|flexin’ with"),
    ("INPUT", r"bro ask|fam hit me|spill the tea|what’s good"),
    ("IF", r"bro if|fam if|slay if|vibe check if"),
    ("ELSE", r"bro else|fam nah|no cap else|bet else"),
    ("WHILE", r"keep going bro|vibe loop fam|slay cycle|grind till"),
    ("NUMBER", r"\d+"),
    ("STRING", r'"[^"]*"'),
    ("IDENTIFIER", r"[a-zA-Z_][a-zA-Z0-9_]*"),
    ("OPERATOR", r"[+\-*/%=<>!]=?|=="),
    ("LPAREN", r"\("),
    ("RPAREN", r"\)"),
    ("LBRACE_BLOCK", r"\{"),
    ("RBRACE_BLOCK", r"\}"),
    ("NEWLINE", r"\n"),
    ("WHITESPACE", r"[ \t]+"),
    ("COMMENT", r"#.*"),
]

def tokenize(code):
    """
    Converts source code into a list of tokens.
    """
    tokens = []
    line_number = 1
    while code:
        matched = False
        for token_type, pattern in TOKENS:
            regex = re.compile(pattern)
            match = regex.match(code)
            if match:
                matched = True
                value = match.group(0)
                if token_type == "NEWLINE":
                    line_number += 1
                elif token_type in ["WHITESPACE", "COMMENT"]:
                    pass  # Skip whitespace and comments
                else:
                    tokens.append((token_type, value))
                code = code[len(value):]
                break
        if not matched:
            raise SyntaxError(f"Yo, what even is this: {code[0]}? Line {line_number} is straight-up sus, bro!")
    return tokens

if __name__ == "__main__":
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
    for token in tokens:
        print(token)
