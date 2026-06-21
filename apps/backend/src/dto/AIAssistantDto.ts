export type AIRecommendationTypeDto =
  | "PRICE"
  | "STOCK"
  | "SEO"
  | "REVIEW_REPLY"
  | "GENERAL";

export type AIRecommendationListQueryDto = {
  productId?: string;
  type?: AIRecommendationTypeDto;
  isApplied?: boolean;
};

export type AIRecommendationProductDto = {
  id: string;
  title: string;
  sku: string;
  price: string;
  stock: number;
  rating: string | null;
  marketplaceName: string;
  marketplaceType: string;
};

export type AIRecommendationResponseDto = {
  id: string;
  productId: string;
  product: AIRecommendationProductDto;
  type: AIRecommendationTypeDto;
  title: string;
  content: string;
  isApplied: boolean;
  createdAt: string;
};

export type GenerateReviewAnswerRequestDto = {
  reviewId: string;
};

export type GenerateReviewAnswerResponseDto = {
  reviewId: string;
  rating: number;
  reviewText: string;
  suggestedAnswer: string;
};

export type ChatRequestDto = {
  prompt: string;
};

export type ChatResponseDto = {
  prompt: string;
  response: string;
};

export type AIAssistantLogResponseDto = {
  id: string;
  userId: string;
  prompt: string;
  response: string;
  createdAt: string;
};