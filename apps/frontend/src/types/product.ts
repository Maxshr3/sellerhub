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

export type ProductsResponse = {
  data: Product[];
  total: number;
};