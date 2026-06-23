export type Product = {
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

export type ProductDetail = Product & {
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

export type ProductsResponse = {
  data: Product[];
  total: number;
};

export type ProductResponse = {
  data: Product;
};

export type ProductDetailResponse = {
  data: ProductDetail;
};

export type ProductFilters = {
  search?: string;
  marketplaceId?: string;
  isActive?: boolean;
  lowStock?: boolean;
};

export type CreateProductRequest = {
  marketplaceId: string;
  title: string;
  sku: string;
  price: string;
  stock: number;
  rating?: string | null;
  isActive?: boolean;
};

export type UpdateProductRequest = {
  title?: string;
  sku?: string;
  price?: string;
  stock?: number;
  rating?: string | null;
  isActive?: boolean;
};