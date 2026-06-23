export type MarketplaceType =
  | "YANDEX_MARKET"
  | "WILDBERRIES"
  | "AVITO"
  | "OZON"
  | "OTHER";

export type MarketplaceConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "NEEDS_ATTENTION";

export type MarketplaceSyncMode = "MOCK" | "API";

export type MarketplaceProvider = {
  type: MarketplaceType;
  title: string;
  description: string;
  isAvailableInDemo: boolean;
  authType: "API_KEY" | "OAUTH" | "MOCK";
};

export type MarketplaceConnection = {
  id: string;
  name: string;
  type: MarketplaceType;
  externalAccountId: string | null;
  status: MarketplaceConnectionStatus;
  syncMode: MarketplaceSyncMode;
  lastSyncAt: string | null;
  hasApiKey: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceProvidersResponse = {
  data: MarketplaceProvider[];
  total: number;
};

export type MarketplaceConnectionsResponse = {
  data: MarketplaceConnection[];
  total: number;
};

export type MarketplaceConnectionResponse = {
  data: MarketplaceConnection;
};

export type CreateMarketplaceConnectionRequest = {
  name: string;
  type: MarketplaceType;
  externalAccountId?: string;
  apiKey?: string;
  syncMode: MarketplaceSyncMode;
};

export type MarketplaceSyncResult = {
  connection: MarketplaceConnection;
  source: MarketplaceType;
  syncMode: MarketplaceSyncMode;
  imported: {
    products: number;
    orders: number;
    reviews: number;
    analyticsRecords: number;
    recommendations: number;
  };
  message: string;
};

export type MarketplaceSyncResponse = {
  data: MarketplaceSyncResult;
};