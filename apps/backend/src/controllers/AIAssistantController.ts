import { Request, Response } from "express";
import {
  AIRecommendationListQueryDto,
  AIRecommendationTypeDto,
  ChatRequestDto,
  GenerateReviewAnswerRequestDto,
} from "../dto/AIAssistantDto";
import { AIAssistantService } from "../services/AIAssistantService";

type AIRecommendationParams = {
  id: string;
};

export class AIAssistantController {
  constructor(private readonly aiAssistantService: AIAssistantService) {}

  getRecommendations = async (req: Request, res: Response) => {
    const type = this.parseRecommendationType(req.query.type);

    if (type === null) {
      return res.status(400).json({
        message: "Invalid AI recommendation type",
        allowedTypes: ["PRICE", "STOCK", "SEO", "REVIEW_REPLY", "GENERAL"],
      });
    }

    const filters: AIRecommendationListQueryDto = {
      productId:
        typeof req.query.productId === "string"
          ? req.query.productId
          : undefined,
      type,
      isApplied: this.parseBooleanQuery(req.query.isApplied),
    };

    const recommendations =
      await this.aiAssistantService.getRecommendations(filters);

    return res.status(200).json({
      data: recommendations,
      total: recommendations.length,
    });
  };

  applyRecommendation = async (
    req: Request<AIRecommendationParams>,
    res: Response,
  ) => {
    const { id } = req.params;

    const recommendation =
      await this.aiAssistantService.applyRecommendation(id);

    if (!recommendation) {
      return res.status(404).json({
        message: "AI recommendation not found",
      });
    }

    return res.status(200).json({
      data: recommendation,
    });
  };

  generateReviewAnswer = async (
    req: Request<unknown, unknown, GenerateReviewAnswerRequestDto>,
    res: Response,
  ) => {
    const { reviewId } = req.body;

    if (typeof reviewId !== "string" || reviewId.trim().length === 0) {
      return res.status(400).json({
        message: "reviewId is required",
      });
    }

    const result = await this.aiAssistantService.generateReviewAnswer(
      reviewId.trim(),
    );

    if (!result) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    return res.status(200).json({
      data: result,
    });
  };

  chat = async (
    req: Request<unknown, unknown, ChatRequestDto>,
    res: Response,
  ) => {
    const { prompt } = req.body;

    if (typeof prompt !== "string" || prompt.trim().length < 2) {
      return res.status(400).json({
        message: "prompt is required and must contain at least 2 characters",
      });
    }

    const result = await this.aiAssistantService.chat(prompt.trim());

    return res.status(200).json({
      data: result,
    });
  };

  getLogs = async (_req: Request, res: Response) => {
    const logs = await this.aiAssistantService.getLogs();

    return res.status(200).json({
      data: logs,
      total: logs.length,
    });
  };

  private parseRecommendationType(
    value: unknown,
  ): AIRecommendationTypeDto | undefined | null {
    if (value === undefined) {
      return undefined;
    }

    if (value === "PRICE") {
      return "PRICE";
    }

    if (value === "STOCK") {
      return "STOCK";
    }

    if (value === "SEO") {
      return "SEO";
    }

    if (value === "REVIEW_REPLY") {
      return "REVIEW_REPLY";
    }

    if (value === "GENERAL") {
      return "GENERAL";
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