export class Order {
  constructor(
    public readonly id: string,
    public userId: string,
    public items: OrderItem[],
    public totalPrice: number,
    public status: OrderStatus,
    public createdAt: Date
  ) {}
}

export enum OrderStatus {
  CREATED = "CREATED",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}