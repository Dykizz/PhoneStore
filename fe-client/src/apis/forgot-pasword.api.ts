import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import apiClient from "@/utils/apiClient";

export async function forgotPassword(
  email: string
): Promise<ApiResponse<void>> {
  return await apiClient.post<void>("/forgot-password", { email });
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  return await apiClient.post<void>("/forgot-password/reset-password", {
    token,
    newPassword,
  });
}
