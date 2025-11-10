import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import type { ProductType } from "@/types/productType.type";

import apiClient from "@/utils/apiClient";

export async function getProductTypes(
  query: string
): Promise<ApiResponse<PaginatedResponse<ProductType>>> {
  return await apiClient.get<PaginatedResponse<ProductType>>(
    `/product-types${query}`
  );
}

export async function createProductType(data: {
  name: string;
  description?: string;
}): Promise<ApiResponse<ProductType>> {
  return await apiClient.post<ProductType>(`/product-types`, data);
}

export async function updateProductType(
  id: string,
  data: { name: string; description?: string; defaultSpecifications?: string[] }
): Promise<ApiResponse<ProductType>> {
  return await apiClient.patch<ProductType>(`/product-types/${id}`, data);
}

export async function deleteProductType(
  id: string
): Promise<ApiResponse<null>> {
  return await apiClient.delete<null>(`/product-types/${id}`);
}
