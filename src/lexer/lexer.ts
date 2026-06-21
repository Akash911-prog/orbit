import { KEYWORDS } from '../constants';
import { globalErrorBucket } from '../globals';
import {
    alphanum,
    alphCap,
    aplhaAll,
    digit,
    digitAndDot,
    symbolStart,
    whitespace,
} from '../regex';
import { editDistance } from '../utility/distanceAutoCorrect';
import { TokenType, type Token } from './token';

import type { OrbitError } from '../errors/errorList';
import { ErrorType } from '../errors/errorTypes';

export class Lexer {
    private source = '';
    private cursor = 0;
    private line = 1;
    private col = 1;

    constructor(source: string) {
        this.source = source;
    }

    private peek(): string {
        return this.cursor < this.source.length
            ? this.source[this.cursor]!
            : '';
    }

    private next(): string {
        const char = this.source[this.cursor] as string;
        if (char === '\n') {
            this.line += 1;
            this.col = 1;
        } else {
            this.col += 1;
        }
        this.cursor = this.cursor + 1;
        return char;
    }

    private isEnd(): boolean {
        return this.cursor < this.source.length ? false : true;
    }

    nextToken(): Token {
        // skip whitespace before every token, same as before
        while (!this.isEnd() && whitespace.test(this.peek())) {
            this.next();
        }

        if (this.isEnd()) {
            return {
                type: TokenType.EOF,
                value: '',
                line: this.line,
                col: this.col,
            };
        }

        const char = this.peek();

        if (char === '"') {
            return this.readLiteralString();
        }

        if (aplhaAll.test(char)) {
            return this.readIdentifierString();
        }

        if (digit.test(char)) {
            return this.readNumber();
        }

        if (symbolStart.test(char)) {
        }

        // TODO: you'll need a branch here for operators/punctuation
        // (+, -, {, }, (, ), etc) — your current tokenize() doesn't
        // handle these yet either, so this isn't a regression, just
        // flagging it's the next thing you'll hit.
        throw new Error(
            `Unexpected character '${char}' at line ${this.line}, col ${this.col}`
        );
    }

    private readLiteralString(): Token {
        let literal = '';
        const startLine = this.line;
        const startCol = this.col;
        this.next(); // consume opening "

        while (this.peek() !== '"') {
            literal += this.peek();
            if (this.isEnd()) break;
            this.next();
        }

        // FIX: this was missing before — you need to consume the
        // closing quote HERE, inside the function, not in the caller.
        // Your old tokenize() did `this.next()` after pushing the token,
        // which worked by coincidence (since '"' fails the alpha check),
        // but it's fragile. This is the correct place for it.
        if (!this.isEnd()) {
            this.next(); // consume closing "
        }

        const token: Token = {
            type: TokenType.StrLiteral,
            value: literal,
            line: startLine,
            col: startCol,
        };

        return token;
    }

    private readIdentifierString(): Token {
        let identifier = '';
        const startLine = this.line;
        const startCol = this.col;

        while (!this.isEnd() && alphanum.test(this.peek())) {
            identifier += this.peek();
            this.next();
        }

        const keyword = this.isKeyword(identifier, this.line, this.col);

        if (keyword) {
            const token: Token = {
                type: keyword.type,
                value: keyword.value,
                line: startLine,
                col: startCol,
            };

            return token;
        }

        const token: Token = {
            type: TokenType.Identifier,
            value: identifier,
            line: startLine,
            col: startCol,
        };

        return token;
    }

    private isKeyword(
        str: string,
        line: number,
        col: number
    ): { type: TokenType; value: string } | null {
        const word = KEYWORDS[str];

        if (!word) {
            for (const key in KEYWORDS) {
                if (!Object.hasOwn(KEYWORDS, key)) continue;

                const keyword = KEYWORDS[key]!;
                const { passesConfidence } = editDistance(str, keyword);

                if (passesConfidence) {
                    const error: OrbitError = {
                        type: ErrorType.ReferenceError,
                        message: `Did you mean ${keyword}?`,
                        line: line,
                        col: col,
                        length: str.length,
                    };
                    globalErrorBucket.add(error);
                }
            }
            return null;
        }

        if (['true', 'false'].includes(word)) {
            return { type: TokenType.BoolLiteral, value: word };
        }

        return { type: word, value: word };
    }

    private readNumber(): Token {
        let number = '';
        const startLine = this.line;
        const startCol = this.col;

        let tokenType = TokenType.IntLiteral;

        while (!this.isEnd() && digitAndDot.test(this.peek())) {
            number += this.peek();
            this.next();
        }

        if (number.includes('.')) {
            tokenType = TokenType.FloatLiteral;
        }

        const token: Token = {
            type: tokenType,
            value: number,
            line: startLine,
            col: startCol,
        };

        return token;
    }
}
