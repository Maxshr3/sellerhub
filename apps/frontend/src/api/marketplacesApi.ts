import { apiGet, apiPatch, apiPost } from "./client";
import type {
  CreateMarketplaceConnectionRequest,
  MarketplaceConnectionResponse,
  MarketplaceConnectionsResponse,
  MarketplaceConnectionStatus,
  MarketplaceProvidersResponse,
  MarketplaceSyncResponse,
} from "../types/marketplace";

export function getMarketplaceProviders() {
  return apiGet<MarketplaceProvidersResponse>("/marketplaces/providers");
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
  status: MarketplaceConnectionStatus,
) {
  return apiPatch<MarketplaceConnectionResponse, { status: string }>(
    `/marketplaces/connections/${id}/status`,
    {
      status,
    },
  );
}

export function syncMarketplaceConnection(id: string) {
  return apiPost<MarketplaceSyncResponse>(
    `/marketplaces/connections/${id}/sync`,
  );
}