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
  lowStockProducts: AnalyticsProductDto[];
  topProducts: TopProductDto[];
};