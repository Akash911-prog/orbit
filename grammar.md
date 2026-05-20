## Orbit EBNF Grammar

### 1. Program & Source Structure

A program in Orbit is a sequence of top-level declarations, which can be global variable bindings, standard functions, or asynchronous event handlers (`nova`).

```ebnf
Program             = { TopLevelDeclaration } ;

TopLevelDeclaration = VariableDecl | FunctionDecl | NovaDecl | RootOrbitDecl ;

(* The application entry point constraint *)
RootOrbitDecl       = "orbit" "main" Block ;

Block               = "{" { Statement } "}" ;

```

### 2. Statements & Control Flow

Statements govern the execution flow inside blocks, including control flow, resource management, and event triggering.

```ebnf
Statement           = VariableDecl
                    | Assignment
                    | IfStatement
                    | MatchStatement
                    | OrbitBlock
                    | DriftStatement
                    | DecayBlock
                    | FireStatement
                    | ReturnStatement
                    | ExpressionStatement ;

VariableDecl        = "let" Identifier ":" Type "=" Expression ;
Assignment          = Identifier "=" Expression ;
ReturnStatement     = "return" [ Expression ] ;
ExpressionStatement = Expression ;

```

### 3. Control Flow & Pattern Matching

```ebnf
IfStatement         = "if" Expression Block { "else" "if" Expression Block } [ "else" Block ] ;

MatchStatement      = "match" Expression "{" MatchArm { "," MatchArm } [ "," ] "}" ;
MatchArm            = MatchPattern "=>" Expression ;
MatchPattern        = Literal | Identifier | "_" ;

```

### 4. The Execution Lifecycle Quad & Events

This section formalizes Orbit's unique memory-safety and execution primitives.

```ebnf
OrbitBlock          = "orbit" Identifier Block ;
DriftStatement      = "drift" Identifier "->" | "into" Identifier
                    | "drift" Identifier "->" | "into" "shared(" Identifier, Identifier ")"
                    | "drift" Identifier "->" | "into" "sync(" Identifier, Identifier ")" ;
DecayBlock          = "decay" Block | "decay" Identifier ;

NovaDecl            = "nova" Identifier "receives" "(" ParameterList ")" Block ;
FireStatement       = "fire" Identifier "(" [ ArgumentList ] ")" ;

```

### 5. Expressions & Ranges

```ebnf
Expression          = LogicalExpr [ ( ".." | "..=" ) LogicalExpr ] ; (* Includes Ranges *)
LogicalExpr         = EqualityExpr { ( "&&" | "||" ) EqualityExpr } ;
EqualityExpr        = RelationalExpr { ( "==" | "!=" ) RelationalExpr } ;
RelationalExpr      = AdditiveExpr { ( "<" | "<=" | ">" | ">=" ) AdditiveExpr } ;
AdditiveExpr        = MultiplicativeExpr { ( "+" | "-" ) MultiplicativeExpr } ;
MultiplicativeExpr  = PrimaryExpr { ( "*" | "/" ) PrimaryExpr } ;

PrimaryExpr         = Identifier
                    | Literal
                    | FunctionCall
                    | "(" Expression ")" ;

```

### 6. Functions, Parameters, & Types

```ebnf
FunctionDecl        = "fn" Identifier "(" [ ParameterList ] ")" [ ":" Type ] Block ;
ParameterList       = Parameter { "," Parameter } ;
Parameter           = Identifier ":" Type ;

FunctionCall        = Identifier "(" [ ArgumentList ] ")" ;
ArgumentList        = Expression { "," Expression } ;

Type                = "int" | "str" | "bool" | Identifier ;

```

### 7. Lexical Tokens (Identifiers & Literals)

```ebnf
Identifier          = Letter { Letter | Digit | "_" } ;
Literal             = IntLiteral | StrLiteral | BoolLiteral ;

IntLiteral          = Digit { Digit } ;
StrLiteral          = '"' { Character } '"' ;
BoolLiteral         = "true" | "false" ;

Letter              = "a" | ... | "z" | "A" | ... | "Z" ;
Digit               = "0" | ... | "9" ;
Character           = ? Any Unicode character except '"' or "\" ? ;

```

---

If a top-level declaration can be an `orbit` block named `main`, it transforms `main` into the application's root entry point and baseline execution context. This means the entire program starts execution inside a tracked stack frame with its own responsibility record and a root `decay` layer.

Here is how the grammar rules change to adapt to this design, along with the architectural implications.

---

## 8. Updated Code Structure Example

With this rule, a standard Orbit application would look like this:

```orbit
// Top-level variable declaration
let GLOBAL_CONFIG: str = "/etc/orbit/config"

// The Root Orbit Execution Frame
orbit main {
    let logger = init_logger()
    
    // Root decay block: Guaranteed to run when the application gracefully terminates
    decay {
        logger.flush()
        logger.close()
    }
    
    let server = start_server(GLOBAL_CONFIG)
    fire handle_traffic(server)
}

nova handle_traffic(s: Server) {
    // Background execution loop
}

```

---

## 9. Architectural & Compiler Implications

Making the top-level declaration an `orbit main` block instead of a standard `fn main()` introduces powerful systems-level benefits:

### A. The Root Lifecycle Chain

Every resource initialized inside `orbit main` is instantly bound to the application's ultimate stack boundary.

* If a background `nova` event is still running when `orbit main` hits its closing brace, **Rule 2 (The Nova Asynchronous Capture Rule)** activates.
* The background tasks automatically inherit full ownership of whatever root resources they were reading, preventing standard "use-after-free" or "dropped context" panics at shutdown.

### B. The Absolute Bottom Decay Layer

Any `decay` block defined directly inside `orbit main` acts as the application's global cleanup routine. It replaces traditional `atexit` functions or manual shutdown hooks. Whether the application completes normally or suffers an asynchronous panic, the root decay chain is guaranteed by the compiler to unwind cleanly.

### C. Structural Layout Constraint

Because `orbit` establishes an explicit tracking boundary on a stack frame, a top-level `orbit main` means the application doesn't just call a main function—it boots *directly* into a monitored tracking state.

## Key Grammar Notes on Orbit's Design

* **The Semicolon-less Design:** The grammar assumes newline-separated or whitespace-separated statements, matching your design snippets (e.g., `let x: int = 5` without a trailing `;`).
* **Condition Syntax:** In `IfStatement`, there are explicitly **no parentheses** allowed around the conditional `Expression`, making `if x > 0` standard and `if (x > 0)` a syntax error unless evaluating an explicit sub-expression.
* **Type vs Production Separation:** The grammar enforces strict segregation between `:` (used strictly in `VariableDecl`, `Parameter`, and `FunctionDecl` return paths) and `=>` (used exclusively in `MatchArm`).
* **Range Precedence:** Ranges (`..` and `..=`) are integrated right at the outer expression layer, giving them appropriate structural evaluation room without mathematical symbol clashing.