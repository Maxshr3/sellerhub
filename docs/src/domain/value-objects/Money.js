"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
class Money {
    constructor(amount) {
        if (amount < 0) {
            throw new Error("Money cannot be negative");
        }
        this.amount = amount;
    }
    add(other) {
        return new Money(this.amount + other.amount);
    }
    multiply(multiplier) {
        return new Money(this.amount * multiplier);
    }
    getValue() {
        return this.amount;
    }
}
exports.Money = Money;
