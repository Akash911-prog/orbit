import { Lexer } from './lexer/lexer';

const lexer = new Lexer(' "hello"   ');
console.log(lexer.tokenize());
