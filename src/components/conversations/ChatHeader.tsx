import {
  Users,
  MoreVertical,
  Phone,
  Video,
  Search,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Conversation } from "./types";

interface ChatHeaderProps {
  conversation: Conversation | null;
  showMembers: boolean;
  onToggleMembers: () => void;
}

export function ChatHeader({
  conversation,
  showMembers,
  onToggleMembers,
}: ChatHeaderProps) {
  return (
    <CardHeader className="py-2.5 px-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate max-w-[200px]">
              {conversation?.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {conversation?.members.length} thành viên
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Video className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleMembers}
            title={showMembers ? "Ẩn thành viên" : "Hiện thành viên"}
          >
            {showMembers ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onToggleMembers}>
                <Users className="w-4 h-4 mr-2" />
                Xem thành viên
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Search className="w-4 h-4 mr-2" />
                Tìm trong cuộc trò chuyện
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
  );
}
