import {
  CreateProductRequestDto,
  ProductDetailResponseDto,
  ProductListQueryDto,
  ProductResponseDto,
  UpdateProductRequestDto,
} from "../dto/ProductDto";
import { ProductRepository } from "../repositories/ProductRepository";

type ProductFromDatabase = Awaited<
  ReturnType<ProductRepository["findProducts"]>
>[number];

type ProductDetailFromDatabase = NonNullable<
  Awaited<ReturnType<ProductRepository["findProductById"]>>
>;

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts(filters: ProductListQueryDto): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findProducts(filters);

    return products.map((product) => this.mapProductToResponse(product));
  }

  async getProductById(id: string): Promise<ProductDetailResponseDto | null> {
    const product = await this.productRepository.findProductById(id);

    if (!product) {
      return null;
    }

    return this.mapProductDetailToResponse(product);
  }

  async createProduct(
    data: CreateProductRequestDto,
  ): Promise<ProductResponseDto | null> {
    const marketplace = await this.productRepository.findMarketplaceById(
      data.marketplaceId,
    );

    if (!marketplace) {
      return null;
    }

    const product = await this.productRepository.createProduct(data);

    return this.mapProductToResponse(product);
  }

  async updateProduct(
    id: string,
    data: UpdateProductRequestDto,
  ): Promise<ProductResponseDto | null> {
    const existingProduct = await this.productRepository.findProductById(id);

    if (!existingProduct) {
      return null;
    }

    const product = await this.productRepository.updateProduct(id, data);

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

  private mapProductDetailToResponse(
    product: ProductDetailFromDatabase,
  ): ProductDetailResponseDto {
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
      reviews: product.reviews.map((review) => ({
        id: review.id,
        authorName: review.authorName,
        rating: review.rating,
        text: review.text,
        status: review.status,
        answerText: review.answerText,
        createdAt: review.createdAt.toISOString(),
      })),
      analytics: product.analytics.map((item) => ({
        id: item.id,
        date: item.date.toISOString(),
        views: item.views,
        ordersCount: item.ordersCount,
        revenue: item.revenue.toString(),
        conversionRate: item.conversionRate.toString(),
      })),
      recommendations: product.aiRecommendations.map((recommendation) => ({
        id: recommendation.id,
        type: recommendation.type,
        title: recommendation.title,
        content: recommendation.content,
        isApplied: recommendation.isApplied,
        createdAt: recommendation.createdAt.toISOString(),
      })),
    };
  }
}