# Orbit Lexer — Token Coverage

Status as of the pull-based `nextToken()` rewrite. Based on actual scanning
logic in `lexer.ts`, not the enum's existence — a TokenType can exist and
still not be reachable if nothing in the lexer produces it.

## Done

Handled by an actual scanning path in `nextToken()`.

- [x] `Identifier` — `readIdentifierString()`, falls through when `isKeyword` returns null
- [x] `StrLiteral` — `readLiteralString()`, triggered on `"`
- [x] `BoolLiteral` — `isKeyword()`, special-cased for `'true'`/`'false'`
- [x] `EOF` — `nextToken()`, returned once `isEnd()` is true
- [x] `KeywordOrbit`
- [x] `KeywordMain`
- [x] `KeywordLet`
- [x] `KeywordInt`
- [x] `KeywordStr`
- [x] `KeywordBool`
- [x] `KeywordStruct`
- [x] `KeywordFn`
- [x] `KeywordVar`
- [x] `KeywordPrint`
- [x] `KeywordIf`
- [x] `KeywordElse`
- [x] `KeywordFor`
- [x] `KeywordWhile`
- [x] `KeywordLoop`
- [x] `KeywordIn`
- [x] `KeywordReturn`
- [x] `KeywordBreak`
- [x] `KeywordContinue`
- [x] `KeywordMatch`
- [x] `KeywordTrue`
- [x] `KeywordFalse`
- [x] `KeywordFloat`

All keywords come from one generic lookup in `isKeyword()` — any string key present in `KEYWORDS` works automatically.

**Caveat:** this assumes `KEYWORDS` actually contains every keyword string above. If you added a keyword to the `TokenType` enum but forgot to add it to the `KEYWORDS` object, it'll silently lex as a plain `Identifier` instead — worth a manual diff between the enum and the constant.

## Not started

Nothing in `nextToken()` branches on these characters yet — hitting any of them currently throws `Unexpected character` from the fallthrough at the bottom of `nextToken()`.

**Literals**
- [x] `IntLiteral` — digits — **highest priority, no number lexing exists at all right now**
- [x] `FloatLiteral` — digits + `.` — blocked on IntLiteral logic existing first

**Member access / ranges**
- [x] `Dot` — `.`
- [x] `DotDot` — `..`
- [x] `DotDotEquals` — `..=`

**Arrows**
- [x] `Arrow` — `->` (drift / return type, semantics still undecided per your own enum comment)
- [x] `FatArrow` — `=>` (match arms)

**Brackets / braces / parens**
- [x] `OpenBracket` — `[`
- [x] `CloseBracket` — `]`
- [x] `OpenBrace` — `{`
- [x] `CloseBrace` — `}`
- [x] `OpenParen` — `(`
- [x] `CloseParen` — `)`

**Separators**
- [x] `Colon` — `:`
- [x] `Comma` — `,`
- [x] `Semicolon` — `;`

**Assignment**
- [x] `Equals` — `=`
- [x] `PlusEquals` — `+=`
- [x] `MinusEquals` — `-=`
- [x] `StarEquals` — `*=`
- [x] `SlashEquals` — `/=`
- [x] `PercentEquals` — `%=`

**Arithmetic**
- [ ] `Add` — `+`
- [ ] `Subtract` — `-`
- [ ] `Multiply` — `*`
- [ ] `Divide` — `/`
- [ ] `Modulo` — `%`

**Logical**
- [ ] `LogicalAnd` — `&&`
- [ ] `LogicalOr` — `||`
- [ ] `LogicalNot` — `!`

**Comparison**
- [x] `DoubleEquals` — `==`
- [x] `NotEquals` — `!=`
- [x] `LessThan` — `<`
- [x] `LessThanEquals` — `<=`
- [x] `GreaterThan` — `>`
- [x] `GreaterThanEquals` — `>=`

**Unary**
- [x] `Increment` — `++`
- [x] `Decrement` — `--`

That's **every symbol/punctuator/operator token in the enum — zero implemented.** The lexer currently only handles whitespace, identifiers/keywords, and string literals.

## Why this matters right now, not later

`let x = 5;` cannot lex past `let` and `x` today — `=`, `5`, and `;` all hit the `throw new Error('Unexpected character...')` fallthrough. This isn't a "nice to have eventually" gap, it's the wall you'll hit on your very first real test input. Numbers and punctuators are the next thing to build, not operators-as-a-polish-pass.

## Suggested build order

1. **`IntLiteral`** — digit-scanning loop, same shape as `readIdentifierString` but for `/[0-9]/`
2. **`FloatLiteral`** — extend the digit scanner to handle one `.` inside the run (careful: this is where it'll collide with `Dot`/`DotDot`/`DotDotEquals` lexing — decide if `.` starts a float scan or a dot-token scan based on whether a digit precedes/follows)
3. **Single-char punctuators** — `{ } ( ) [ ] , ; :` — these are unambiguous, one char, no lookahead needed, fastest win
4. **Multi-char operators requiring 1-char lookahead** — `==`, `!=`, `<=`, `>=`, `&&`, `||`, `++`, `--`, `+=`, `-=`, `*=`, `/=`, `%=` — each starts with a char that's *also* valid alone (`=`, `!`, `<`, `>`, `+`, `-`, `&`, `|`), so you peek one further char to decide single vs. double
5. **The `.` family** — `.` vs `..` vs `..=` — needs up to 2 chars of lookahead past the first `.`
6. **`->` and `=>`** — straightforward 1-lookahead pairs, same pattern as step 4

Steps 3–6 all live in the same place: a new branch in `nextToken()`, probably a `readOperatorOrPunctuator()` method mirroring the structure `readIdentifierString()` already has — peek, decide, consume, return token.