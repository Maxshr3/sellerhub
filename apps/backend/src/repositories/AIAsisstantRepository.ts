import { prisma } from "../database/prisma";
import { AIRecommendationListQueryDto } from "../dto/AIAssistantDto";

export class AIAssistantRepository {
  async findRecommendations(filters: AIRecommendationListQueryDto) {
    return prisma.aIRecommendation.findMany({
      where: {
        productId: filters.productId,
        type: filters.type,
        isApplied: filters.isApplied,
      },
      include: {
        product: {
          include: {
            marketplace: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findRecommendationById(id: string) {
    return prisma.aIRecommendation.findUnique({
      where: {
        id,
      },
      include: {
        product: {
          include: {
            marketplace: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });
  }

  async applyRecommendation(id: string) {
    return prisma.aIRecommendation.update({
      where: {
        id,
      },
      data: {
        isApplied: true,
      },
      include: {
        product: {
          include: {
            marketplace: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });
  }

  async findReviewById(id: string) {
    return prisma.review.findUnique({
      where: {
        id,
      },
      include: {
        product: {
          select: {
            title: true,
            sku: true,
          },
        },
      },
    });
  }

  async findFirstUser() {
    return prisma.user.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async createAssistantLog(userId: string, prompt: string, response: string) {
    return prisma.aIAssistantLog.create({
      data: {
        userId,
        prompt,
        response,
      },
    });
  }

  async findAssistantLogs() {
    return prisma.aIAssistantLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });
  }
}