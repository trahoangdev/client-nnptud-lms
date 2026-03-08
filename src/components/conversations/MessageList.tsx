import { useEffect, useRef } from "react";
import { Check, CheckCheck, Ban, Trash2, Undo2 } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { Message } from "./types";

interface MessageListProps {
  messages: Message[];
  onRecallMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export function MessageList({ messages, onRecallMessage, onDeleteMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  let currentDate = "";
  for (const msg of messages) {
    if (msg.date !== currentDate) {
      currentDate = msg.date;
      groupedMessages.push({ date: msg.date, msgs: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  }

  return (
    <CardContent className="flex-1 overflow-hidden p-0">
      <ScrollArea className="h-full p-4">
        <div className="space-y-4">
          {groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-4 my-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground px-2">
                  {group.date}
                </span>
                <Separator className="flex-1" />
              </div>
              {group.msgs.map((msg) => {
                const messageContent = (
                  <div
                    className={cn("flex gap-3", msg.isOwn ? "flex-row-reverse" : "")}
                  >
                    {!msg.isOwn && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback
                          className={cn(
                            msg.senderRole === "teacher"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {msg.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[70%]",
                        msg.isOwn ? "items-end" : "items-start"
                      )}
                    >
                      {!msg.isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{msg.senderName}</span>
                          {msg.senderRole === "teacher" && (
                            <Badge variant="secondary" className="text-xs py-0 h-5">
                              Giảng viên
                            </Badge>
                          )}
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2",
                          msg.isRecalled
                            ? "bg-muted/50 border border-dashed border-muted-foreground/30"
                            : msg.isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                        )}
                      >
                        {msg.isRecalled ? (
                          <p className="text-sm italic text-muted-foreground flex items-center gap-1.5">
                            <Ban className="w-3.5 h-3.5" />
                            Tin nhắn đã được thu hồi
                          </p>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1",
                          msg.isOwn ? "justify-end" : ""
                        )}
                      >
                        <span className="text-xs text-muted-foreground">
                          {msg.time}
                        </span>
                        {msg.isOwn && !msg.isRecalled &&
                          (msg.status === "read" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-muted-foreground" />
                          ))}
                      </div>
                    </div>
                  </div>
                );

                // Wrap own non-recalled messages with context menu
                if (msg.isOwn && !msg.isRecalled && (onRecallMessage || onDeleteMessage)) {
                  return (
                    <ContextMenu key={msg.id}>
                      <ContextMenuTrigger asChild>
                        {messageContent}
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        {onRecallMessage && (
                          <ContextMenuItem onClick={() => onRecallMessage(msg.id)}>
                            <Undo2 className="w-4 h-4 mr-2" />
                            Thu hồi tin nhắn
                          </ContextMenuItem>
                        )}
                        {onDeleteMessage && (
                          <ContextMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDeleteMessage(msg.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xoá tin nhắn
                          </ContextMenuItem>
                        )}
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                }

                return <div key={msg.id}>{messageContent}</div>;
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </CardContent>
  );
}
