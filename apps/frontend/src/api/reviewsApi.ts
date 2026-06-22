import { apiGet, apiPatch } from "./client";
import type {
  ReviewResponse,
  ReviewsResponse,
  ReviewStatus,
} from "../types/review";

export function getReviews(status?: ReviewStatus) {
  const query = status ? `?status=${status}` : "";

  return apiGet<ReviewsResponse>(`/reviews${query}`);
}

export function answerReview(reviewId: string, answerText: string) {
  return apiPatch<ReviewResponse, { answerText: string }>(
    `/reviews/${reviewId}/answer`,
    {
      answerText,
    },
  );
}