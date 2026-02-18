/**
 * Auth API service — login, register, profile, password
 */

import { api } from "../client";
import type { AuthUser, UserProfile } from "../types";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  /** POST /login */
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/login", { email, password }),

  /** POST /register */
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<{ message: string; userId: number }>("/register", data),

  /** GET /me */
  getProfile: () =>
    api.get<UserProfile>("/me"),

  /** PATCH /me — update profile (name, email) */
  updateProfile: (data: { name?: string; email?: string }) =>
    api.patch<UserProfile>("/me", data),

  /** PATCH /me/password — change password */
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<{ message: string }>("/me/password", { currentPassword, newPassword }),
};
