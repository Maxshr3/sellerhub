"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
class Password {
    constructor(password) {
        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }
        this.value = password;
    }
    getValue() {
        return this.value;
    }
}
exports.Password = Password;
