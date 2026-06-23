import { apiGet, apiPatch, apiPost } from "./client";
import type {
  CreateProductRequest,
  ProductDetailResponse,
  ProductFilters,
  ProductResponse,
  ProductsResponse,
  UpdateProductRequest,
} from "../types/product";

export function getProducts(filters?: ProductFilters) {
  const searchParams = new URLSearchParams();

  if (filters?.search) {
    searchParams.set("search", filters.search);
  }

  if (filters?.marketplaceId) {
    searchParams.set("marketplaceId", filters.marketplaceId);
  }

  if (filters?.isActive !== undefined) {
    searchParams.set("isActive", String(filters.isActive));
  }

  if (filters?.lowStock) {
    searchParams.set("lowStock", "true");
  }

  const query = searchParams.toString();

  return apiGet<ProductsResponse>(query ? `/products?${query}` : "/products");
}

export function getProductById(id: string) {
  return apiGet<ProductDetailResponse>(`/products/${id}`);
}

export function createProduct(data: CreateProductRequest) {
  return apiPost<ProductResponse, CreateProductRequest>("/products", data);
}

export function updateProduct(id: string, data: UpdateProductRequest) {
  return apiPatch<ProductResponse, UpdateProductRequest>(
    `/products/${id}`,
    data,
  );
}