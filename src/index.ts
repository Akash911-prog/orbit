import { globalErrorBucket, initiateGlobals } from './globals';
import { Lexer } from './lexer/lexer';
import { editDistance } from './utility/distanceAutoCorrect';

const src = 'true break';

initiateGlobals(src);

const lexer = new Lexer(src);

// after things finished / temp sol for errors
globalErrorBucket.showAll();
