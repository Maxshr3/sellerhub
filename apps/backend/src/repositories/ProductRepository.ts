import { prisma } from "../database/prisma";
import {
  CreateProductRequestDto,
  ProductListQueryDto,
  UpdateProductRequestDto,
} from "../dto/ProductDto";

export class ProductRepository {
  async findProducts(filters: ProductListQueryDto) {
    return prisma.product.findMany({
      where: {
        ...(filters.search
          ? {
              OR: [
                {
                  title: {
                    contains: filters.search,
                  },
                },
                {
                  sku: {
                    contains: filters.search,
                  },
                },
              ],
            }
          : {}),
        ...(filters.marketplaceId
          ? {
              marketplaceId: filters.marketplaceId,
            }
          : {}),
        ...(filters.isActive !== undefined
          ? {
              isActive: filters.isActive,
            }
          : {}),
        ...(filters.lowStock
          ? {
              stock: {
                lte: 10,
              },
            }
          : {}),
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
        updatedAt: "desc",
      },
    });
  }

  async findProductById(id: string) {
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
        reviews: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        analytics: {
          orderBy: {
            date: "desc",
          },
          take: 7,
        },
        aiRecommendations: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });
  }

  async findMarketplaceById(id: string) {
    return prisma.marketplace.findUnique({
      where: {
        id,
      },
    });
  }

  async createProduct(data: CreateProductRequestDto) {
    return prisma.product.create({
      data: {
        marketplaceId: data.marketplaceId,
        title: data.title,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        rating: data.rating,
        isActive: data.isActive ?? true,
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

  async updateProduct(id: string, data: UpdateProductRequestDto) {
    const updateData: {
      title?: string;
      sku?: string;
      price?: string;
      stock?: number;
      rating?: string | null;
      isActive?: boolean;
    } = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.sku !== undefined) {
      updateData.sku = data.sku;
    }

    if (data.price !== undefined) {
      updateData.price = data.price;
    }

    if (data.stock !== undefined) {
      updateData.stock = data.stock;
    }

    if (data.rating !== undefined) {
      updateData.rating = data.rating;
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    return prisma.product.update({
      where: {
        id,
      },
      data: updateData,
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