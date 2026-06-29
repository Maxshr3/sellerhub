import {
  CreateMarketplaceConnectionRequestDto,
  MarketplaceConnectionResponseDto,
  MarketplaceProviderDto,
  MarketplaceSyncReportDto,
  MarketplaceSyncResponseDto,
  MarketplaceTypeDto,
  UpdateMarketplaceStatusRequestDto,
} from "../dto/MarketplaceDto";
import { MarketplaceRepository } from "../repositories/MarketplaceRepository";

type MarketplaceFromDatabase = NonNullable<
  Awaited<ReturnType<MarketplaceRepository["findMarketplaceById"]>>
>;

export class MarketplaceService {
  constructor(private readonly marketplaceRepository: MarketplaceRepository) {}

  getProviders(): MarketplaceProviderDto[] {
    return [
      {
        type: "YANDEX_MARKET",
        name: "Яндекс Маркет",
        description: "Товары, отзывы, остатки и аналитика из Яндекс Маркета.",
        isAvailable: true,
        syncMode: "MOCK",
      },
      {
        type: "WILDBERRIES",
        name: "Wildberries",
        description: "Тестовая интеграция для товаров и отзывов Wildberries.",
        isAvailable: true,
        syncMode: "MOCK",
      },
      {
        type: "AVITO",
        name: "Avito",
        description: "Тестовая интеграция для объявлений и сообщений Avito.",
        isAvailable: true,
        syncMode: "MOCK",
      },
      {
        type: "OZON",
        name: "Ozon",
        description: "Заготовка интеграции для будущего расширения.",
        isAvailable: false,
        syncMode: "MOCK",
      },
    ];
  }

  async getConnections(
    userId: string,
  ): Promise<MarketplaceConnectionResponseDto[]> {
    const marketplaces =
      await this.marketplaceRepository.findMarketplacesByUserId(userId);

    return marketplaces.map((marketplace) =>
      this.mapMarketplaceToResponse(marketplace),
    );
  }

  async createConnection(
    userId: string,
    data: CreateMarketplaceConnectionRequestDto,
  ): Promise<
    | {
        status: "created";
        data: MarketplaceConnectionResponseDto;
      }
    | {
        status: "duplicate";
        data: MarketplaceConnectionResponseDto;
      }
  > {
    const duplicateMarketplace =
      await this.marketplaceRepository.findDuplicateMarketplace(userId, data);

    if (duplicateMarketplace) {
      return {
        status: "duplicate",
        data: this.mapMarketplaceToResponse(duplicateMarketplace),
      };
    }

    const marketplace = await this.marketplaceRepository.createMarketplace(
      userId,
      data,
    );

    return {
      status: "created",
      data: this.mapMarketplaceToResponse(marketplace),
    };
  }

  async updateConnectionStatus(
    userId: string,
    marketplaceId: string,
    data: UpdateMarketplaceStatusRequestDto,
  ): Promise<MarketplaceConnectionResponseDto | null> {
    const marketplace = await this.marketplaceRepository.updateMarketplaceStatus(
      userId,
      marketplaceId,
      data.status,
    );

    if (!marketplace) {
      return null;
    }

    return this.mapMarketplaceToResponse(marketplace);
  }

  async syncConnection(
    userId: string,
    marketplaceId: string,
  ): Promise<MarketplaceSyncResponseDto | null> {
    const marketplace =
      await this.marketplaceRepository.findMarketplaceByUserIdAndId(
        userId,
        marketplaceId,
      );

    if (!marketplace) {
      return null;
    }

    const beforeProducts =
      await this.marketplaceRepository.findProductsByMarketplaceId(marketplaceId);

    const syncedProducts =
      await this.marketplaceRepository.upsertDemoProducts(marketplaceId);

    let reviewsFound = 0;
    let recommendationsCreated = 0;

    for (const product of syncedProducts) {
      const reviews = await this.marketplaceRepository.createDemoReviews(
        product.id,
      );
      const analytics = await this.marketplaceRepository.createDemoAnalytics(
        product.id,
      );
      const recommendation =
        await this.marketplaceRepository.createDemoRecommendation(product.id);

      reviewsFound += reviews.length;

      if (recommendation) {
        recommendationsCreated += 1;
      }

      void analytics;
    }

    const afterProducts =
      await this.marketplaceRepository.findProductsByMarketplaceId(marketplaceId);

    const syncedMarketplace =
      await this.marketplaceRepository.markMarketplaceSynced(marketplaceId);

    const report = this.buildSyncReport({
      marketplace: syncedMarketplace,
      beforeProductsCount: beforeProducts.length,
      afterProducts,
      reviewsFound,
      recommendationsCreated,
    });

    return {
      data: this.mapMarketplaceToResponse(syncedMarketplace),
      report,
    };
  }

