import {
  ReviewListQueryDto,
  ReviewResponseDto,
} from "../dto/ReviewDto";
import { ReviewRepository } from "../repositories/ReviewRepository";

type ReviewFromDatabase = Awaited<
  ReturnType<ReviewRepository["findAll"]>
>[number];

export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async getReviews(filters: ReviewListQueryDto): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.findAll(filters);

    return reviews.map((review) => this.mapReviewToResponse(review));
  }

  async getReviewById(id: string): Promise<ReviewResponseDto | null> {
    const review = await this.reviewRepository.findById(id);

    if (!review) {
      return null;
    }

    return this.mapReviewToResponse(review);
  }

  async answerReview(
    id: string,
    answerText: string,
  ): Promise<ReviewResponseDto | null> {
    const existingReview = await this.reviewRepository.findById(id);

    if (!existingReview) {
      return null;
    }

    const updatedReview = await this.reviewRepository.answerReview(
      id,
      answerText,
    );

    return this.mapReviewToResponse(updatedReview);
  }

  private mapReviewToResponse(review: ReviewFromDatabase): ReviewResponseDto {
    return {
      id: review.id,
      productId: review.productId,
      product: {
        id: review.product.id,
        title: review.product.title,
        sku: review.product.sku,
        marketplaceName: review.product.marketplace.name,
        marketplaceType: review.product.marketplace.type,
      },
      authorName: review.authorName,
      rating: review.rating,
      text: review.text,
      status: review.status,
      answerText: review.answerText,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }
}