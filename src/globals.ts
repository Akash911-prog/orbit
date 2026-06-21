import type { SymbolTable } from './symbolTable/symbolTable';
import { initGlobalSymbolTable } from './symbolTable/symbolTable';
import { createGlobalErrorBucket, ErrorBucket } from './errors/errorList';

export let globalTable: SymbolTable;
export let globalErrorBucket: ErrorBucket;

export function initiateGlobals(src: string) {
    globalTable = initGlobalSymbolTable();
    globalErrorBucket = createGlobalErrorBucket(src);
}
