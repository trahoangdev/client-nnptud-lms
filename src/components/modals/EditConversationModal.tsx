import { useState, useEffect } from "react";
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
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import type { Conversation } from "@/components/conversations/types";

interface EditConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation | null;
  onUpdated: () => void;
}

export function EditConversationModal({
  open,
  onOpenChange,
  conversation,
  onUpdated,
}: EditConversationModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && conversation) {
      setName(conversation.name);
    }
  }, [open, conversation]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Tên hội thoại không được trống");
      return;
    }
    if (!conversation) return;

    setIsLoading(true);
    try {
      await api.patch(`/conversations/${conversation.id}`, {
        name: name.trim(),
      });
      toast.success("Cập nhật hội thoại thành công!");
      onUpdated();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lỗi cập nhật hội thoại";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Chỉnh sửa hội thoại
          </DialogTitle>
          <DialogDescription>
            Thay đổi tên hội thoại.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tên hội thoại</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tên hội thoại..."
              autoFocus
            />
          </div>

          {conversation?.roomCode && (
            <div className="space-y-2">
              <Label>Mã phòng</Label>
              <Input
                value={conversation.roomCode}
                readOnly
                className="text-center font-mono font-bold tracking-widest bg-muted"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
