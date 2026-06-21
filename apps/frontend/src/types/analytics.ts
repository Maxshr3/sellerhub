export type AnalyticsSummary = {
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

export type AnalyticsProduct = {
  id: string;
  title: string;
  sku: string;
  marketplaceName: string;
  marketplaceType: string;
  price: string;
  stock: number;
  rating: string | null;
};

export type TopProduct = AnalyticsProduct & {
  revenue: string;
  ordersCount: number;
  views: number;
};

export type DashboardAnalytics = {
  summary: AnalyticsSummary;
  lowStockProducts: AnalyticsProduct[];
  topProducts: TopProduct[];
};

export type DashboardAnalyticsResponse = {
  data: DashboardAnalytics;
};