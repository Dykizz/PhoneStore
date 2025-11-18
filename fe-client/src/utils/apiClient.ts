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
      withCredentials: true,
      timeout: 20000,
    });

    // Thêm token vào mọi request
    this.axiosInstance.interceptors.request.use((config) => {
      config.headers = config.headers ?? {};
      const url = String(config?.url || "").toLowerCase();

      // Nếu là route auth thì đánh dấu skip-refresh và không attach Authorization
      if (
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh-token")
      ) {
        config.headers["x-skip-refresh"] = "1";
        return config;
      }

      // Nếu request đã được đánh dấu skip-refresh thì không attach token
      const skipRefresh = !!config.headers["x-skip-refresh"];
      if (!skipRefresh) {
        if (this.accessToken) {
          config.headers["Authorization"] = `Bearer ${this.accessToken}`;
        } else {
          const accessToken =
            typeof window !== "undefined"
              ? localStorage.getItem("access_token")
              : null;
          if (accessToken) {
            this.accessToken = accessToken;
            config.headers["Authorization"] = `Bearer ${accessToken}`;
          }
        }
      }

      return config;
    });

    // Xử lý response và refresh token khi cần
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const responseData = response.data as any;
        const url = String(response.config?.url || "");
        const skipRefresh = !!response.config?.headers?.["x-skip-refresh"];
        const isAuthRoute =
          url.includes("/auth/login") || url.includes("/auth/refresh-token");

        if (
          responseData &&
          responseData.statusCode === 401 &&
          !(response.config as ExtendedInternalAxiosRequestConfig)._retry &&
          !skipRefresh &&
          !isAuthRoute
        ) {
          return this.handleTokenRefresh(
            response.config as ExtendedInternalAxiosRequestConfig
          );
        }

        return response;
      },
      (error) => {
        const safeLog: any = {
          message: error?.message || "Unknown error",
          code: error?.code || "NO_CODE",
          url: error?.config?.url || "Unknown URL",
          method: error?.config?.method?.toUpperCase() || "UNKNOWN",
          status: error?.response?.status || "No status",
          statusText: error?.response?.statusText || "No status text",
        };

        if (error?.response?.data) {
          try {
            const dataStr = JSON.stringify(error.response.data);
            safeLog.responseData =
              dataStr.length > 500
                ? `${dataStr.substring(0, 500)}... (truncated)`
                : error.response.data;
          } catch {
            safeLog.responseData = "Unable to serialize response data";
          }
        }

        const serverMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          (typeof error?.response?.data === "string"
            ? error.response.data
            : null);
        if (serverMsg) {
          error.message = String(serverMsg);
          safeLog.serverMessage = serverMsg;
        }

        if (process.env.NODE_ENV === "development") {
          console.error("API Request Failed:", safeLog);
        }

        const errUrl = String(error?.config?.url || "");
        const errSkip = !!error?.config?.headers?.["x-skip-refresh"];
        const isAuthRoute =
          errUrl.includes("/auth/login") ||
          errUrl.includes("/auth/refresh-token");

        // Nếu 401 và chưa retry, và không phải auth route / skip, thì thử refresh
        if (
          error?.response?.data?.statusCode === 401 &&
          error?.config &&
          !error.config._retry &&
          !errSkip &&
          !isAuthRoute
        ) {
          return this.handleTokenRefresh(
            error.config as ExtendedInternalAxiosRequestConfig
          );
        }

        // Nếu đã retry (đã refresh) mà vẫn 401 => clear và redirect (hoặc gọi callback)
        if (
          error?.response?.status === 401 &&
          error?.config &&
          error.config._retry
        ) {
          this.clearToken();
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            localStorage.removeItem("access_token");
            localStorage.removeItem("permissionCodes");
            try {
              const msg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "";
              if (msg && /ban|blocked|locked/i.test(msg)) {
                // optional: show toast about banned account
              }
            } catch {
              // ignore
            }
            window.location.href = "/login";
          }
          return Promise.reject(error);
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

    config._retry = true;
    this.isRefreshing = true;

    return this.axiosInstance
      .post("/auth/refresh-token", undefined, {
        headers: { "x-skip-refresh": "1" },
      })
      .then((res) => {
        const newAccessToken = res.data?.data?.accessToken;
        if (!newAccessToken) {
          throw new Error("No new access token returned");
        }
        this.accessToken = newAccessToken;
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", newAccessToken);
        }

        this.isRefreshing = false;
        this.onRefreshed(newAccessToken);

        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return this.axiosInstance(config);
      })
      .catch((err) => {
        this.isRefreshing = false;
        if (process.env.NODE_ENV === "development") {
          console.error("Token refresh failed:", err);
        }

        this.clearToken();
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("permissionCodes");
          localStorage.removeItem("access_token");
        }

        if (this.onAuthFailure) {
          this.onAuthFailure();
        } else {
          if (typeof window !== "undefined") {
            const pathname = window.location.pathname || "";
            const isOnLogin =
              pathname === "/login" ||
              pathname.startsWith("/login") ||
              pathname.toLowerCase().includes("login");

            if (!isOnLogin) {
              setTimeout(() => {
                window.location.href = "/login";
              }, 1000);
            }
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
    const headers = {
      "Content-Type": "application/json",
      ...(config?.headers || {}),
    } as Record<string, unknown>;

    if (
      !headers["x-skip-refresh"] &&
      (url?.includes("/auth/login") || url?.includes("/auth/register"))
    ) {
      headers["x-skip-refresh"] = "1";
    }

    const mergedConfig: AxiosRequestConfig = {
      ...(config || {}),
      method: "POST",
      data,
      headers,
    };

    const response = await this.apiFetch<T>(url, mergedConfig);
    return response.data;
  }

  public async put<T = unknown>(
    url: string,
    data?: Record<string, unknown> | unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
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
