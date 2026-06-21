"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
class Email {
    constructor(email) {
        if (!this.validate(email)) {
            throw new Error("Invalid email format");
        }
        this.value = email;
    }
    validate(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    getValue() {
        return this.value;
    }
}
exports.Email = Email;
