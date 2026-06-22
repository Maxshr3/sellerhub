export type MarketplaceTypeDto =
  | "WILDBERRIES"
  | "YANDEX_MARKET"
  | "AVITO"
  | "OZON"
  | "OTHER";

export type MarketplaceConnectionStatusDto =
  | "CONNECTED"
  | "DISCONNECTED"
  | "NEEDS_ATTENTION";

export type MarketplaceSyncModeDto = "MOCK" | "API";

export type MarketplaceProviderDto = {
  type: MarketplaceTypeDto;
  title: string;
  description: string;
  isAvailableInDemo: boolean;
  authType: "API_KEY" | "OAUTH" | "MOCK";
};

export type MarketplaceConnectionResponseDto = {
  id: string;
  name: string;
  type: MarketplaceTypeDto;
  externalAccountId: string | null;
  status: MarketplaceConnectionStatusDto;
  syncMode: MarketplaceSyncModeDto;
  lastSyncAt: string | null;
  hasApiKey: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateMarketplaceConnectionRequestDto = {
  name: string;
  type: MarketplaceTypeDto;
  externalAccountId?: string;
  apiKey?: string;
  syncMode?: MarketplaceSyncModeDto;
};

export type UpdateMarketplaceStatusRequestDto = {
  status: MarketplaceConnectionStatusDto;
};

export type MarketplaceSyncResultDto = {
  connection: MarketplaceConnectionResponseDto;
  source: MarketplaceTypeDto;
  syncMode: MarketplaceSyncModeDto;
  imported: {
    products: number;
    orders: number;
    reviews: number;
    analyticsRecords: number;
    recommendations: number;
  };
  message: string;
};