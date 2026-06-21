export class Money {
  private readonly amount: number;

  constructor(amount: number) {
    if (amount < 0) {
      throw new Error("Money cannot be negative");
    }
    this.amount = amount;
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  multiply(multiplier: number): Money {
    return new Money(this.amount * multiplier);
  }

  getValue(): number {
    return this.amount;
  }
}