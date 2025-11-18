import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { DetailUser, UpdateUser } from "@/types/user.type";
import apiClient from "@/utils/apiClient";

export async function getMyProfile(): Promise<ApiResponse<DetailUser>> {
  return await apiClient.get<DetailUser>("/users/my-profile");
}

export function updateProfile(data: UpdateUser): Promise<ApiResponse<void>> {
  return apiClient.patch<void>("/users/my-profile", data);
}

export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse<void>> {
  return apiClient.patch<void>("/users/my-profile/change-password", data);
}
