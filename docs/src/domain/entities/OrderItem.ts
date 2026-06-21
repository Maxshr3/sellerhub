export class OrderItem {
  constructor(
    public readonly productId: string,
    public quantity: number,
    public price: number
  ) {}
}