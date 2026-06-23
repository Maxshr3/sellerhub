export type ProductListQueryDto = {
  search?: string;
  marketplaceId?: string;
  isActive?: boolean;
  lowStock?: boolean;
};

export type ProductResponseDto = {
  id: string;
  marketplaceId: string;
  marketplaceName: string;
  marketplaceType: string;
  title: string;
  sku: string;
  price: string;
  stock: number;
  rating: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductDetailResponseDto = ProductResponseDto & {
  reviews: {
    id: string;
    authorName: string;
    rating: number;
    text: string;
    status: string;
    answerText: string | null;
    createdAt: string;
  }[];
  analytics: {
    id: string;
    date: string;
    views: number;
    ordersCount: number;
    revenue: string;
    conversionRate: string;
  }[];
  recommendations: {
    id: string;
    type: string;
    title: string;
    content: string;
    isApplied: boolean;
    createdAt: string;
  }[];
};

export type CreateProductRequestDto = {
  marketplaceId: string;
  title: string;
  sku: string;
  price: string;
  stock: number;
  rating?: string | null;
  isActive?: boolean;
};

export type UpdateProductRequestDto = {
  title?: string;
  sku?: string;
  price?: string;
  stock?: number;
  rating?: string | null;
  isActive?: boolean;
};