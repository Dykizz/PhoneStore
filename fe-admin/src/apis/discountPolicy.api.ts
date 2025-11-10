import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import type {
  DiscountPolicy,
  CreateDiscountPolicy,
  UpdateDiscountPolicy,
} from "@/types/discountPolicy.type";
import apiClient from "@/utils/apiClient";

export async function getDiscountPolicies(
  query: string
): Promise<ApiResponse<PaginatedResponse<DiscountPolicy>>> {
  return await apiClient.get<PaginatedResponse<DiscountPolicy>>(
    `/discount-policies${query}`
  );
}

export async function createDiscountPolicy(
  data: CreateDiscountPolicy
): Promise<ApiResponse<DiscountPolicy>> {
  return await apiClient.post<DiscountPolicy>(`/discount-policies`, data);
}

export async function updateDiscountPolicy(
  id: string,
  data: UpdateDiscountPolicy
): Promise<ApiResponse<DiscountPolicy>> {
  return await apiClient.patch<DiscountPolicy>(
    `/discount-policies/${id}`,
    data
  );
}

export async function deleteDiscountPolicy(
  id: string
): Promise<ApiResponse<null>> {
  return await apiClient.delete<null>(`/discount-policies/${id}`);
}
