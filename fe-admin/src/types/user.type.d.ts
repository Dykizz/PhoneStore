export type UserRole = "admin" | "user" | "employee";
export interface IUser {
    id: string;
    username: string;
    email: string;
    role: UserRole;
}
export interface BaseUser {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    avatar?: string;
}
export interface DetailUser extends BaseUser {
    createdAt: string;
    updatedAt: string;
}
