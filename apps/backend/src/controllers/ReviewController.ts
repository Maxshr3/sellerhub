import { Request, Response } from "express";
import {
  AnswerReviewRequestDto,
  ReviewListQueryDto,
  ReviewPriorityDto,
  ReviewStatusDto,
  UpdateReviewStatusRequestDto,
} from "../dto/ReviewDto";
import { ReviewService } from "../services/ReviewService";

type ReviewParams = {
  id: string;
};

export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  getReviews = async (req: Request, res: Response) => {
    const filters = this.parseReviewFilters(req.query);

    if (filters === null) {
      return res.status(400).json({
        message: "Invalid review filters",
      });
    }

    const reviews = await this.reviewService.getReviews(filters);

    return res.status(200).json({
      data: reviews,
      total: reviews.length,
    });
  };

  getReviewById = async (req: Request<ReviewParams>, res: Response) => {
    const review = await this.reviewService.getReviewById(req.params.id);

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
    const { answerText } = req.body;

    if (typeof answerText !== "string" || answerText.trim().length < 2) {
      return res.status(400).json({
        message: "answerText is required and must contain at least 2 characters",
      });
    }

    const review = await this.reviewService.answerReview(
      req.params.id,
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

  updateReviewStatus = async (
    req: Request<ReviewParams, unknown, UpdateReviewStatusRequestDto>,
    res: Response,
  ) => {
    const status = this.parseReviewStatus(req.body.status);

    if (!status) {
      return res.status(400).json({
        message: "Invalid review status",
      });
    }

    const review = await this.reviewService.updateReviewStatus(
      req.params.id,
      status,
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

  generateReviewAnswer = async (
    req: Request<ReviewParams>,
    res: Response,
  ) => {
    const result = await this.reviewService.generateReviewAnswer(req.params.id);

    if (!result) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    return res.status(200).json({
      data: result,
    });
  };

     private parseReviewFilters(
    query: Request["query"],
  ): ReviewListQueryDto | null {
    let status: ReviewStatusDto | undefined;

    if (typeof query.status === "string") {
      const parsedStatus = this.parseReviewStatus(query.status);

      if (!parsedStatus) {
        return null;
      }

      status = parsedStatus;
    }

    let priority: ReviewPriorityDto | undefined;

    if (typeof query.priority === "string") {
      const parsedPriority = this.parseReviewPriority(query.priority);

      if (!parsedPriority) {
        return null;
      }

      priority = parsedPriority;
    }

    const ratingMin =
      typeof query.ratingMin === "string" && query.ratingMin.length > 0
        ? Number(query.ratingMin)
        : undefined;

    const ratingMax =
      typeof query.ratingMax === "string" && query.ratingMax.length > 0
        ? Number(query.ratingMax)
        : undefined;

    if (
      ratingMin !== undefined &&
      (Number.isNaN(ratingMin) || ratingMin < 1 || ratingMin > 5)
    ) {
      return null;
    }

    if (
      ratingMax !== undefined &&
      (Number.isNaN(ratingMax) || ratingMax < 1 || ratingMax > 5)
    ) {
      return null;
    }

    return {
      status,
      priority,
      search:
        typeof query.search === "string" && query.search.length > 0
          ? query.search
          : undefined,
      ratingMin,
      ratingMax,
      hasAnswer: this.parseBooleanQuery(query.hasAnswer),
    };
  }

  private parseReviewStatus(value: unknown): ReviewStatusDto | null {
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

  private parseReviewPriority(value: unknown): ReviewPriorityDto | null {
    if (value === "HIGH") {
      return "HIGH";
    }

    if (value === "MEDIUM") {
      return "MEDIUM";
    }

    if (value === "LOW") {
      return "LOW";
    }

    return null;
  }

  private parseBooleanQuery(value: unknown): boolean | undefined {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return undefined;
  }
}