import React, { useEffect, useMemo, useState } from "react";
import type { BaseUser } from "@/types/user.type";
import apiClient from "@/utils/apiClient";
import { getMyProfile } from "@/apis/user.api";
import { AuthContext } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        setUser(null);
        return;
      }
      const response = await getMyProfile();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData: BaseUser, accessToken: string) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    apiClient.setAccessToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    await apiClient.post("/auth/logout");
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    apiClient.clearToken();
    setUser(null);
    window.location.href = "/login";
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
