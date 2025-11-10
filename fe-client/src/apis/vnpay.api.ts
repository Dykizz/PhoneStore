import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { CreatePayment } from "@/types/vnpay.type";
import apiClient from "@/utils/apiClient";

export async function createPaymentVNPay(
  paymentData: CreatePayment
): Promise<ApiResponse<{ vnpUrl: string }>> {
  const response = await apiClient.post<{ vnpUrl: string }>(
    "/payment/create-vnpay",
    paymentData
  );
  return response;
}
