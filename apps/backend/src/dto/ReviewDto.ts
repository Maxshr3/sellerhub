export type ReviewStatusDto = "NEW" | "ANSWERED" | "ARCHIVED";

export type ReviewPriorityDto = "HIGH" | "MEDIUM" | "LOW";

export type ReviewListQueryDto = {
  status?: ReviewStatusDto;
  search?: string;
  ratingMin?: number;
  ratingMax?: number;
  hasAnswer?: boolean;
  priority?: ReviewPriorityDto;
};

export type ReviewResponseDto = {
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
  status: ReviewStatusDto;
  priority: ReviewPriorityDto;
  answerText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnswerReviewRequestDto = {
  answerText: string;
};

export type UpdateReviewStatusRequestDto = {
  status: ReviewStatusDto;
};

export type GenerateReviewAnswerResponseDto = {
  reviewId: string;
  suggestedAnswer: string;
  tone: "FRIENDLY" | "APOLOGY" | "NEUTRAL";
};