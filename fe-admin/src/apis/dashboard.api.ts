import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import apiClient from "@/utils/apiClient";

export interface DashboardSummary {
  userSummary: { admin: number; user: number; employee: number };
  productSummary: {
    total: number;
    released: number;
    unreleased: number;
    totalVariants: number;
  };
}

export interface TodayRevenueResponse {
  today: number;
  yesterday: number;
  change: number;
  isHigher: boolean;
  pctChange: number;
}

export async function getDashboardSummary(): Promise<
  ApiResponse<DashboardSummary>
> {
  return await apiClient.get<DashboardSummary>(`/statistics/dashboard-summary`);
}

export async function getTodayRevenue(): Promise<
  ApiResponse<TodayRevenueResponse>
> {
  return await apiClient.get<TodayRevenueResponse>(`/statistics/today-revenue`);
}