  private buildSyncReport(data: {
    marketplace: MarketplaceFromDatabase;
    beforeProductsCount: number;
    afterProducts: Awaited<
      ReturnType<MarketplaceRepository["findProductsByMarketplaceId"]>
    >;
    reviewsFound: number;
    recommendationsCreated: number;
  }): MarketplaceSyncReportDto {
    const productsUpdated = data.afterProducts.length;
    const lowStockProducts = data.afterProducts.filter(
      (product) => product.stock <= 10,
    );
    const negativeReviews = data.afterProducts.flatMap((product) =>
      product.reviews.filter((review) => review.rating <= 3),
    );

    const changes: MarketplaceSyncReportDto["changes"] = [
      {
        id: "system-sync-complete",
        type: "SYSTEM",
        title: "Синхронизация завершена",
        description: `SellerHUB обновил данные магазина ${data.marketplace.name}.`,
        severity: "SUCCESS",
      },
      {
        id: "products-updated",
        type: "PRODUCT",
        title: "Товары обновлены",
        description: `Обновлено товаров: ${productsUpdated}. Новых товаров: ${Math.max(
          0,
          productsUpdated - data.beforeProductsCount,
        )}.`,
        severity: "INFO",
      },
    ];

    if (data.reviewsFound > 0) {
      changes.push({
        id: "reviews-found",
        type: "REVIEW",
        title: "Найдены новые отзывы",
        description: `После синхронизации найдено отзывов: ${data.reviewsFound}.`,
        severity: "INFO",
      });
    }

    if (negativeReviews.length > 0) {
      changes.push({
        id: "negative-reviews",
        type: "REVIEW",
        title: "Есть негативные отзывы",
        description: `${negativeReviews.length} отзывов имеют оценку 1–3. Лучше ответить на них быстрее.`,
        severity: "CRITICAL",
      });
    }

    if (lowStockProducts.length > 0) {
      changes.push({
        id: "low-stock-products",
        type: "STOCK",
        title: "Есть товары с низким остатком",
        description: `${lowStockProducts.length} товаров имеют остаток 10 шт. или меньше.`,
        severity: "WARNING",
      });
    }

    if (data.recommendationsCreated > 0) {
      changes.push({
        id: "recommendations-created",
        type: "RECOMMENDATION",
        title: "Созданы рекомендации",
        description: `SellerHUB создал рекомендаций: ${data.recommendationsCreated}.`,
        severity: "SUCCESS",
      });
    }

    return {
      marketplaceId: data.marketplace.id,
      marketplaceName: data.marketplace.name,
      marketplaceType: data.marketplace.type as MarketplaceTypeDto,
      syncedAt: new Date().toISOString(),
      summary: {
        productsUpdated,
        reviewsFound: data.reviewsFound,
        negativeReviews: negativeReviews.length,
        lowStockProducts: lowStockProducts.length,
        recommendationsCreated: data.recommendationsCreated,
      },
      changes,
    };
  }

  private mapMarketplaceToResponse(
    marketplace: MarketplaceFromDatabase,
  ): MarketplaceConnectionResponseDto {
    return {
      id: marketplace.id,
      name: marketplace.name,
      type: marketplace.type as MarketplaceTypeDto,
      status: marketplace.status,
      syncMode: marketplace.syncMode,
      externalId: marketplace.externalAccountId,
      lastSyncAt: marketplace.lastSyncAt
        ? marketplace.lastSyncAt.toISOString()
        : null,
      createdAt: marketplace.createdAt.toISOString(),
      updatedAt: marketplace.updatedAt.toISOString(),
    };
  }
}