import { prisma } from "../database/prisma";
import { ReviewListQueryDto, ReviewStatusDto } from "../dto/ReviewDto";

export class ReviewRepository {
  async findReviews(filters: ReviewListQueryDto) {
    return prisma.review.findMany({
      where: {
        ...(filters.status
          ? {
              status: filters.status,
            }
          : {}),
        ...(filters.search
          ? {
              OR: [
                {
                  text: {
                    contains: filters.search,
                  },
                },
                {
                  authorName: {
                    contains: filters.search,
                  },
                },
                {
                  product: {
                    title: {
                      contains: filters.search,
                    },
                  },
                },
                {
                  product: {
                    sku: {
                      contains: filters.search,
                    },
                  },
                },
              ],
            }
          : {}),
        ...(filters.ratingMin !== undefined || filters.ratingMax !== undefined
          ? {
              rating: {
                ...(filters.ratingMin !== undefined
                  ? {
                      gte: filters.ratingMin,
                    }
                  : {}),
                ...(filters.ratingMax !== undefined
                  ? {
                      lte: filters.ratingMax,
                    }
                  : {}),
              },
            }
          : {}),
        ...(filters.hasAnswer !== undefined
          ? filters.hasAnswer
            ? {
                answerText: {
                  not: null,
                },
              }
            : {
                answerText: null,
              }
          : {}),
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
      orderBy: [
        {
          status: "asc",
        },
        {
          rating: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }

  async findReviewById(id: string) {
    return prisma.review.findUnique({
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

  async updateReviewStatus(id: string, status: ReviewStatusDto) {
    return prisma.review.update({
      where: {
        id,
      },
      data: {
        status,
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
}