import {
  AIAssistantLogResponseDto,
  AIRecommendationListQueryDto,
  AIRecommendationResponseDto,
  ChatResponseDto,
  GenerateReviewAnswerResponseDto,
} from "../dto/AIAssistantDto";
import { AIAssistantRepository } from "../repositories/AIAsisstantRepository";

type AIRecommendationFromDatabase = {
  id: string;
  productId: string;
  type: "PRICE" | "STOCK" | "SEO" | "REVIEW_REPLY" | "GENERAL";
  title: string;
  content: string;
  isApplied: boolean;
  createdAt: Date;
  product: {
    id: string;
    title: string;
    sku: string;
    price: {
      toString(): string;
    };
    stock: number;
    rating: {
      toString(): string;
    } | null;
    marketplace: {
      name: string;
      type: string;
    };
  };
};

type AIAssistantLogFromDatabase = {
  id: string;
  userId: string;
  prompt: string;
  response: string;
  createdAt: Date;
};

export class AIAssistantService {
  constructor(private readonly aiAssistantRepository: AIAssistantRepository) {}

  async getRecommendations(
    filters: AIRecommendationListQueryDto,
  ): Promise<AIRecommendationResponseDto[]> {
    const recommendations =
      await this.aiAssistantRepository.findRecommendations(filters);

    return recommendations.map((recommendation: AIRecommendationFromDatabase) =>
      this.mapRecommendationToResponse(recommendation),
    );
  }

  async applyRecommendation(
    id: string,
  ): Promise<AIRecommendationResponseDto | null> {
    const existingRecommendation =
      await this.aiAssistantRepository.findRecommendationById(id);

    if (!existingRecommendation) {
      return null;
    }

    const updatedRecommendation =
      await this.aiAssistantRepository.applyRecommendation(id);

    return this.mapRecommendationToResponse(
      updatedRecommendation as AIRecommendationFromDatabase,
    );
  }

  async generateReviewAnswer(
    reviewId: string,
  ): Promise<GenerateReviewAnswerResponseDto | null> {
    const review = await this.aiAssistantRepository.findReviewById(reviewId);

    if (!review) {
      return null;
    }

    const suggestedAnswer = this.buildReviewAnswer(
      review.rating,
      review.text,
      review.product.title,
    );

    return {
      reviewId: review.id,
      rating: review.rating,
      reviewText: review.text,
      suggestedAnswer,
    };
  }

  async chat(prompt: string): Promise<ChatResponseDto> {
    const response = this.buildChatResponse(prompt);

    const user = await this.aiAssistantRepository.findFirstUser();

    if (user) {
      await this.aiAssistantRepository.createAssistantLog(
        user.id,
        prompt,
        response,
      );
    }

    return {
      prompt,
      response,
    };
  }

  async getLogs(): Promise<AIAssistantLogResponseDto[]> {
    const logs = await this.aiAssistantRepository.findAssistantLogs();

    return logs.map((log: AIAssistantLogFromDatabase) =>
      this.mapLogToResponse(log),
    );
  }

  private mapRecommendationToResponse(
    recommendation: AIRecommendationFromDatabase,
  ): AIRecommendationResponseDto {
    return {
      id: recommendation.id,
      productId: recommendation.productId,
      product: {
        id: recommendation.product.id,
        title: recommendation.product.title,
        sku: recommendation.product.sku,
        price: recommendation.product.price.toString(),
        stock: recommendation.product.stock,
        rating: recommendation.product.rating
          ? recommendation.product.rating.toString()
          : null,
        marketplaceName: recommendation.product.marketplace.name,
        marketplaceType: recommendation.product.marketplace.type,
      },
      type: recommendation.type,
      title: recommendation.title,
      content: recommendation.content,
      isApplied: recommendation.isApplied,
      createdAt: recommendation.createdAt.toISOString(),
    };
  }

  private mapLogToResponse(
    log: AIAssistantLogFromDatabase,
  ): AIAssistantLogResponseDto {
    return {
      id: log.id,
      userId: log.userId,
      prompt: log.prompt,
      response: log.response,
      createdAt: log.createdAt.toISOString(),
    };
  }

  private buildReviewAnswer(
    rating: number,
    reviewText: string,
    productTitle: string,
  ): string {
    if (rating >= 5) {
      return `Спасибо за высокую оценку! Нам очень приятно, что товар "${productTitle}" вам понравился. Будем рады видеть вас снова.`;
    }

    if (rating >= 4) {
      return `Спасибо за отзыв! Мы рады, что товар "${productTitle}" в целом вам понравился. Ваш комментарий учтём для улучшения качества.`;
    }

    return `Спасибо за обратную связь. Нам жаль, что товар "${productTitle}" не полностью оправдал ожидания. Мы внимательно изучим ваш отзыв: "${reviewText}" и постараемся улучшить продукт.`;
  }

  private buildChatResponse(prompt: string): string {
    const normalizedPrompt = prompt.toLowerCase();

    if (
      normalizedPrompt.includes("остат") ||
      normalizedPrompt.includes("склад")
    ) {
      return "Я вижу, что нужно проверить товары с низкими остатками. Начните с товаров, у которых stock меньше или равен 10.";
    }

    if (
      normalizedPrompt.includes("цена") ||
      normalizedPrompt.includes("скид")
    ) {
      return "Рекомендую проверить товары с низкой конверсией и протестировать скидку 5–7%, не снижая маржинальность слишком сильно.";
    }

    if (
      normalizedPrompt.includes("отзыв") ||
      normalizedPrompt.includes("ответ")
    ) {
      return "Для новых отзывов лучше отвечать быстро, коротко и по делу: поблагодарить клиента, признать проблему и предложить решение.";
    }

    if (
      normalizedPrompt.includes("seo") ||
      normalizedPrompt.includes("карточ")
    ) {
      return "Для улучшения карточки товара добавьте ключевые слова в название, усилите первые 2 фото и проверьте описание на конкретные преимущества.";
    }

    return "Я могу помочь с анализом товаров, остатков, отзывов, цен и карточек. Начните с товаров с низкими остатками и новых отзывов.";
  }
}