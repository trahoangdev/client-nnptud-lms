import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";

interface JoinConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoined: () => void;
}

export function JoinConversationModal({
  open,
  onOpenChange,
  onJoined,
}: JoinConversationModalProps) {
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!roomCode.trim()) {
      toast.error("Vui lòng nhập mã phòng");
      return;
    }
    setIsLoading(true);
    try {
      const result: { success: boolean; conversationName: string } =
        await api.post("/conversations/join", {
          roomCode: roomCode.trim().toUpperCase(),
        });
      toast.success(`Đã tham gia hội thoại "${result.conversationName}"!`);
      setRoomCode("");
      onJoined();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lỗi tham gia hội thoại";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && roomCode.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-primary" />
            Tham gia hội thoại
          </DialogTitle>
          <DialogDescription>
            Nhập mã phòng do giảng viên cung cấp để tham gia hội thoại.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Mã phòng</Label>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Ví dụ: A1B2C3"
              className="text-center text-lg font-mono font-bold tracking-widest uppercase"
              maxLength={6}
              autoFocus
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !roomCode.trim()}
            className="w-full"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Tham gia
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
