import { prisma } from "../database/prisma";
import {
  CreateMarketplaceConnectionRequestDto,
  MarketplaceConnectionStatusDto,
} from "../dto/MarketplaceDto";
import {
  NormalizedMarketplaceAnalytics,
  NormalizedMarketplaceOrder,
  NormalizedMarketplaceProduct,
  NormalizedMarketplaceRecommendation,
  NormalizedMarketplaceReview,
} from "../integrations/marketplaces/MarketplaceConnectorTypes";

export class MarketplaceRepository {
  async findFirstUser() {
    return prisma.user.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findConnections() {
    return prisma.marketplace.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findConnectionById(id: string) {
    return prisma.marketplace.findUnique({
      where: {
        id,
      },
    });
  }

  async createConnection(
    userId: string,
    data: CreateMarketplaceConnectionRequestDto,
  ) {
    return prisma.marketplace.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        externalAccountId: data.externalAccountId,
        apiKey: data.apiKey,
        syncMode: data.syncMode ?? "MOCK",
        status: "CONNECTED",
      },
    });
  }

  async updateConnectionStatus(
    id: string,
    status: MarketplaceConnectionStatusDto,
  ) {
    return prisma.marketplace.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async updateLastSyncAt(id: string) {
    return prisma.marketplace.update({
      where: {
        id,
      },
      data: {
        lastSyncAt: new Date(),
        status: "CONNECTED",
      },
    });
  }

  async upsertProduct(
    marketplaceId: string,
    product: NormalizedMarketplaceProduct,
  ) {
    return prisma.product.upsert({
      where: {
        marketplaceId_sku: {
          marketplaceId,
          sku: product.sku,
        },
      },
      update: {
        title: product.title,
        price: product.price,
        stock: product.stock,
        rating: product.rating,
        isActive: product.isActive,
      },
      create: {
        marketplaceId,
        title: product.title,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        rating: product.rating,
        isActive: product.isActive,
      },
    });
  }

  async upsertOrder(
    marketplaceId: string,
    productId: string,
    order: NormalizedMarketplaceOrder,
  ) {
    return prisma.order.upsert({
      where: {
        marketplaceId_externalId: {
          marketplaceId,
          externalId: order.externalId,
        },
      },
      update: {
        productId,
        status: order.status,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        orderedAt: order.orderedAt,
      },
      create: {
        marketplaceId,
        productId,
        externalId: order.externalId,
        status: order.status,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        orderedAt: order.orderedAt,
      },
    });
  }

  async createReviewIfNotExists(
    productId: string,
    review: NormalizedMarketplaceReview,
  ) {
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        authorName: review.authorName,
        text: review.text,
      },
    });

    if (existingReview) {
      return existingReview;
    }

    return prisma.review.create({
      data: {
        productId,
        authorName: review.authorName,
        rating: review.rating,
        text: review.text,
        status: review.status,
        answerText: review.answerText,
      },
    });
  }

  async upsertProductAnalytics(
    productId: string,
    analytics: NormalizedMarketplaceAnalytics,
  ) {
    return prisma.productAnalytics.upsert({
      where: {
        productId_date: {
          productId,
          date: analytics.date,
        },
      },
      update: {
        views: analytics.views,
        ordersCount: analytics.ordersCount,
        revenue: analytics.revenue,
        conversionRate: analytics.conversionRate,
      },
      create: {
        productId,
        date: analytics.date,
        views: analytics.views,
        ordersCount: analytics.ordersCount,
        revenue: analytics.revenue,
        conversionRate: analytics.conversionRate,
      },
    });
  }

  async createRecommendationIfNotExists(
    productId: string,
    recommendation: NormalizedMarketplaceRecommendation,
  ) {
    const existingRecommendation = await prisma.aIRecommendation.findFirst({
      where: {
        productId,
        type: recommendation.type,
        title: recommendation.title,
      },
    });

    if (existingRecommendation) {
      return existingRecommendation;
    }

    return prisma.aIRecommendation.create({
      data: {
        productId,
        type: recommendation.type,
        title: recommendation.title,
        content: recommendation.content,
      },
    });
  }
}