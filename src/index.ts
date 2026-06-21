import { globalErrorBucket, initiateGlobals } from './globals';
import { Lexer } from './lexer/lexer';
import { TokenType } from './lexer/token';
import { editDistance } from './utility/distanceAutoCorrect';

const src = ' 48588  203949.4545';

initiateGlobals(src);

const lexer = new Lexer(src);

let token = lexer.nextToken();

while (token.type !== TokenType.EOF) {
    console.log(token);
    token = lexer.nextToken();
}
// after things finished / temp sol for errors
globalErrorBucket.showAll();
