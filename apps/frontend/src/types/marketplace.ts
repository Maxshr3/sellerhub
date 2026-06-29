export type MarketplaceType =
  | "WILDBERRIES"
  | "OZON"
  | "YANDEX_MARKET"
  | "AVITO"
  | "OTHER";

export type MarketplaceConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "NEEDS_ATTENTION";

export type MarketplaceSyncMode = "MOCK" | "API";

export type MarketplaceProvider = {
  type: MarketplaceType;
  name: string;
  description: string;
  isAvailable: boolean;
  syncMode: MarketplaceSyncMode;
};

export type MarketplaceConnection = {
  id: string;
  name: string;
  type: MarketplaceType;
  status: MarketplaceConnectionStatus;
  syncMode: MarketplaceSyncMode;
  externalId: string | null;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceProviderResponse = {
  data: MarketplaceProvider[];
};

export type MarketplaceConnectionResponse = {
  data: MarketplaceConnection;
};

export type MarketplaceConnectionsResponse = {
  data: MarketplaceConnection[];
};

export type CreateMarketplaceConnectionRequest = {
  name: string;
  type: MarketplaceType;
  syncMode?: MarketplaceSyncMode;
  externalId?: string | null;
};

export type UpdateMarketplaceStatusRequest = {
  status: MarketplaceConnectionStatus;
};

export type MarketplaceSyncReport = {
  marketplaceId: string;
  marketplaceName: string;
  marketplaceType: MarketplaceType;
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

export type MarketplaceSyncResponse = {
  data: MarketplaceConnection;
  report: MarketplaceSyncReport;
};