import { prisma } from "../database/prisma";
import { DashboardAnalyticsQueryDto } from "../dto/AnalyticsDto";

export class AnalyticsRepository {
  async findMarketplaceOptions() {
    return prisma.marketplace.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
    });
  }

  async getOrdersAggregate(query: DashboardAnalyticsQueryDto) {
    return prisma.order.aggregate({
      where: this.buildOrderWhere(query),
      _sum: {
        totalPrice: true,
        quantity: true,
      },
      _count: {
        id: true,
      },
    });
  }

  async getProductsAggregate(query: DashboardAnalyticsQueryDto) {
    const productWhere = this.buildProductWhere(query);

    const [totalProducts, activeProducts, lowStockProducts, stockAggregate] =
      await Promise.all([
        prisma.product.count({
          where: productWhere,
        }),
        prisma.product.count({
          where: {
            ...productWhere,
            isActive: true,
          },
        }),
        prisma.product.count({
          where: {
            ...productWhere,
            isActive: true,
            stock: {
              lte: 10,
            },
          },
        }),
        prisma.product.aggregate({
          where: {
            ...productWhere,
            isActive: true,
          },
          _sum: {
            stock: true,
          },
        }),
      ]);

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalStock: stockAggregate._sum.stock ?? 0,
    };
  }

  async getReviewsAggregate(query: DashboardAnalyticsQueryDto) {
    return prisma.review.aggregate({
      where: this.buildReviewWhere(query),
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });
  }

  async getUnansweredReviewsCount(query: DashboardAnalyticsQueryDto) {
    return prisma.review.count({
      where: {
        ...this.buildReviewWhere(query),
        status: "NEW",
      },
    });
  }

  async getProductAnalyticsAggregate(query: DashboardAnalyticsQueryDto) {
    return prisma.productAnalytics.aggregate({
      where: this.buildProductAnalyticsWhere(query),
      _sum: {
        views: true,
        ordersCount: true,
        revenue: true,
      },
    });
  }

  async getOrderStatusCounts(query: DashboardAnalyticsQueryDto) {
    return prisma.order.groupBy({
      by: ["status"],
      where: this.buildOrderWhere(query),
      _count: {
        id: true,
      },
    });
  }

  async findOrdersWithMarketplace(query: DashboardAnalyticsQueryDto) {
    return prisma.order.findMany({
      where: this.buildOrderWhere(query),
      include: {
        marketplace: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async findLowStockProducts(query: DashboardAnalyticsQueryDto) {
    return prisma.product.findMany({
      where: {
        ...this.buildProductWhere(query),
        isActive: true,
        stock: {
          lte: 10,
        },
      },
      include: {
        marketplace: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        stock: "asc",
      },
      take: 5,
    });
  }

  async findTopProducts(query: DashboardAnalyticsQueryDto) {
    return prisma.productAnalytics.findMany({
      where: this.buildProductAnalyticsWhere(query),
      include: {
        product: {
          include: {
            marketplace: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        revenue: "desc",
      },
      take: 5,
    });
  }

  async findProblemProducts(query: DashboardAnalyticsQueryDto) {
    return prisma.product.findMany({
      where: this.buildProductWhere(query),
      include: {
        marketplace: {
          select: {
            name: true,
            type: true,
          },
        },
        reviews: {
          select: {
            status: true,
            rating: true,
          },
        },
        analytics: {
          where: this.buildAnalyticsDateWhere(query),
          select: {
            views: true,
            ordersCount: true,
            conversionRate: true,
          },
        },
      },
      orderBy: {
        stock: "asc",
      },
      take: 20,
    });
  }

  private buildOrderWhere(query: DashboardAnalyticsQueryDto) {
    return {
      ...(query.marketplaceId ? { marketplaceId: query.marketplaceId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            orderedAt: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };
  }

  private buildProductWhere(query: DashboardAnalyticsQueryDto) {
    return {
      ...(query.marketplaceId ? { marketplaceId: query.marketplaceId } : {}),
    };
  }

  private buildReviewWhere(query: DashboardAnalyticsQueryDto) {
    return {
      ...(query.marketplaceId
        ? {
            product: {
              marketplaceId: query.marketplaceId,
            },
          }
        : {}),
    };
  }

  private buildProductAnalyticsWhere(query: DashboardAnalyticsQueryDto) {
    return {
      ...this.buildAnalyticsDateWhere(query),
      ...(query.marketplaceId
        ? {
            product: {
              marketplaceId: query.marketplaceId,
            },
          }
        : {}),
    };
  }

  private buildAnalyticsDateWhere(query: DashboardAnalyticsQueryDto) {
    return {
      ...(query.dateFrom || query.dateTo
        ? {
            date: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };
  }
}