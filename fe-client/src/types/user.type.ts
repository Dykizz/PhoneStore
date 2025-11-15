import { z } from "zod";
export type UserRole = "admin" | "user" | "employee";

export interface IUser {
  id: string;
  userName: string;
  email: string;
  role: UserRole;
}

export interface BaseUser {
  id: string;
  userName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phoneNumber?: string;
  isBlocked: boolean;
}

export interface DetailUser extends BaseUser {
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    userName: string;
  };
  defaultAddress?: string;
}

export interface CreateUser {
  email: string;
  userName: string;
  password: string;
  role?: UserRole;
  avatar?: string | File;
  phoneNumber?: string;
  defaultAddress?: string;
}

export type UpdateUser = Partial<CreateUser> & {
  isBlocked?: boolean;
};
