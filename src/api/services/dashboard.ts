/**
 * Dashboard API service — teacher + student enhanced stats
 */

import { api } from "../client";
import type { TeacherDashboardStats, StudentDashboardStats, GradebookData } from "../types";

export const dashboardService = {
  teacherStats: () => api.get<TeacherDashboardStats>("/teacher/dashboard-stats"),

  studentStats: () => api.get<StudentDashboardStats>("/student/dashboard-stats"),

  gradebook: (classId: number) =>
    api.get<GradebookData>(`/classes/${classId}/gradebook`),
};
