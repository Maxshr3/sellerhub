import { apiGet } from "./client";
import type { DashboardAnalyticsResponse } from "../types/analytics";

export function getDashboardAnalytics() {
  return apiGet<DashboardAnalyticsResponse>("/analytics/dashboard");
}