import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import type { Brand, CreateBrand, UpdateBrand } from "@/types/brand.type";
import apiClient from "@/utils/apiClient";
import { uploadImages } from "./upload.api";

export async function getBrands(
  query: string
): Promise<ApiResponse<PaginatedResponse<Brand>>> {
  return await apiClient.get<PaginatedResponse<Brand>>(`/brands${query}`);
}

export async function createBrand(
  data: CreateBrand
): Promise<ApiResponse<Brand>> {
  if (data?.image instanceof File) {
    const [imgUrl] = await uploadImages([data.image]);
    data.image = imgUrl;
  }
  return await apiClient.post<Brand>(`/brands`, data);
}

export async function updateBrand(
  id: string,
  data: UpdateBrand
): Promise<ApiResponse<Brand>> {
  if (data?.image instanceof File) {
    const [imgUrl] = await uploadImages([data.image]);
    data.image = imgUrl;
  }
  return await apiClient.patch<Brand>(`/brands/${id}`, data);
}

export async function deleteBrand(id: string): Promise<ApiResponse<null>> {
  return await apiClient.delete<null>(`/brands/${id}`);
}
