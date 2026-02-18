/**
 * Admin API service — users, classes, stats, logs, settings, reports
 */

import { api } from "../client";
import type {
  AdminStats,
  AdminSettings,
  ActivityLogsResponse,
  GradeDistribution,
  SubmissionReport,
  UserProfile,
  ClassItem,
} from "../types";

export const adminService = {
  // ---- Users ----

  /** GET /admin/users */
  listUsers: (params?: { role?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.role) qs.set("role", params.role);
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString();
    return api.get<UserProfile[]>(`/admin/users${query ? `?${query}` : ""}`);
  },

  /** POST /admin/users */
  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    api.post<UserProfile>("/admin/users", data),

  /** PATCH /admin/users/:id */
  updateUser: (id: number, data: { status?: string; name?: string; email?: string }) =>
    api.patch<UserProfile>(`/admin/users/${id}`, data),

  // ---- Classes ----

  /** GET /admin/classes */
  listClasses: (params?: { status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString();
    return api.get<ClassItem[]>(`/admin/classes${query ? `?${query}` : ""}`);
  },

  // ---- Stats & Reports ----

  /** GET /admin/stats */
  getStats: () =>
    api.get<AdminStats>("/admin/stats"),

  /** GET /admin/reports/submissions */
  getSubmissionReport: (timeRange = "month") =>
    api.get<SubmissionReport>(`/admin/reports/submissions?timeRange=${timeRange}`),

  /** GET /admin/reports/grades */
  getGradeReport: () =>
    api.get<GradeDistribution>("/admin/reports/grades"),

  // ---- Activity Logs ----

  /** GET /admin/activity-logs */
  getActivityLogs: (params?: { role?: string; actionType?: string; status?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.role) qs.set("role", params.role);
    if (params?.actionType) qs.set("actionType", params.actionType);
    if (params?.status) qs.set("status", params.status);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    return api.get<ActivityLogsResponse>(`/admin/activity-logs?${qs.toString()}`);
  },

  // ---- Settings ----

  /** GET /admin/settings */
  getSettings: () =>
    api.get<AdminSettings>("/admin/settings"),

  /** PATCH /admin/settings */
  updateSettings: (data: Partial<AdminSettings>) =>
    api.patch<{ message: string; settings: Partial<AdminSettings> }>("/admin/settings", data),
};
