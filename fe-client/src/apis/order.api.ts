import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import type { BaseOrder, CreateOrder, DetailOrder } from "@/types/order.type";
import apiClient from "@/utils/apiClient";

export async function createOrder(
  data: CreateOrder
): Promise<ApiResponse<BaseOrder>> {
  return await apiClient.post<BaseOrder>("/orders", data);
}

export async function getMyOrders(
  query: string
): Promise<ApiResponse<PaginatedResponse<BaseOrder>>> {
  return await apiClient.get<PaginatedResponse<BaseOrder>>(
    `/orders/my-orders${query}`
  );
}

export async function getOrder(id: string): Promise<ApiResponse<DetailOrder>> {
  return await apiClient.get<DetailOrder>(`/orders/${id}`);
}
