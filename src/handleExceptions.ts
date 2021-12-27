class SMSActivateError extends Error {
    message: string;
    constructor(message: string) {
        super(message);

        this.message = message;
        this.stack = new Error(message).stack;
    }
}

export { SMSActivateError };
