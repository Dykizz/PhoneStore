import type { BaseUser } from "./user.type";

export interface LoginData {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterData {
  userName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  remember: boolean;
  user: BaseUser;
}
