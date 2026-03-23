/**
 * Notification API service
 */

import { api } from "../client";
import type { NotificationItem, PaginatedResponse } from "../types";

export const notificationsService = {
  list: (page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page != null) params.set("page", String(page));
    if (limit != null) params.set("limit", String(limit));
    const qs = params.toString();
    return api.get<NotificationItem[] | PaginatedResponse<NotificationItem>>(
      `/notifications${qs ? `?${qs}` : ""}`
    );
  },

  unreadCount: () => api.get<{ count: number }>("/notifications/unread-count"),

  markRead: (id: number) =>
    api.patch<NotificationItem>(`/notifications/${id}/read`, {}),

  markAllRead: () =>
    api.patch<{ message: string; count: number }>("/notifications/read-all", {}),

  clearRead: () =>
    api.delete<{ message: string; count: number }>("/notifications/read"),
};
