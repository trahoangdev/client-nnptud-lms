/**
 * NotificationCenter — bell icon with badge + dropdown list.
 * Used in Header / AppLayout.
 */

import { useState } from "react";
import { Bell, Check, CheckCheck, MessageSquare, BookOpen, Award, Info, ClipboardList, MessagesSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, typeof Bell> = {
  submission: BookOpen,
  grade: Award,
  comment: MessageSquare,
  assignment: ClipboardList,
  conversation: MessagesSquare,
  message: Send,
  system: Info,
};

const typeColors: Record<string, string> = {
  submission: "text-blue-500",
  grade: "text-green-500",
  comment: "text-orange-500",
  assignment: "text-purple-500",
  conversation: "text-indigo-500",
  message: "text-cyan-500",
  system: "text-gray-500",
};

export function NotificationCenter() {
  const { notifications, unreadCount, markRead, markAllRead, clearRead, refresh } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const hasRead = notifications.some((n) => n.isRead);

  // Re-fetch whenever the popover is opened
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) refresh();
  };

  const handleClick = (notif: { id: number; link: string | null; isRead: boolean }) => {
    if (!notif.isRead) markRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="font-semibold text-sm">Thông báo</h4>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => markAllRead()}
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Đọc tất cả
              </Button>
            )}
            {hasRead && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-destructive hover:text-destructive"
                onClick={() => clearRead()}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Xóa đã đọc
              </Button>
            )}
          </div>
        </div>
        <Separator />
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Chưa có thông báo
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 20).map((notif) => {
                const Icon = typeIcons[notif.type] || Bell;
                const color = typeColors[notif.type] || "text-gray-500";
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3",
                      !notif.isRead && "bg-primary/5"
                    )}
                  >
                    <div className={cn("mt-0.5 flex-shrink-0", color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", !notif.isRead && "text-foreground")}>
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-xs text-muted-foreground/60 mt-1 block">
                        {format(new Date(notif.createdAt), "dd/MM HH:mm", { locale: vi })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
