import { createContext, useContext } from "react";
import type { BaseUser } from "@/types/user.type";

interface AuthContextType {
  user: BaseUser | null;
  loading: boolean;
  login: (userData: BaseUser, accessToken: string) => void;
  logout: () => Promise<void>;
  setShowLoginDialog: (show: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
