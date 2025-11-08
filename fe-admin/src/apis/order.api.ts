import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import type { BaseOrder, OrderStatus } from "@/types/order.type";
import apiClient from "@/utils/apiClient";

export async function getOrders(
  query: string
): Promise<ApiResponse<PaginatedResponse<BaseOrder>>> {
  return await apiClient.get<PaginatedResponse<BaseOrder>>(`/orders${query}`);
}

export async function getOrder(id: string) {
  return await apiClient.get(`/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return await apiClient.patch(`/orders/${id}/status`, { status });
}
