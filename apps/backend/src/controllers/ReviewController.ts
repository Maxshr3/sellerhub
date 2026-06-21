import { Request, Response } from "express";
import {
  AnswerReviewRequestDto,
  ReviewListQueryDto,
  ReviewStatusDto,
} from "../dto/ReviewDto";
import { ReviewService } from "../services/ReviewService";

type ReviewParams = {
  id: string;
};

export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  getReviews = async (req: Request, res: Response) => {
    const status = this.parseReviewStatus(req.query.status);

    if (status === null) {
      return res.status(400).json({
        message: "Invalid review status",
        allowedStatuses: ["NEW", "ANSWERED", "ARCHIVED"],
      });
    }

    const filters: ReviewListQueryDto = {
      status,
      productId:
        typeof req.query.productId === "string"
          ? req.query.productId
          : undefined,
    };

    const reviews = await this.reviewService.getReviews(filters);

    return res.status(200).json({
      data: reviews,
      total: reviews.length,
    });
  };

  getReviewById = async (req: Request<ReviewParams>, res: Response) => {
    const { id } = req.params;

    const review = await this.reviewService.getReviewById(id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    return res.status(200).json({
      data: review,
    });
  };

  answerReview = async (
    req: Request<ReviewParams, unknown, AnswerReviewRequestDto>,
    res: Response,
  ) => {
    const { id } = req.params;
    const { answerText } = req.body;

    if (typeof answerText !== "string" || answerText.trim().length < 2) {
      return res.status(400).json({
        message: "answerText is required and must contain at least 2 characters",
      });
    }

    const review = await this.reviewService.answerReview(
      id,
      answerText.trim(),
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    return res.status(200).json({
      data: review,
    });
  };

  private parseReviewStatus(value: unknown): ReviewStatusDto | undefined | null {
    if (value === undefined) {
      return undefined;
    }

    if (value === "NEW") {
      return "NEW";
    }

    if (value === "ANSWERED") {
      return "ANSWERED";
    }

    if (value === "ARCHIVED") {
      return "ARCHIVED";
    }

    return null;
  }
}