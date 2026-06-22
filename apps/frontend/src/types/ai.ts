export type AIRecommendationType =
  | "PRICE"
  | "STOCK"
  | "SEO"
  | "REVIEW_REPLY"
  | "GENERAL";

export type AIRecommendation = {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    sku: string;
    price: string;
    stock: number;
    rating: string | null;
    marketplaceName: string;
    marketplaceType: string;
  };
  type: AIRecommendationType;
  title: string;
  content: string;
  isApplied: boolean;
  createdAt: string;
};

export type AIRecommendationsResponse = {
  data: AIRecommendation[];
  total: number;
};

export type AIRecommendationResponse = {
  data: AIRecommendation;
};

export type ChatResponse = {
  data: {
    prompt: string;
    response: string;
  };
};