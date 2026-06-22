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

export type AnalyticsKpiCard = {
  id: string;
  label: string;
  value: string;
  description: string;
  formula: string;
  interpretation: string;
};

export type MarketplaceRevenue = {
  marketplaceId: string;
  marketplaceName: string;
  marketplaceType: string;
  revenue: string;
  ordersCount: number;
};

export type SalesFunnel = {
  views: number;
  orders: number;
  deliveredOrders: number;
  returnedOrders: number;
  cancelledOrders: number;
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
  kpiCards: AnalyticsKpiCard[];
  marketplaceRevenue: MarketplaceRevenue[];
  salesFunnel: SalesFunnel;
  lowStockProducts: AnalyticsProduct[];
  topProducts: TopProduct[];
};

export type DashboardAnalyticsResponse = {
  data: DashboardAnalytics;
};