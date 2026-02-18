import {
  Users,
  MoreVertical,
  Phone,
  Video,
  Search,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  Copy,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Conversation } from "./types";
import { toast } from "sonner";

interface ChatHeaderProps {
  conversation: Conversation | null;
  showMembers: boolean;
  onToggleMembers: () => void;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ChatHeader({
  conversation,
  showMembers,
  onToggleMembers,
  onBack,
  onEdit,
  onDelete,
}: ChatHeaderProps) {
  return (
    <CardHeader className="py-2.5 px-3 md:px-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden shrink-0"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate max-w-[140px] sm:max-w-[200px] md:max-w-[250px]">
              {conversation?.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {conversation?.members.length} thành viên
              {conversation?.roomCode && (
                <span className="ml-1.5 font-mono">· Mã: {conversation.roomCode}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex">
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
              {conversation?.roomCode && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(conversation.roomCode!);
                      toast.success("Đã sao chép mã phòng: " + conversation.roomCode);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Sao chép mã phòng
                  </DropdownMenuItem>
                </>
              )}
              {(onEdit || onDelete) && (
                <>
                  <DropdownMenuSeparator />
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Chỉnh sửa hội thoại
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xoá hội thoại
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
  );
}
