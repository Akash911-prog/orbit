import { alphCap, whitespace } from '../regex';
import type { Token } from './token';

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
        const char = this.source[this.cursor++] as string;
        if (char === '\n') {
            this.line += 1;
            this.col = 1;
        } else {
            this.col += 1;
        }
        return char;
    }

    private tokenize(): Token[] {
        const tokens: Token[] = [];
        let char = this.peek();

        while (this.cursor < this.source.length) {
            const char = this.peek();

            if (whitespace.test(char)) {
                this.next();
                continue;
            }

            if (char === '"') {
                tokens.push;
            }
        }
    }

    private readLiteralString(): string {
        const literal = '';
        const startLine = this.line;
        const startCol = this.col;

        while (/alphCap|alphSmall|underscore/.test(this.peek())) this.next();
    }
}
