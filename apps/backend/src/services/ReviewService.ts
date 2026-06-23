import {
  GenerateReviewAnswerResponseDto,
  ReviewListQueryDto,
  ReviewPriorityDto,
  ReviewResponseDto,
  ReviewStatusDto,
} from "../dto/ReviewDto";
import { ReviewRepository } from "../repositories/ReviewRepository";

type ReviewFromDatabase = Awaited<
  ReturnType<ReviewRepository["findReviews"]>
>[number];

type ReviewDetailFromDatabase = NonNullable<
  Awaited<ReturnType<ReviewRepository["findReviewById"]>>
>;

export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async getReviews(filters: ReviewListQueryDto): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.findReviews(filters);

    const mappedReviews = reviews.map((review: ReviewFromDatabase) =>
  this.mapReviewToResponse(review),
);

    if (filters.priority) {
      return mappedReviews.filter(
  (review: ReviewResponseDto) => review.priority === filters.priority,
);
      
    }

    return mappedReviews;
  }

  async getReviewById(id: string): Promise<ReviewResponseDto | null> {
    const review = await this.reviewRepository.findReviewById(id);

    if (!review) {
      return null;
    }

    return this.mapReviewToResponse(review);
  }

  async answerReview(
    id: string,
    answerText: string,
  ): Promise<ReviewResponseDto | null> {
    const review = await this.reviewRepository.findReviewById(id);

    if (!review) {
      return null;
    }

    const updatedReview = await this.reviewRepository.answerReview(
      id,
      answerText,
    );

    return this.mapReviewToResponse(updatedReview);
  }

  async updateReviewStatus(
    id: string,
    status: ReviewStatusDto,
  ): Promise<ReviewResponseDto | null> {
    const review = await this.reviewRepository.findReviewById(id);

    if (!review) {
      return null;
    }

    const updatedReview = await this.reviewRepository.updateReviewStatus(
      id,
      status,
    );

    return this.mapReviewToResponse(updatedReview);
  }

  async generateReviewAnswer(
    id: string,
  ): Promise<GenerateReviewAnswerResponseDto | null> {
    const review = await this.reviewRepository.findReviewById(id);

    if (!review) {
      return null;
    }

    const tone = this.resolveAnswerTone(review.rating);
    const suggestedAnswer = this.buildSuggestedAnswer(review);

    return {
      reviewId: review.id,
      suggestedAnswer,
      tone,
    };
  }

  private buildSuggestedAnswer(review: ReviewDetailFromDatabase): string {
    if (review.rating <= 3) {
      return `Здравствуйте, ${review.authorName}! Спасибо, что написали отзыв. Нам очень жаль, что товар "${review.product.title}" не полностью оправдал ожидания. Мы передадим информацию команде и проверим карточку товара, упаковку и описание. Если проблема повторится, пожалуйста, напишите нам — мы постараемся помочь.`;
    }

    if (review.rating === 4) {
      return `Здравствуйте, ${review.authorName}! Спасибо за отзыв и хорошую оценку товара "${review.product.title}". Мы рады, что товар вам понравился. Учтём ваше замечание и постараемся сделать продукт и сервис ещё лучше.`;
    }

    return `Здравствуйте, ${review.authorName}! Спасибо за высокую оценку товара "${review.product.title}". Нам очень приятно, что покупка вам понравилась. Будем рады видеть вас снова!`;
  }

  private resolveAnswerTone(
    rating: number,
  ): GenerateReviewAnswerResponseDto["tone"] {
    if (rating <= 3) {
      return "APOLOGY";
    }

    if (rating === 4) {
      return "NEUTRAL";
    }

    return "FRIENDLY";
  }

  private resolveReviewPriority(review: {
    rating: number;
    status: ReviewStatusDto;
    answerText: string | null;
  }): ReviewPriorityDto {
    if (review.status === "NEW" && review.rating <= 3) {
      return "HIGH";
    }

    if (review.status === "NEW") {
      return "MEDIUM";
    }

    if (review.rating <= 3 && !review.answerText) {
      return "MEDIUM";
    }

    return "LOW";
  }

  private mapReviewToResponse(
    review: ReviewFromDatabase | ReviewDetailFromDatabase,
  ): ReviewResponseDto {
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
      priority: this.resolveReviewPriority({
        rating: review.rating,
        status: review.status,
        answerText: review.answerText,
      }),
      answerText: review.answerText,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }
}