import {
  CreateMarketplaceConnectionRequestDto,
  MarketplaceConnectionResponseDto,
  MarketplaceProviderDto,
  MarketplaceConnectionStatusDto,
} from "../dto/MarketplaceDto";
import { MarketplaceRepository } from "../repositories/MarketplaceRepository";

type MarketplaceFromDatabase = Awaited<
  ReturnType<MarketplaceRepository["findConnections"]>
>[number];

export class MarketplaceService {
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

  async getConnections(): Promise<MarketplaceConnectionResponseDto[]> {
    const connections = await this.marketplaceRepository.findConnections();

    return connections.map((connection) =>
      this.mapConnectionToResponse(connection),
    );
  }

  async createConnection(
    data: CreateMarketplaceConnectionRequestDto,
  ): Promise<MarketplaceConnectionResponseDto | null> {
    const user = await this.marketplaceRepository.findFirstUser();

    if (!user) {
      return null;
    }

    const connection = await this.marketplaceRepository.createConnection(
      user.id,
      data,
    );

    return this.mapConnectionToResponse(connection);
  }

  async updateConnectionStatus(
    id: string,
    status: MarketplaceConnectionStatusDto,
  ): Promise<MarketplaceConnectionResponseDto | null> {
    const existingConnection =
      await this.marketplaceRepository.findConnectionById(id);

    if (!existingConnection) {
      return null;
    }

    const updatedConnection =
      await this.marketplaceRepository.updateConnectionStatus(id, status);

    return this.mapConnectionToResponse(updatedConnection);
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