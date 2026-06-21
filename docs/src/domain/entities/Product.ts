export class Product {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public price: number,
    public stock: number,
    public sellerId: string,
    public createdAt: Date
  ) {}
}