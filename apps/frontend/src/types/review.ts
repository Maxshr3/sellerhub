export type ReviewStatus = "NEW" | "ANSWERED" | "ARCHIVED";

export type ReviewPriority = "HIGH" | "MEDIUM" | "LOW";

export type Review = {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    sku: string;
    marketplaceName: string;
    marketplaceType: string;
  };
  authorName: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  priority: ReviewPriority;
  answerText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReviewsResponse = {
  data: Review[];
  total: number;
};

export type ReviewResponse = {
  data: Review;
};

export type ReviewFilters = {
  status?: ReviewStatus;
  search?: string;
  ratingMax?: number;
  ratingMin?: number;
  hasAnswer?: boolean;
  priority?: ReviewPriority;
};

export type GenerateReviewAnswerResponse = {
  data: {
    reviewId: string;
    suggestedAnswer: string;
    tone: "FRIENDLY" | "APOLOGY" | "NEUTRAL";
  };
};