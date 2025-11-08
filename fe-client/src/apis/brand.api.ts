import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import apiClient from "@/utils/apiClient";
import type { Brand } from "@/types/brand.type";

export async function getBrands(
  query: string = "?page=1&limit=100"
): Promise<ApiResponse<PaginatedResponse<Brand>>> {
  return await apiClient.get<PaginatedResponse<Brand>>(`/brands${query}`);
}
