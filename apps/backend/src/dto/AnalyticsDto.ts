export type DashboardAnalyticsQueryDto = {
  marketplaceId?: string;
  dateFrom?: string;
  dateTo?: string;
};

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

export type MarketplaceFilterOptionDto = {
  id: string;
  name: string;
  type: string;
  status: string;
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

export type SellerActionItemDto = {
  id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  metric: string;
  recommendation: string;
};

export type ProblemProductDto = {
  id: string;
  title: string;
  sku: string;
  marketplaceName: string;
  marketplaceType: string;
  stock: number;
  rating: string | null;
  views: number;
  ordersCount: number;
  conversionRate: string;
  problems: string[];
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
  filters: {
    marketplaceId: string | null;
    dateFrom: string | null;
    dateTo: string | null;
  };
  marketplaceOptions: MarketplaceFilterOptionDto[];
  summary: AnalyticsSummaryDto;
  kpiCards: AnalyticsKpiCardDto[];
  actionItems: SellerActionItemDto[];
  marketplaceRevenue: MarketplaceRevenueDto[];
  salesFunnel: SalesFunnelDto;
  problemProducts: ProblemProductDto[];
  lowStockProducts: AnalyticsProductDto[];
  topProducts: TopProductDto[];
};