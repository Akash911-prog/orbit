import { ErrorType } from '../errors/errorTypes';
import { globalErrorBucket } from '../globals';
import type { Lexer } from '../lexer/lexer';
import { TokenType, type Token } from '../lexer/token';
import type { Program, TopLevelDeclaration, VariableDecl } from './nodeTypes';

export class Parser {
    private current: Token;
    private lookahead: Token[] = [];
    private lexer: Lexer;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.current = this.lexer.nextToken();
    }

    private peek(offset: number): Token {
        // offset 0 is the token after current and offset 1 is the token after-after current
        if (this.lookahead.length === 0) {
            this.lookahead.push(this.lexer.nextToken());
            this.lookahead.push(this.lexer.nextToken());
        }

        return this.lookahead[offset]!;
    }

    private consume(): Token {
        const prev = this.current;
        if (!this.lookahead[0]) {
            this.current = this.lexer.nextToken();
            return prev;
        }
        this.current = this.lookahead[0];
        this.lookahead.shift();
        this.lookahead.push(this.lexer.nextToken());
        return prev;
    }

    private expect(tokenType: TokenType): Token {
        if (this.current.type !== tokenType) {
            globalErrorBucket.add({
                type: ErrorType.SyntaxError,
                message: `Expected ${tokenType} but found ${this.current.type}`,
                line: this.current.line,
                col: this.current.col,
                length: this.current.value.length,
            });
        }
        return this.consume();
    }

    parseProgram(): Program {
        const declarations: TopLevelDeclaration[] = [];
        while (this.current.type !== TokenType.EOF) {
            declarations.push(this.parseTopLevelDeclaration());
        }
        return { type: 'Program', declarations };
    }

    private parseTopLevelDeclaration(): TopLevelDeclaration {
        switch (this.current.type) {
            case TokenType.KeywordLet:
            case TokenType.KeywordVar:
                return this.parseVariableDeclaration();
            case TokenType.KeywordFn:
                return this.parseFunctionDecl();
            case TokenType.KeywordStruct:
                return this.parseStructDecl();
            case TokenType.KeywordNova:
                return this.parseNovaDecl();
            case TokenType.KeywordOrbit:
                return this.parseRootOrbitDecl();
            default:
                throw new Error('Out of bound');
        }
    }
    private parseStructDecl(): TopLevelDeclaration {
        throw new Error('Method not implemented.');
    }
    private parseNovaDecl(): TopLevelDeclaration {
        throw new Error('Method not implemented.');
    }
    private parseRootOrbitDecl(): TopLevelDeclaration {
        throw new Error('Method not implemented.');
    }
    private parseFunctionDecl(): TopLevelDeclaration {
        throw new Error('Method not implemented.');
    }
    private parseVariableDeclaration(): VariableDecl {
        throw new Error('Method not implemented.');
    }
}
