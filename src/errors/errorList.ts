import type { ErrorType } from './errorTypes';

type Error = {
    type: ErrorType;
    message: string;
};

class ErrorBucket {
    private ErrorStack: Error[] = [];

    add(error: Error) {
        this.ErrorStack.push(error);
    }

    showall(): void {
        if (this.ErrorStack.length === 0) return;
        console.log(this.ErrorStack.pop());
        this.showall();
    }
}

export const globalErrorBucket = new ErrorBucket();
