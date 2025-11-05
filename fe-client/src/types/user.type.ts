import { z } from 'zod';
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
}

export interface DetailUser extends BaseUser {
  createdAt: string;
  updatedAt: string;
}

export const ProfileSchema = z.object({
  userName: z
    .string()
    .min(2, 'Tên người dùng phải có ít nhất 2 ký tự'),
  avatar: z
    .string()
    .optional()
    .or(z.literal('')) 
})

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu cũ'),
    newPassword: z
      .string()
      .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })
