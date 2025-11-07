import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import apiClient from "@/utils/apiClient";
import type { ProductType } from "@/types/productType.type";

export async function getProductTypes(
  query: string = "?page=1&limit=100"
): Promise<ApiResponse<PaginatedResponse<ProductType>>> {
  return await apiClient.get<PaginatedResponse<ProductType>>(`/product-types${query}`);
}
