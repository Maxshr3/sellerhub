export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public password: string,
    public role: UserRole,
    public createdAt: Date
  ) {}
}

export enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
}