import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";

interface ClassItem {
  id: number;
  name: string;
  code: string;
}

interface CreateConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateConversationModal({
  open,
  onOpenChange,
  onCreated,
}: CreateConversationModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch teacher's classes
  const { data: classes = [] } = useQuery<ClassItem[]>({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/classes"),
    enabled: open,
  });

  const handleSubmit = async () => {
    if (!selectedClassId) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/conversations", {
        classId: Number(selectedClassId),
        type: "class",
      });
      toast.success("Tạo hội thoại thành công!");
      setSelectedClassId("");
      onCreated();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lỗi tạo hội thoại";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Tạo hội thoại lớp học
          </DialogTitle>
          <DialogDescription>
            Tạo nhóm hội thoại cho lớp học. Tất cả thành viên trong lớp sẽ tự
            động được thêm vào.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Chọn lớp học</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp..." />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={String(cls.id)}>
                    {cls.name} ({cls.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedClassId}
            className="w-full"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Tạo hội thoại
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
