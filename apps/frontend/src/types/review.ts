export type ReviewStatus = "NEW" | "ANSWERED" | "ARCHIVED";

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
  answerText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReviewsResponse = {
  data: Review[];
  total: number;
};