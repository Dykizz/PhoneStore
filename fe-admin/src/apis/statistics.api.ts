import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { StatisticsResponse } from "@/types/statistics.type";
import apiClient from "@/utils/apiClient";

export async function getStatistics(
  from: string,
  to: string,
  granularity: "day" | "month" | "year" = "day"
): Promise<ApiResponse<StatisticsResponse>> {
  const query = `from=${from}&to=${to}&granularity=${granularity}`;
  return await apiClient.get<StatisticsResponse>("/statistics?" + query);
}
