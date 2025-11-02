import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import type {
  BaseUser,
  CreateUser,
  DetailUser,
  UpdateUser,
} from "@/types/user.type";
import apiClient from "@/utils/apiClient";

export async function getMyProfile(): Promise<ApiResponse<DetailUser>> {
  return await apiClient.get<DetailUser>("/users/my-profile");
}

export async function getUsers(
  query: string
): Promise<ApiResponse<PaginatedResponse<BaseUser>>> {
  return await apiClient.get<PaginatedResponse<BaseUser>>("/users" + query);
}

export async function createUser(data: CreateUser) {
  return await apiClient.post<null>("/users", data);
}

export async function getUser(id: string): Promise<ApiResponse<DetailUser>> {
  return await apiClient.get<DetailUser>(`/users/${id}`);
}

export async function updateUser(
  id: string,
  data: UpdateUser
): Promise<ApiResponse<void>> {
  return await apiClient.patch<void>(`/users/${id}`, data);
}
