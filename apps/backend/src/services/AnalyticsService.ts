import {
  AnalyticsProductDto,
  DashboardAnalyticsDto,
  TopProductDto,
} from "../dto/AnalyticsDto";
import { AnalyticsRepository } from "../repositories/AnalyticsRepository";

type LowStockProductFromDatabase = Awaited<
  ReturnType<AnalyticsRepository["findLowStockProducts"]>
>[number];

type TopProductFromDatabase = Awaited<
  ReturnType<AnalyticsRepository["findTopProducts"]>
>[number];

export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getDashboardAnalytics(): Promise<DashboardAnalyticsDto> {
    const [
      ordersAggregate,
      productsAggregate,
      reviewsAggregate,
      productAnalyticsAggregate,
      lowStockProducts,
      topProducts,
    ] = await Promise.all([
      this.analyticsRepository.getOrdersAggregate(),
      this.analyticsRepository.getProductsAggregate(),
      this.analyticsRepository.getReviewsAggregate(),
      this.analyticsRepository.getProductAnalyticsAggregate(),
      this.analyticsRepository.findLowStockProducts(),
      this.analyticsRepository.findTopProducts(),
    ]);

    const totalViews = productAnalyticsAggregate._sum.views ?? 0;
    const analyticsOrdersCount =
      productAnalyticsAggregate._sum.ordersCount ?? 0;

    const conversionRate =
      totalViews > 0
        ? ((analyticsOrdersCount / totalViews) * 100).toFixed(2)
        : "0.00";

    return {
      summary: {
        totalRevenue: ordersAggregate._sum.totalPrice?.toString() ?? "0",
        totalOrders: ordersAggregate._count.id,
        totalSoldItems: ordersAggregate._sum.quantity ?? 0,
        totalProducts: productsAggregate.totalProducts,
        activeProducts: productsAggregate.activeProducts,
        lowStockProducts: productsAggregate.lowStockProducts,
        averageRating:
          reviewsAggregate._avg.rating !== null
            ? reviewsAggregate._avg.rating.toFixed(2)
            : null,
        totalViews,
        conversionRate,
      },
      lowStockProducts: lowStockProducts.map((product) =>
        this.mapProductToAnalyticsProduct(product),
      ),
      topProducts: topProducts.map((item) => this.mapTopProduct(item)),
    };
  }

  private mapProductToAnalyticsProduct(
    product: LowStockProductFromDatabase,
  ): AnalyticsProductDto {
    return {
      id: product.id,
      title: product.title,
      sku: product.sku,
      marketplaceName: product.marketplace.name,
      marketplaceType: product.marketplace.type,
      price: product.price.toString(),
      stock: product.stock,
      rating: product.rating ? product.rating.toString() : null,
    };
  }

  private mapTopProduct(item: TopProductFromDatabase): TopProductDto {
    return {
      id: item.product.id,
      title: item.product.title,
      sku: item.product.sku,
      marketplaceName: item.product.marketplace.name,
      marketplaceType: item.product.marketplace.type,
      price: item.product.price.toString(),
      stock: item.product.stock,
      rating: item.product.rating ? item.product.rating.toString() : null,
      revenue: item.revenue.toString(),
      ordersCount: item.ordersCount,
      views: item.views,
    };
  }
}