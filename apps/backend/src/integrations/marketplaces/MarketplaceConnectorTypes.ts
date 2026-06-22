import { MarketplaceTypeDto } from "../../dto/MarketplaceDto";

export type NormalizedMarketplaceProduct = {
  sku: string;
  title: string;
  price: string;
  stock: number;
  rating: string | null;
  isActive: boolean;
};

export type NormalizedMarketplaceOrder = {
  externalId: string;
  productSku: string;
  status: "NEW" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  quantity: number;
  totalPrice: string;
  orderedAt: Date;
};

export type NormalizedMarketplaceReview = {
  productSku: string;
  authorName: string;
  rating: number;
  text: string;
  status: "NEW" | "ANSWERED" | "ARCHIVED";
  answerText?: string;
};

export type NormalizedMarketplaceAnalytics = {
  productSku: string;
  date: Date;
  views: number;
  ordersCount: number;
  revenue: string;
  conversionRate: string;
};

export type NormalizedMarketplaceRecommendation = {
  productSku: string;
  type: "PRICE" | "STOCK" | "SEO" | "REVIEW_REPLY" | "GENERAL";
  title: string;
  content: string;
};

export type NormalizedMarketplaceSyncData = {
  source: MarketplaceTypeDto;
  products: NormalizedMarketplaceProduct[];
  orders: NormalizedMarketplaceOrder[];
  reviews: NormalizedMarketplaceReview[];
  analytics: NormalizedMarketplaceAnalytics[];
  recommendations: NormalizedMarketplaceRecommendation[];
};

export type MarketplaceConnector = {
  source: MarketplaceTypeDto;
  fetchData(): Promise<NormalizedMarketplaceSyncData>;
};