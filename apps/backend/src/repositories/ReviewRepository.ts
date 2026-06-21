import { prisma } from "../database/prisma";
import { ReviewListQueryDto } from "../dto/ReviewDto";

export class ReviewRepository {
  async findAll(filters: ReviewListQueryDto) {
    return prisma.review.findMany({
      where: {
        status: filters.status,
        productId: filters.productId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            sku: true,
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

  async findById(id: string) {
    return prisma.review.findUnique({
      where: {
        id,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            sku: true,
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

  async answerReview(id: string, answerText: string) {
    return prisma.review.update({
      where: {
        id,
      },
      data: {
        answerText,
        status: "ANSWERED",
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            sku: true,
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
}