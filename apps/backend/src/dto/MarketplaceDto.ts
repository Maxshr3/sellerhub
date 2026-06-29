export type MarketplaceTypeDto =
  | "WILDBERRIES"
  | "OZON"
  | "YANDEX_MARKET"
  | "AVITO"
  | "OTHER";

export type MarketplaceConnectionStatusDto =
  | "CONNECTED"
  | "DISCONNECTED"
  | "NEEDS_ATTENTION";

export type MarketplaceSyncModeDto = "MOCK" | "API";

export type MarketplaceProviderDto = {
  type: MarketplaceTypeDto;
  name: string;
  description: string;
  isAvailable: boolean;
  syncMode: MarketplaceSyncModeDto;
};

export type MarketplaceConnectionResponseDto = {
  id: string;
  name: string;
  type: MarketplaceTypeDto;
  status: MarketplaceConnectionStatusDto;
  syncMode: MarketplaceSyncModeDto;
  externalId: string | null;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMarketplaceConnectionRequestDto = {
  name: string;
  type: MarketplaceTypeDto;
  syncMode?: MarketplaceSyncModeDto;
  externalId?: string | null;
};

export type UpdateMarketplaceStatusRequestDto = {
  status: MarketplaceConnectionStatusDto;
};

export type MarketplaceSyncReportDto = {
  marketplaceId: string;
  marketplaceName: string;
  marketplaceType: MarketplaceTypeDto;
  syncedAt: string;
  summary: {
    productsUpdated: number;
    reviewsFound: number;
    negativeReviews: number;
    lowStockProducts: number;
    recommendationsCreated: number;
  };
  changes: {
    id: string;
    type: "PRODUCT" | "REVIEW" | "STOCK" | "RECOMMENDATION" | "SYSTEM";
    title: string;
    description: string;
    severity: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";
  }[];
};

export type MarketplaceSyncResponseDto = {
  data: MarketplaceConnectionResponseDto;
  report: MarketplaceSyncReportDto;
};