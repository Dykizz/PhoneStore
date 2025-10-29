// src/apis/product.api.ts
import apiClient from "@/utils/apiClient";
import type { Product } from "@/data";
import type {
  ApiResponse,
  ApiResponseSuccess,
  ApiResponseError,
} from "@/interfaces/apiResponse.interface";

function isSuccess<T>(res: ApiResponse<T>): res is ApiResponseSuccess<T> {
  // Kiểm tra trường 'success' === true (theo interface của bạn)
  return (res as ApiResponseSuccess<T>).success === true;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await apiClient.get<Product[]>("/products"); // res: ApiResponse<Product[]>

  if (isSuccess(res)) {
    return res.data;
  }

  // Nếu không success => ném lỗi để caller xử lý
  const err = res as ApiResponseError;
  throw new Error(err.message || "Lỗi khi tải danh sách sản phẩm");
};

export const fetchProductById = async (
  id: string | number
): Promise<Product> => {
  const res = await apiClient.get<Product>(`/products/${id}`);

  if (isSuccess(res)) {
    return res.data;
  }

  const err = res as ApiResponseError;
  throw new Error(err.message || "Lỗi khi tải chi tiết sản phẩm");
};
