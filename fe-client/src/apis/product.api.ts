import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import apiClient from "@/utils/apiClient";
import type { BaseProduct, DetailProduct } from "@/types/product.type";
import type { CartItem } from "@/contexts/cartContexts";

export async function getProducts(
  query: string
): Promise<ApiResponse<PaginatedResponse<BaseProduct>>> {
  return await apiClient.get<PaginatedResponse<BaseProduct>>(
    `/products${query}`
  );
}

export async function getProduct(
  id: string
): Promise<ApiResponse<DetailProduct>> {
  return await apiClient.get<DetailProduct>(`/products/${id}`);
}

export async function getProductVariantsByIds(
  ids: string[]
): Promise<ApiResponse<CartItem[]>> {
  return await apiClient.post<CartItem[]>(`/products/variants`, {
    ids,
  });
}
