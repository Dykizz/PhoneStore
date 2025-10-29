import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import type {
  BaseGoodsReceipt,
  CreateGoodReceipt,
  DetailGoodsReceipt,
} from "@/types/goodsReceipt.type";
import apiClient from "@/utils/apiClient";

export async function getGoodReceipts(
  query: string
): Promise<ApiResponse<PaginatedResponse<BaseGoodsReceipt>>> {
  return await apiClient.get(`/goods-receipts${query}`);
}

export async function createGoodsReceipt(
  data: CreateGoodReceipt
): Promise<ApiResponse<void>> {
  return await apiClient.post(`/goods-receipts`, data);
}

export async function getGoodsReceipt(
  id: string
): Promise<ApiResponse<DetailGoodsReceipt>> {
  return await apiClient.get<DetailGoodsReceipt>(`/goods-receipts/${id}`);
}
