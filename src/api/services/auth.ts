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

  /** POST /me/avatar — upload avatar */
  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/me/avatar`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Upload failed");
    }
    return res.json();
  },
};
