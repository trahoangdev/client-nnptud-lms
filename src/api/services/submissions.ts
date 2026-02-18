/**
 * Submissions API service
 */

import { api } from "../client";
import type { SubmissionItem } from "../types";

export const submissionsService = {
  /** POST /submissions — create/update submission */
  submit: (data: { assignmentId: number; content?: string; fileUrl?: string }) =>
    api.post<SubmissionItem>("/submissions", data),

  /** GET /assignments/:assignmentId/submissions — list submissions */
  listByAssignment: (assignmentId: number) =>
    api.get<SubmissionItem[]>(`/assignments/${assignmentId}/submissions`),
};
