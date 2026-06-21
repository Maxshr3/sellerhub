import { apiGet } from "./client";
import type { ProductsResponse } from "../types/product";

export function getProducts(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";

  return apiGet<ProductsResponse>(`/products${query}`);
}