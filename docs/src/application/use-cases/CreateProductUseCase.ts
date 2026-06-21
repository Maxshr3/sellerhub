import { Product } from "../../domain/entities/Product";

export interface CreateProductDTO {
  title: string;
  description: string;
  price: number;
  stock: number;
  sellerId: string;
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: any) {}

  async execute(dto: CreateProductDTO): Promise<Product> {
    const product = new Product(
      crypto.randomUUID(),
      dto.title,
      dto.description,
      dto.price,
      dto.stock,
      dto.sellerId,
      new Date()
    );

    await this.productRepository.save(product);

    return product;
  }
}