export type ReviewStatusDto = "NEW" | "ANSWERED" | "ARCHIVED";

export type ReviewListQueryDto = {
  status?: ReviewStatusDto;
  productId?: string;
};

export type ReviewProductDto = {
  id: string;
  title: string;
  sku: string;
  marketplaceName: string;
  marketplaceType: string;
};

export type ReviewResponseDto = {
  id: string;
  productId: string;
  product: ReviewProductDto;
  authorName: string;
  rating: number;
  text: string;
  status: ReviewStatusDto;
  answerText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnswerReviewRequestDto = {
  answerText: string;
};