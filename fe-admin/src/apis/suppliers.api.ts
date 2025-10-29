import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import type { Supplier } from "@/types/supplier.type";
import apiClient from "@/utils/apiClient";

export async function getSuppliers(
  query: string
): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
  return await apiClient.get<PaginatedResponse<Supplier>>(`/suppliers${query}`);
}

export async function createSupplier(data: {
  name: string;
  description?: string;
}): Promise<ApiResponse<Supplier>> {
  return await apiClient.post<Supplier>(`/suppliers`, data);
}

export async function updateSupplier(
  id: string,
  data: { name: string; description?: string }
): Promise<ApiResponse<Supplier>> {
  return await apiClient.patch<Supplier>(`/suppliers/${id}`, data);
}

export async function deleteSupplier(id: string): Promise<ApiResponse<null>> {
  return await apiClient.delete<null>(`/suppliers/${id}`);
}
