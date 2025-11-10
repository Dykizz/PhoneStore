import type {
  ApiResponse,
  ApiResponseSuccess,
} from "@/interfaces/apiResponse.interface";
import type { DetailUser } from "@/types/user.type";
import apiClient from "@/utils/apiClient";
import { ChangePasswordSchema, ProfileSchema } from "@/types/user.type";
import { z } from "zod";

export async function getMyProfile(): Promise<ApiResponse<DetailUser>> {
  return await apiClient.get<DetailUser>("/users/my-profile");
}

export function updateProfile(
  data: z.infer<typeof ProfileSchema>
): Promise<ApiResponseSuccess<DetailUser>> {
  return apiClient.patch<ApiResponseSuccess<DetailUser>>(
    "/users/profile",
    data
  );
}

export function changePassword(
  data: z.infer<typeof ChangePasswordSchema>
): Promise<ApiResponseSuccess<null>> {
  return apiClient.patch<ApiResponseSuccess<null>>(
    "/users/change-password",
    data
  );
}
