export interface TimeSeriesStatistics {
  labels: string[]; // ["2025-10-17", "2025-10-18", ...] (format theo granularity)
  sold: number[]; // [20, 33, 46, ...]   => tổng quantity cho mỗi period
  revenue: number[]; // [5000000, 8250429, ...] => tổng itemTotal cho mỗi period
}
export interface TopCustomerStatistics {
  customerId: string;
  name: string;
  revenue: number;
  orders: number;
}

export interface TopProductStatistics {
  productId: string;
  name: string;
  revenue: number;
  orders: number;
}
export interface StatisticsResponse {
  soldAndRevenue: TimeSeriesStatistics;
  top5User: TopCustomerStatistics[];
  top5Product: TopProductStatistics[];
}
