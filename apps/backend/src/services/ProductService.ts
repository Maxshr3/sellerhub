import { ProductResponseDto, ProductListQueryDto } from "../dto/ProductDto";
import { ProductRepository } from "../repositories/ProductRepository";

type ProductFromDatabase = Awaited<
  ReturnType<ProductRepository["findAll"]>
>[number];

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts(filters: ProductListQueryDto): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findAll(filters);

    return products.map((product) => this.mapProductToResponse(product));
  }

  async getProductById(id: string): Promise<ProductResponseDto | null> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      return null;
    }

    return this.mapProductToResponse(product);
  }

  private mapProductToResponse(product: ProductFromDatabase): ProductResponseDto {
    return {
      id: product.id,
      marketplaceId: product.marketplaceId,
      marketplaceName: product.marketplace.name,
      marketplaceType: product.marketplace.type,
      title: product.title,
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock,
      rating: product.rating ? product.rating.toString() : null,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}