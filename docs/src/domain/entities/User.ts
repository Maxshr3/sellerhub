import { Email } from "../value-objects/Email";
import { Password } from "../value-objects/Password";

export enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
}

export class User {
  constructor(
    public readonly id: string,
    public email: Email,
    public password: Password,
    public role: UserRole,
    public createdAt: Date
  ) {}
}