export enum TokenType {
    // Section 7: Lexical Tokens
    Identifier = "IDENTIFIER",
    IntLiteral = "INT_LITERAL",
    StrLiteral = "STR_LITERAL",
    BoolLiteral = "BOOL_LITERAL",

    // Keywords (Derived from Identifiers during scanning)
    KeywordOrbit = "orbit",
    KeywordMain = "main",
    KeywordLet = "let",
    KeywordInt = "int",
    KeywordStr = "str",
    KeywordBool = "bool",

    // Structural Operators & Punctuators
    Equals = "=",
    Colon = ":",
    OpenBrace = "{",
    CloseBrace = "}",
    OpenParen = "(",
    CloseParen = ")",
    
    EOF = "EOF"
}

export interface Token {
    type: TokenType;
    value: string; // The exact text matched (lexeme)
    line: number;  // Crucial for error tracking
    col: number;
}