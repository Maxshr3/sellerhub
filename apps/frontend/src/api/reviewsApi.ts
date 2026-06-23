import { apiGet, apiPatch, apiPost } from "./client";
import type {
  GenerateReviewAnswerResponse,
  ReviewFilters,
  ReviewResponse,
  ReviewsResponse,
  ReviewStatus,
} from "../types/review";

export function getReviews(filters?: ReviewFilters) {
  const searchParams = new URLSearchParams();

  if (filters?.status) {
    searchParams.set("status", filters.status);
  }

  if (filters?.search) {
    searchParams.set("search", filters.search);
  }

  if (filters?.ratingMin !== undefined) {
    searchParams.set("ratingMin", String(filters.ratingMin));
  }

  if (filters?.ratingMax !== undefined) {
    searchParams.set("ratingMax", String(filters.ratingMax));
  }

  if (filters?.hasAnswer !== undefined) {
    searchParams.set("hasAnswer", String(filters.hasAnswer));
  }

  if (filters?.priority) {
    searchParams.set("priority", filters.priority);
  }

  const query = searchParams.toString();

  return apiGet<ReviewsResponse>(query ? `/reviews?${query}` : "/reviews");
}

export function answerReview(reviewId: string, answerText: string) {
  return apiPatch<ReviewResponse, { answerText: string }>(
    `/reviews/${reviewId}/answer`,
    {
      answerText,
    },
  );
}

export function updateReviewStatus(reviewId: string, status: ReviewStatus) {
  return apiPatch<ReviewResponse, { status: ReviewStatus }>(
    `/reviews/${reviewId}/status`,
    {
      status,
    },
  );
}

export function generateReviewAnswer(reviewId: string) {
  return apiPost<GenerateReviewAnswerResponse>(
    `/reviews/${reviewId}/ai-answer`,
  );
}