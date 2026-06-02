import { Lexer } from './lexer/lexer';
import { initGlobalSymbolTable } from './symbolTable/symbolTable';
import { editDistance } from './utility/distanceAutoCorrect';

const globalTable = initGlobalSymbolTable();

const lexer = new Lexer('"hello" world');
console.log(lexer.tokenize());

console.log(editDistance('orbit', 'orbit'));
