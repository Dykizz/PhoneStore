import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { AuthResponse, LoginData, RegisterData } from "@/types/auth.type";
import apiClient from "@/utils/apiClient";

export const login = async (
  loginData: LoginData
): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", loginData);
  return response;
};

export const register = async (
  registerData: RegisterData
): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<void>("/auth/register", registerData);
  return response;
};

export const logout = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<void>("/auth/logout");
  return response;
};
