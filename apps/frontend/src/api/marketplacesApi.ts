import { apiGet, apiPatch, apiPost } from "./client";
import type {
  CreateMarketplaceConnectionRequest,
  MarketplaceConnectionResponse,
  MarketplaceConnectionsResponse,
  MarketplaceProviderResponse,
  MarketplaceSyncResponse,
  UpdateMarketplaceStatusRequest,
} from "../types/marketplace";

export function getMarketplaceProviders() {
  return apiGet<MarketplaceProviderResponse>("/marketplaces/providers");
}

export function getMarketplaceConnections() {
  return apiGet<MarketplaceConnectionsResponse>("/marketplaces/connections");
}

export function createMarketplaceConnection(
  data: CreateMarketplaceConnectionRequest,
) {
  return apiPost<
    MarketplaceConnectionResponse,
    CreateMarketplaceConnectionRequest
  >("/marketplaces/connections", data);
}

export function updateMarketplaceConnectionStatus(
  id: string,
  data: UpdateMarketplaceStatusRequest,
) {
  return apiPatch<
    MarketplaceConnectionResponse,
    UpdateMarketplaceStatusRequest
  >(`/marketplaces/connections/${id}/status`, data);
}

export function syncMarketplaceConnection(id: string) {
  return apiPost<MarketplaceSyncResponse>(
    `/marketplaces/connections/${id}/sync`,
  );
}