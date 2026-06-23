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

export type MarketplaceFilterOption = {
  id: string;
  name: string;
  type: string;
  status: string;
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

export type SellerActionItem = {
  id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  metric: string;
  recommendation: string;
};

export type ProblemProduct = {
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
  filters: {
    marketplaceId: string | null;
    dateFrom: string | null;
    dateTo: string | null;
  };
  marketplaceOptions: MarketplaceFilterOption[];
  summary: AnalyticsSummary;
  kpiCards: AnalyticsKpiCard[];
  actionItems: SellerActionItem[];
  marketplaceRevenue: MarketplaceRevenue[];
  salesFunnel: SalesFunnel;
  problemProducts: ProblemProduct[];
  lowStockProducts: AnalyticsProduct[];
  topProducts: TopProduct[];
};

export type DashboardAnalyticsResponse = {
  data: DashboardAnalytics;
};