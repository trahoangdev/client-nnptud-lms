import { motion } from "framer-motion";
import { MessageSquare, Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Conversation } from "./types";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conversation: Conversation) => void;
}

export function ConversationList({
  conversations,
  selectedConversation,
  searchQuery,
  onSearchChange,
  onSelectConversation,
}: ConversationListProps) {
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-72 flex-shrink-0"
    >
      <Card className="h-full border-0 shadow-md flex flex-col">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Hội thoại
          </CardTitle>
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
                  <div className="flex items-center gap-2.5 min-w-0">
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
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <p className="text-sm font-medium truncate min-w-0">
                          {conv.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
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
