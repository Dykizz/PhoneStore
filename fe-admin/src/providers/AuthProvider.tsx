import React, { useEffect, useMemo, useState } from "react";
import type { BaseUser } from "@/types/user.type";
import apiClient from "@/utils/apiClient";
import { getMyProfile } from "@/apis/user.api";
import { AuthContext } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      apiClient.clearToken();
      setUser(null);
      window.location.href = "/login";
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await getMyProfile();

      if (response.success) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } else {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        apiClient.clearToken();
        console.error("Failed to fetch user profile");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      // Clear local data nhưng KHÔNG redirect
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData: BaseUser, accessToken: string) => {
    if (!accessToken) {
      console.error("Access token is required for login");
    }
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    apiClient.setAccessToken(accessToken);
    setUser(userData);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
