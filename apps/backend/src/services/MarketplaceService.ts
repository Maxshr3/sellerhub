import {
  CreateMarketplaceConnectionRequestDto,
  MarketplaceConnectionResponseDto,
  MarketplaceConnectionStatusDto,
  MarketplaceProviderDto,
  MarketplaceSyncResultDto,
} from "../dto/MarketplaceDto";
import { MarketplaceConnectorFactory } from "../integrations/marketplaces/MarketplaceConnectorFactory";
import { MarketplaceRepository } from "../repositories/MarketplaceRepository";

type MarketplaceFromDatabase = Awaited<
  ReturnType<MarketplaceRepository["findConnections"]>
>[number];

export class MarketplaceService {
  private readonly connectorFactory = new MarketplaceConnectorFactory();

  constructor(private readonly marketplaceRepository: MarketplaceRepository) {}

  getProviders(): MarketplaceProviderDto[] {
    return [
      {
        type: "YANDEX_MARKET",
        title: "Яндекс Маркет",
        description:
          "Подключение магазина Яндекс Маркета для загрузки товаров, заказов, остатков и отчётов.",
        isAvailableInDemo: true,
        authType: "API_KEY",
      },
      {
        type: "WILDBERRIES",
        title: "Wildberries",
        description:
          "Подключение кабинета Wildberries для загрузки продаж, остатков, заказов и отзывов.",
        isAvailableInDemo: true,
        authType: "API_KEY",
      },
      {
        type: "AVITO",
        title: "Avito",
        description:
          "Подключение Avito для работы с объявлениями, статистикой и обращениями покупателей.",
        isAvailableInDemo: true,
        authType: "API_KEY",
      },
    ];
  }

  async getConnections(
    userId: string,
  ): Promise<MarketplaceConnectionResponseDto[]> {
    const connections = await this.marketplaceRepository.findConnections(userId);

    return connections.map((connection) =>
      this.mapConnectionToResponse(connection),
    );
  }

  async createConnection(
    userId: string,
    data: CreateMarketplaceConnectionRequestDto,
  ): Promise<MarketplaceConnectionResponseDto> {
    const connection = await this.marketplaceRepository.createConnection(
      userId,
      data,
    );

    return this.mapConnectionToResponse(connection);
  }

  async updateConnectionStatus(
    userId: string,
    id: string,
    status: MarketplaceConnectionStatusDto,
  ): Promise<MarketplaceConnectionResponseDto | null> {
    const existingConnection =
      await this.marketplaceRepository.findConnectionById(userId, id);

    if (!existingConnection) {
      return null;
    }

    const updatedConnection =
      await this.marketplaceRepository.updateConnectionStatus(id, status);

    return this.mapConnectionToResponse(updatedConnection);
  }

  async syncConnection(
    userId: string,
    id: string,
  ): Promise<MarketplaceSyncResultDto | null> {
    const connection = await this.marketplaceRepository.findConnectionById(
      userId,
      id,
    );

    if (!connection) {
      return null;
    }

    const connector = this.connectorFactory.createConnector(connection.type);

    if (!connector) {
      const updatedConnection =
        await this.marketplaceRepository.updateConnectionStatus(
          id,
          "NEEDS_ATTENTION",
        );

      return {
        connection: this.mapConnectionToResponse(updatedConnection),
        source: connection.type,
        syncMode: connection.syncMode,
        imported: {
          products: 0,
          orders: 0,
          reviews: 0,
          analyticsRecords: 0,
          recommendations: 0,
        },
        message:
          "Для этого маркетплейса пока нет mock-коннектора. Подключение требует внимания.",
      };
    }

    const syncData = await connector.fetchData();

    const productIdBySku = new Map<string, string>();

    for (const product of syncData.products) {
      const savedProduct = await this.marketplaceRepository.upsertProduct(
        connection.id,
        product,
      );

      productIdBySku.set(product.sku, savedProduct.id);
    }

    let importedOrders = 0;
    let importedReviews = 0;
    let importedAnalytics = 0;
    let importedRecommendations = 0;

    for (const order of syncData.orders) {
      const productId = productIdBySku.get(order.productSku);

      if (!productId) {
        continue;
      }

      await this.marketplaceRepository.upsertOrder(
        connection.id,
        productId,
        order,
      );

      importedOrders += 1;
    }

    for (const review of syncData.reviews) {
      const productId = productIdBySku.get(review.productSku);

      if (!productId) {
        continue;
      }

      await this.marketplaceRepository.createReviewIfNotExists(
        productId,
        review,
      );

      importedReviews += 1;
    }

    for (const analytics of syncData.analytics) {
      const productId = productIdBySku.get(analytics.productSku);

      if (!productId) {
        continue;
      }

      await this.marketplaceRepository.upsertProductAnalytics(
        productId,
        analytics,
      );

      importedAnalytics += 1;
    }

    for (const recommendation of syncData.recommendations) {
      const productId = productIdBySku.get(recommendation.productSku);

      if (!productId) {
        continue;
      }

      await this.marketplaceRepository.createRecommendationIfNotExists(
        productId,
        recommendation,
      );

      importedRecommendations += 1;
    }

    const updatedConnection = await this.marketplaceRepository.updateLastSyncAt(
      connection.id,
    );

    return {
      connection: this.mapConnectionToResponse(updatedConnection),
      source: syncData.source,
      syncMode: connection.syncMode,
      imported: {
        products: syncData.products.length,
        orders: importedOrders,
        reviews: importedReviews,
        analyticsRecords: importedAnalytics,
        recommendations: importedRecommendations,
      },
      message:
        "Mock-синхронизация завершена. Данные маркетплейса импортированы в SellerHUB.",
    };
  }

  private mapConnectionToResponse(
    connection: MarketplaceFromDatabase,
  ): MarketplaceConnectionResponseDto {
    return {
      id: connection.id,
      name: connection.name,
      type: connection.type,
      externalAccountId: connection.externalAccountId,
      status: connection.status,
      syncMode: connection.syncMode,
      lastSyncAt: connection.lastSyncAt
        ? connection.lastSyncAt.toISOString()
        : null,
      hasApiKey: Boolean(connection.apiKey),
      createdAt: connection.createdAt.toISOString(),
      updatedAt: connection.updatedAt.toISOString(),
    };
  }
}