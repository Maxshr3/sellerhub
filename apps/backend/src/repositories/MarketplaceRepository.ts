import { prisma } from "../database/prisma";
import {
  CreateMarketplaceConnectionRequestDto,
  MarketplaceConnectionStatusDto,
} from "../dto/MarketplaceDto";

export class MarketplaceRepository {
  async findMarketplacesByUserId(userId: string) {
    return prisma.marketplace.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findMarketplaceById(id: string) {
    return prisma.marketplace.findUnique({
      where: {
        id,
      },
    });
  }

  async findMarketplaceByUserIdAndId(userId: string, marketplaceId: string) {
    return prisma.marketplace.findFirst({
      where: {
        id: marketplaceId,
        userId,
      },
    });
  }

  async findDuplicateMarketplace(
    userId: string,
    data: CreateMarketplaceConnectionRequestDto,
  ) {
    return prisma.marketplace.findFirst({
      where: {
        userId,
        type: data.type,
        name: {
          equals: data.name.trim(),
        },
      },
    });
  }

  async createMarketplace(
    userId: string,
    data: CreateMarketplaceConnectionRequestDto,
  ) {
    return prisma.marketplace.create({
      data: {
        userId,
        name: data.name.trim(),
        type: data.type,
        syncMode: data.syncMode ?? "MOCK",
        externalAccountId: data.externalId?.trim() || null,
        status: "CONNECTED",
      },
    });
  }

  async updateMarketplaceStatus(
    userId: string,
    marketplaceId: string,
    status: MarketplaceConnectionStatusDto,
  ) {
    const marketplace = await this.findMarketplaceByUserIdAndId(
      userId,
      marketplaceId,
    );

    if (!marketplace) {
      return null;
    }

    return prisma.marketplace.update({
      where: {
        id: marketplaceId,
      },
      data: {
        status,
      },
    });
  }

  async markMarketplaceSynced(marketplaceId: string) {
    return prisma.marketplace.update({
      where: {
        id: marketplaceId,
      },
      data: {
        status: "CONNECTED",
        lastSyncAt: new Date(),
      },
    });
  }

  async findProductsByMarketplaceId(marketplaceId: string) {
    return prisma.product.findMany({
      where: {
        marketplaceId,
      },
      include: {
        reviews: true,
        aiRecommendations: true,
      },
    });
  }

  async upsertDemoProducts(marketplaceId: string) {
    const demoProducts = [
      {
        title: "Умная лампа Pro",
        sku: `SMART-LAMP-${marketplaceId.slice(0, 4)}`,
        price: "2990.00",
        stock: 7,
        rating: "4.20",
      },
      {
        title: "Органайзер для кухни",
        sku: `KITCHEN-BOX-${marketplaceId.slice(0, 4)}`,
        price: "1490.00",
        stock: 2,
        rating: "3.80",
      },
      {
        title: "Беспроводная зарядка Stand",
        sku: `CHARGE-STAND-${marketplaceId.slice(0, 4)}`,
        price: "2190.00",
        stock: 24,
        rating: "4.70",
      },
    ];

    const syncedProducts = [];

    for (const demoProduct of demoProducts) {
      const product = await prisma.product.upsert({
        where: {
          marketplaceId_sku: {
            marketplaceId,
            sku: demoProduct.sku,
          },
        },
        update: {
          title: demoProduct.title,
          price: demoProduct.price,
          stock: demoProduct.stock,
          rating: demoProduct.rating,
          isActive: true,
        },
        create: {
          marketplaceId,
          title: demoProduct.title,
          sku: demoProduct.sku,
          price: demoProduct.price,
          stock: demoProduct.stock,
          rating: demoProduct.rating,
          isActive: true,
        },
      });

      syncedProducts.push(product);
    }

    return syncedProducts;
  }

  async createDemoReviews(productId: string) {
    const existingReviewsCount = await prisma.review.count({
      where: {
        productId,
      },
    });

    if (existingReviewsCount > 0) {
      return [];
    }

    return Promise.all([
      prisma.review.create({
        data: {
          productId,
          authorName: "Анна",
          rating: 5,
          text: "Товар понравился, всё пришло быстро.",
          status: "NEW",
        },
      }),
      prisma.review.create({
        data: {
          productId,
          authorName: "Игорь",
          rating: 2,
          text: "Упаковка была повреждена, товар пришёл с царапиной.",
          status: "NEW",
        },
      }),
    ]);
  }

  async createDemoAnalytics(productId: string) {
    const existingAnalyticsCount = await prisma.productAnalytics.count({
      where: {
        productId,
      },
    });

    if (existingAnalyticsCount > 0) {
      return [];
    }

    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    return Promise.all([
      prisma.productAnalytics.create({
        data: {
          productId,
          date: yesterday,
          views: 1300,
          ordersCount: 18,
          revenue: "53820.00",
          conversionRate: "1.38",
        },
      }),
      prisma.productAnalytics.create({
        data: {
          productId,
          date: today,
          views: 1650,
          ordersCount: 24,
          revenue: "71760.00",
          conversionRate: "1.45",
        },
      }),
    ]);
  }

  async createDemoRecommendation(productId: string) {
    const existingRecommendation = await prisma.aIRecommendation.findFirst({
      where: {
        productId,
        title: "Проверить упаковку и описание товара",
      },
    });

    if (existingRecommendation) {
      return null;
    }

    return prisma.aIRecommendation.create({
      data: {
        productId,
        type: "GENERAL",
        title: "Проверить упаковку и описание товара",
        content:
          "У товара есть риск негативных отзывов. Рекомендуется добавить информацию об упаковке и проверить карточку.",
      },
    });
  }
}