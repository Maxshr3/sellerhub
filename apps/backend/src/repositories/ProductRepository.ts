import { prisma } from "../database/prisma";
import { ProductListQueryDto } from "../dto/ProductDto";

export class ProductRepository {
  async findAll(filters: ProductListQueryDto) {
    return prisma.product.findMany({
      where: {
        marketplaceId: filters.marketplaceId,
        isActive: filters.isActive,
        title: filters.search
          ? {
              contains: filters.search,
              mode: "insensitive",
            }
          : undefined,
      },
      include: {
        marketplace: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        marketplace: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });
  }
}