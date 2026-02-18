/**
 * Comments API service
 */

import { api } from "../client";
import type { CommentItem } from "../types";

export const commentsService = {
  /** GET /comments — list comments */
  list: (params: { assignmentId?: number; submissionId?: number }) => {
    const qs = new URLSearchParams();
    if (params.assignmentId) qs.set("assignmentId", String(params.assignmentId));
    if (params.submissionId) qs.set("submissionId", String(params.submissionId));
    return api.get<CommentItem[]>(`/comments?${qs.toString()}`);
  },

  /** POST /comments — create comment */
  create: (data: { content: string; assignmentId?: number; submissionId?: number }) =>
    api.post<CommentItem>("/comments", data),

  /** PATCH /comments/:id — update comment */
  update: (id: number, content: string) =>
    api.patch<CommentItem>(`/comments/${id}`, { content }),

  /** DELETE /comments/:id — delete comment */
  remove: (id: number) =>
    api.delete<{ message: string }>(`/comments/${id}`),
};
