export type ProductListQueryDto = {
  search?: string;
  marketplaceId?: string;
  isActive?: boolean;
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