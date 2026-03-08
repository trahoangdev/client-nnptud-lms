import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, Search, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Conversation } from "./types";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conversation: Conversation) => void;
  showRoomCode?: boolean;
}

export function ConversationList({
  conversations,
  selectedConversation,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  showRoomCode = false,
}: ConversationListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyRoomCode = (e: React.MouseEvent, code: string, convId: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã phòng: " + code);
    setCopiedId(convId);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full md:w-72 flex-shrink-0"
    >
      <Card className="h-full border-0 shadow-md flex flex-col">
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="px-2 pb-2">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={cn(
                    "w-full p-2.5 rounded-lg text-left transition-all mb-1 overflow-hidden",
                    selectedConversation?.id === conv.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm">
                        {conv.type === "group" ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          conv.name.charAt(0)
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden" style={{ maxWidth: 'calc(100% - 50px)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-0 flex-1 truncate">
                          {conv.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {conv.lastMessage.time}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-0.5 truncate",
                          conv.unreadCount > 0
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {conv.lastMessage.sender.split(" ").pop()}:{" "}
                        {conv.lastMessage.content}
                      </p>
                      {showRoomCode && conv.roomCode && (
                        <span
                          onClick={(e) => handleCopyRoomCode(e, conv.roomCode!, conv.id)}
                          className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                          title="Nhấn để sao chép mã phòng"
                        >
                          {copiedId === conv.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          {conv.roomCode}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
