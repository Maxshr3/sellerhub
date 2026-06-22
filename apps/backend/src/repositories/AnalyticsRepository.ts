import { prisma } from "../database/prisma";

export class AnalyticsRepository {
  async getOrdersAggregate() {
    return prisma.order.aggregate({
      _sum: {
        totalPrice: true,
        quantity: true,
      },
      _count: {
        id: true,
      },
    });
  }

  async getProductsAggregate() {
    const [totalProducts, activeProducts, lowStockProducts, stockAggregate] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({
          where: {
            isActive: true,
          },
        }),
        prisma.product.count({
          where: {
            isActive: true,
            stock: {
              lte: 10,
            },
          },
        }),
        prisma.product.aggregate({
          _sum: {
            stock: true,
          },
          where: {
            isActive: true,
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

  async getReviewsAggregate() {
    return prisma.review.aggregate({
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });
  }

  async getUnansweredReviewsCount() {
    return prisma.review.count({
      where: {
        status: "NEW",
      },
    });
  }

  async getProductAnalyticsAggregate() {
    return prisma.productAnalytics.aggregate({
      _sum: {
        views: true,
        ordersCount: true,
        revenue: true,
      },
    });
  }

  async getOrderStatusCounts() {
    return prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });
  }

  async findOrdersWithMarketplace() {
    return prisma.order.findMany({
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

  async findLowStockProducts() {
    return prisma.product.findMany({
      where: {
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

  async findTopProducts() {
    return prisma.productAnalytics.findMany({
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
}