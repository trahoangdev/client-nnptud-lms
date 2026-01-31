import { Check, CheckCheck } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Message } from "./types";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <CardContent className="flex-1 overflow-hidden p-0">
      <ScrollArea className="h-full p-4">
        <div className="space-y-4">
          {/* Date separator */}
          <div className="flex items-center gap-4 my-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground px-2">Hôm nay</span>
            <Separator className="flex-1" />
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
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
                    msg.isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
                  {msg.isOwn &&
                    (msg.status === "read" ? (
                      <CheckCheck className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-muted-foreground" />
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  );
}
