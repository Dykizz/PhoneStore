import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { DetailUser } from "@/types/user.type";
import apiClient from "@/utils/apiClient";

export async function getMyProfile(): Promise<ApiResponse<DetailUser>> {
  return await apiClient.get<DetailUser>("/users/my-profile");
}
