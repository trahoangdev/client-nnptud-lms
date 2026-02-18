/**
 * Classes API service
 */

import { api } from "../client";
import type { ClassItem, ClassDetailItem } from "../types";

export const classesService = {
  /** GET /classes — list classes for current user */
  list: () =>
    api.get<ClassItem[]>("/classes"),

  /** POST /classes — create class */
  create: (data: { name: string; description?: string; teacherId?: number }) =>
    api.post<ClassItem>("/classes", data),

  /** GET /classes/:id — class detail */
  getById: (id: number) =>
    api.get<ClassDetailItem>(`/classes/${id}`),

  /** PATCH /classes/:id — update class */
  update: (id: number, data: { name?: string; description?: string; status?: string }) =>
    api.patch<ClassItem>(`/classes/${id}`, data),

  /** DELETE /classes/:id — archive class */
  remove: (id: number) =>
    api.delete<{ message: string; class: ClassItem }>(`/classes/${id}`),

  /** POST /classes/join — student join by code */
  join: (code: string) =>
    api.post<{ message: string; classId: number; className: string }>("/classes/join", { code }),

  /** POST /classes/:id/enroll — add student to class */
  enroll: (classId: number, studentId: number) =>
    api.post<{ message: string }>(`/classes/${classId}/enroll`, { studentId }),
};
