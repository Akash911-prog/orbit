export enum ErrorType {
    SyntaxError = 'SYNTAX_ERROR',
    ReferenceError = 'REFERENCE_ERROR',
    TypeError = 'TYPE_ERROR',
    RangeError = 'RANGE_ERROR',
    RuntimeError = 'RUNTIME_ERROR',
    LogicalError = 'LOGICAL_ERROR',
    CompilationError = 'COMPILATION',

    // --- LEXER / AUTOCORRECT LAYER ---
    MispelledIdentifier = 'MISPELLED_IDENTIFIER', // A token that closely matches a known keyword or variable
}
