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
    const [totalProducts, activeProducts, lowStockProducts] = await Promise.all([
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
    ]);

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
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

  async getProductAnalyticsAggregate() {
    return prisma.productAnalytics.aggregate({
      _sum: {
        views: true,
        ordersCount: true,
        revenue: true,
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