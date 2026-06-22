export type AnalyticsSummaryDto = {
  totalRevenue: string;
  totalOrders: number;
  totalSoldItems: number;
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  averageRating: string | null;
  totalViews: number;
  conversionRate: string;
};

export type AnalyticsKpiCardDto = {
  id: string;
  label: string;
  value: string;
  description: string;
  formula: string;
  interpretation: string;
};

export type MarketplaceRevenueDto = {
  marketplaceId: string;
  marketplaceName: string;
  marketplaceType: string;
  revenue: string;
  ordersCount: number;
};

export type SalesFunnelDto = {
  views: number;
  orders: number;
  deliveredOrders: number;
  returnedOrders: number;
  cancelledOrders: number;
};

export type AnalyticsProductDto = {
  id: string;
  title: string;
  sku: string;
  marketplaceName: string;
  marketplaceType: string;
  price: string;
  stock: number;
  rating: string | null;
};

export type TopProductDto = AnalyticsProductDto & {
  revenue: string;
  ordersCount: number;
  views: number;
};

export type DashboardAnalyticsDto = {
  summary: AnalyticsSummaryDto;
  kpiCards: AnalyticsKpiCardDto[];
  marketplaceRevenue: MarketplaceRevenueDto[];
  salesFunnel: SalesFunnelDto;
  lowStockProducts: AnalyticsProductDto[];
  topProducts: TopProductDto[];
};