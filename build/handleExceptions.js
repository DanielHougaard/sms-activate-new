"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSActivateError = void 0;
class SMSActivateError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.stack = new Error(message).stack;
    }
}
exports.SMSActivateError = SMSActivateError;
