import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import axios from "axios";
import type {
  InternalAxiosRequestConfig,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

// Mở rộng interface AxiosRequestConfig để thêm thuộc tính _retry
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Interface cho response.config trong interceptor
interface ExtendedInternalAxiosRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private isRefreshing = false;
  private onAuthFailure?: () => void;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true, // <== quan trọng để gửi cookie cùng request
      timeout: 20000, // 20 giây timeout
    });

    // Thêm token vào mọi request
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${this.accessToken}`;
      } else {
        // Lấy accessToken từ localStorage nếu chưa có trong biến
        const accessToken =
          typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;
        if (accessToken) {
          this.accessToken = accessToken;
          config.headers = config.headers ?? {};
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
      }
      return config;
    });

    // Xử lý response và refresh token khi cần
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Kiểm tra response.data có cấu trúc của API và statusCode là 401
        const responseData = response.data as { statusCode: number; [key: string]: unknown };
        if (
          responseData &&
          responseData.statusCode === 401 &&
          !(response.config as ExtendedInternalAxiosRequestConfig)._retry
        ) {
          return this.handleTokenRefresh(
            response.config as ExtendedInternalAxiosRequestConfig
          );
        }
        return response;
      },
      (error) => {
        // Better error logging với fallbacks
        const safeLog = {
          message: error?.message || "Unknown error",
          code: error?.code || "NO_CODE",
          url: error?.config?.url || "Unknown URL",
          method: error?.config?.method?.toUpperCase() || "UNKNOWN",
          status: error?.response?.status || "No status",
          statusText: error?.response?.statusText || "No status text",
        };

        // Chỉ log response data nếu có và không quá lớn
        if (error?.response?.data) {
          try {
            const dataStr = JSON.stringify(error.response.data);
            safeLog.responseData =
              dataStr.length > 500
                ? `${dataStr.substring(0, 500)}... (truncated)`
                : error.response.data;
          } catch (e) {
            safeLog.responseData = "Unable to serialize response data";
          }
        }

        //Môi trường dev thì log chi tiết hơn
        if (process.env.NODE_ENV === "development") {
          console.error("API Request Failed:", safeLog);
        }

        // Handle token refresh cho HTTP errors
        if (
          error?.response?.data?.statusCode === 401 &&
          error?.config &&
          !error.config._retry
        ) {
          return this.handleTokenRefresh(
            error.config as ExtendedInternalAxiosRequestConfig
          );
        }

        return Promise.reject(error);
      }
    );
  }

  public setAuthFailureCallback(callback: () => void) {
    this.onAuthFailure = callback;
  }

  private handleTokenRefresh(
    config: ExtendedInternalAxiosRequestConfig
  ): Promise<AxiosResponse> {
    if (this.isRefreshing) {
      return new Promise<AxiosResponse>((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          config.headers = config.headers || {};
          config.headers["Authorization"] = `Bearer ${token}`;
          resolve(this.axiosInstance(config));
        });
      });
    }

    // Đánh dấu request đã được thử refresh token
    config._retry = true;
    this.isRefreshing = true;

    // Gọi API refresh token, cookie refreshToken tự gửi đi
    return this.axiosInstance
      .post("/auth/refresh-token")
      .then((res) => {
        const newAccessToken = res.data.data.accessToken;
        this.accessToken = newAccessToken;
        this.isRefreshing = false;
        this.onRefreshed(newAccessToken);

        // Sử dụng token mới cho request hiện tại
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return this.axiosInstance(config);
      })
      .catch((err) => {
        this.isRefreshing = false;
        if (process.env.NODE_ENV === "development") {
          console.error("Token refresh failed:", err);
        }

        // Clear all auth data
        this.clearToken();
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("permissionCodes");
        }

        if (this.onAuthFailure) {
          this.onAuthFailure();
        } else {
          // Fallback: direct redirect without notification
          if (typeof window !== "undefined") {
            setTimeout(() => {
              window.location.href = "/login";
            }, 1000);
          }
        }

        return Promise.reject(err);
      });
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  public setAccessToken(token: string) {
    this.accessToken = token;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public clearToken() {
    this.accessToken = null;
  }
  public async apiFetch<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.request<ApiResponse<T>>({
      url,
      ...config,
      validateStatus: () => true,
    });
  }

  // Các phương thức tiện ích cho các HTTP verbs phổ biến
  public async get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.apiFetch<T>(url, {
      method: "GET",
      params,
      ...config,
    });
    return response.data;
  }

  public async post<T = unknown>(
    url: string,
    data?: Record<string, unknown> | unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    // Tạo config mới với headers được merge đúng cách
    const mergedConfig: AxiosRequestConfig = {
      ...(config || {}),
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
        ...(config?.headers || {}),
      },
    };

    const response = await this.apiFetch<T>(url, mergedConfig);
    return response.data;
  }

  public async put<T = unknown>(
    url: string,
    data?: Record<string, unknown> | unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    // Tạo config mới với headers được merge đúng cách
    const mergedConfig: AxiosRequestConfig = {
      ...(config || {}),
      method: "PUT",
      data,
      headers: {
        "Content-Type": "application/json",
        ...(config?.headers || {}),
      },
    };

    const response = await this.apiFetch<T>(url, mergedConfig);
    return response.data;
  }

  public async patch<T = unknown>(
    url: string,
    data?: Record<string, unknown> | unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    // Tạo config mới với headers được merge đúng cách
    const mergedConfig: AxiosRequestConfig = {
      ...(config || {}),
      method: "PATCH",
      data,
      headers: {
        "Content-Type": "application/json",
        ...(config?.headers || {}),
      },
    };

    const response = await this.apiFetch<T>(url, mergedConfig);
    return response.data;
  }

  public async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.apiFetch<T>(url, {
      method: "DELETE",
      ...config,
    });
    return response.data;
  }
}

const apiClient = new ApiClient("http://localhost:8000");

export default apiClient;
