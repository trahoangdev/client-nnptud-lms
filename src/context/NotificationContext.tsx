/**
 * NotificationContext — global notification state.
 * Fetches unread count, listens for socket `notification:new`,
 * manages notification list.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { api } from "@/api/client";
import type { NotificationItem } from "@/api/types";
import { toast } from "sonner";

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [notifs, countRes] = await Promise.all([
        api.get<NotificationItem[]>("/notifications"),
        api.get<{ count: number }>("/notifications/unread-count"),
      ]);
      setNotifications(notifs);
      setUnreadCount(countRes.count);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, refresh]);

  // Periodic refresh every 30s as fallback
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refresh();
    }, 30_000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  // Listen for new notifications via socket
  const handleNewNotification = useCallback(
    (data: NotificationItem) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.info(data.title, { description: data.message });
    },
    []
  );
  useSocketEvent("notification:new", handleNewNotification);

  const markRead = useCallback(async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, []);

  const clearRead = useCallback(async () => {
    try {
      const res = await api.delete<{ message: string; count: number }>("/notifications/read");
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      toast.success(`Đã xóa ${res.count} thông báo đã đọc`);
    } catch {
      toast.error("Không thể xóa thông báo");
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, refresh, markRead, markAllRead, clearRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
