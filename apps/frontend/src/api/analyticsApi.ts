import { apiGet } from "./client";
import type { DashboardAnalyticsResponse } from "../types/analytics";

export type DashboardAnalyticsFilters = {
  marketplaceId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function getDashboardAnalytics(filters?: DashboardAnalyticsFilters) {
  const searchParams = new URLSearchParams();

  if (filters?.marketplaceId) {
    searchParams.set("marketplaceId", filters.marketplaceId);
  }

  if (filters?.dateFrom) {
    searchParams.set("dateFrom", filters.dateFrom);
  }

  if (filters?.dateTo) {
    searchParams.set("dateTo", filters.dateTo);
  }

  const query = searchParams.toString();

  return apiGet<DashboardAnalyticsResponse>(
    query ? `/analytics/dashboard?${query}` : "/analytics/dashboard",
  );
}