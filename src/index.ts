import { globalErrorBucket, initiateGlobals } from './globals';
import { Lexer } from './lexer/lexer';
import { TokenType } from './lexer/token';
import { editDistance } from './utility/distanceAutoCorrect';

// src/index.ts
const filePath = process.argv[2];

if (!filePath) {
    console.error('Usage: bun run src/index.ts <file.orbit>');
    process.exit(1);
}

const src = await Bun.file(filePath).text();
// ...feed `source` into your Lexer

initiateGlobals(src);

const lexer = new Lexer(src);

let token = lexer.nextToken();

while (token.type !== TokenType.EOF) {
    console.log(token);
    token = lexer.nextToken();
}
// after things finished / temp sol for errors
globalErrorBucket.showAll();
