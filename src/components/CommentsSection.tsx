import { useState } from "react";
import { MessageSquare, Send, Pencil, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { CommentItem } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CommentsSectionProps {
  assignmentId?: number;
  submissionId?: number;
  title?: string;
  className?: string;
}

export function CommentsSection({
  assignmentId,
  submissionId,
  title = "Nhận xét",
  className,
}: CommentsSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const queryKey =
    assignmentId != null
      ? ["comments", "assignment", assignmentId]
      : submissionId != null
        ? ["comments", "submission", submissionId]
        : [];
  const params = new URLSearchParams();
  if (assignmentId != null) params.set("assignmentId", String(assignmentId));
  if (submissionId != null) params.set("submissionId", String(submissionId));

  const { data: comments = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => api.get<CommentItem[]>(`/comments?${params.toString()}`),
    enabled: assignmentId != null || submissionId != null,
  });

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      api.post<CommentItem>("/comments", {
        content,
        ...(assignmentId != null && { assignmentId }),
        ...(submissionId != null && { submissionId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setNewComment("");
      toast.success("Đã gửi nhận xét");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      api.patch<CommentItem>(`/comments/${id}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setEditingId(null);
      setEditContent("");
      toast.success("Đã cập nhật nhận xét");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setDeleteId(null);
      toast.success("Đã xóa nhận xét");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const canModify = (comment: CommentItem) => {
    if (!user) return false;
    return user.id === comment.userId || user.role === "TEACHER" || user.role === "ADMIN";
  };

  const handleStartEdit = (c: CommentItem) => {
    setEditingId(c.id);
    setEditContent(c.content);
  };

  const handleSaveEdit = () => {
    if (editingId == null || !editContent.trim()) return;
    updateMutation.mutate({ id: editingId, content: editContent.trim() });
  };

  if (assignmentId == null && submissionId == null) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-64 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Chưa có nhận xét nào.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback
                    className={
                      comment.user?.role === "TEACHER" || comment.user?.role === "ADMIN"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }
                  >
                    {(comment.user?.name ?? "?").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{comment.user?.name ?? "Ẩn danh"}</span>
                    {(comment.user?.role === "TEACHER" || comment.user?.role === "ADMIN") && (
                      <Badge variant="secondary" className="text-xs py-0">
                        Giáo viên
                      </Badge>
                    )}
                    {canModify(comment) && editingId !== comment.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleStartEdit(comment)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => setDeleteId(comment.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="resize-none text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending || !editContent.trim()}>
                          {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Lưu"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditContent(""); }}>
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm mt-1 break-words">{comment.content}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {user && (
          <>
            <div className="space-y-2">
              <Textarea
                placeholder="Viết nhận xét..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none"
                rows={2}
              />
              <Button
                className="w-full"
                size="sm"
                disabled={!newComment.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate(newComment.trim())}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Gửi nhận xét
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhận xét?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId != null && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
