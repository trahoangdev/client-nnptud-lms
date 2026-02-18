/**
 * Assignments API service
 */

import { api } from "../client";
import type { AssignmentItem, StudentAssignmentWithSubmission } from "../types";

export interface CreateAssignmentData {
  title: string;
  description?: string;
  dueDate?: string;
  classId: number;
  fileUrl?: string;
  startTime?: string;
  allowLate?: boolean;
  maxScore?: number;
}

export const assignmentsService = {
  /** POST /assignments — create assignment */
  create: (data: CreateAssignmentData) =>
    api.post<AssignmentItem>("/assignments", data),

  /** GET /assignments/:id — assignment detail */
  getById: (id: number) =>
    api.get<AssignmentItem>(`/assignments/${id}`),

  /** PATCH /assignments/:id — update assignment */
  update: (id: number, data: Partial<CreateAssignmentData>) =>
    api.patch<AssignmentItem>(`/assignments/${id}`, data),

  /** DELETE /assignments/:id — delete assignment */
  remove: (id: number) =>
    api.delete<{ message: string }>(`/assignments/${id}`),

  /** GET /classes/:classId/assignments — list assignments for a class */
  listByClass: (classId: number) =>
    api.get<AssignmentItem[]>(`/classes/${classId}/assignments`),

  /** GET /student/assignments — all assignments for enrolled student */
  listForStudent: () =>
    api.get<StudentAssignmentWithSubmission[]>("/student/assignments"),
};
