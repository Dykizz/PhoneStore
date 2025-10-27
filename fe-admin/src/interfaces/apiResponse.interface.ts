export interface ApiResponseSuccess<T> {
  statusCode: string;
  success: true;
  message: string;
  data: T;
}

export interface ApiResponseError {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;
