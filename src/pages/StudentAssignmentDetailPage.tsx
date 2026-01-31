import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout";
import { FileUpload } from "@/components/FileUpload";
import { CommentsSection } from "@/components/CommentsSection";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiUpload } from "@/api/client";
import type { AssignmentItem, SubmissionItem } from "@/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { differenceInDays, parseISO } from "date-fns";

export default function StudentAssignmentDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: assignment, isLoading: loadingAssignment, isError: assignmentError, error: assignmentErrorDetail } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => api.get<AssignmentItem & { class?: { id: number; name: string } }>(`/assignments/${id}`),
    enabled: !!id,
  });

  const { data: mySubmissions = [], refetch: refetchSubmissions } = useQuery({
    queryKey: ["assignment-submissions", id],
    queryFn: () => api.get<SubmissionItem[]>(`/assignments/${id}/submissions`),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: async ({ fileUrl }: { fileUrl: string }) =>
      api.post(`/submissions`, { assignmentId: Number(id), fileUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-submissions", id] });
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
      toast.success("Nộp bài thành công!");
      setIsSubmitting(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setIsSubmitting(false);
    },
  });

  const mySubmission = mySubmissions[0] ?? null;
  const dueDate = assignment?.dueDate ? parseISO(assignment.dueDate) : null;
  const daysLeft = dueDate ? differenceInDays(dueDate, new Date()) : 999;
  const isOverdue = daysLeft < 0;
  const hasSubmission = !!mySubmission;
  const isGraded = !!mySubmission?.grade;

  const handleSubmit = async (file: File) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiUpload("/upload", formData);
      const fileUrl = (res as { fileUrl?: string }).fileUrl;
      if (!fileUrl) throw new Error("Upload failed");
      await submitMutation.mutateAsync({ fileUrl });
      refetchSubmissions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nộp bài thất bại");
      setIsSubmitting(false);
    }
  };

  if (assignmentError) {
    const msg = (assignmentErrorDetail as Error)?.message?.toLowerCase() ?? "";
    const is403 = msg.includes("access") || msg.includes("denied") || msg.includes("not in");
    return (
      <AppLayout userRole="student">
        <div className="text-center py-24 space-y-2">
          <p className="text-muted-foreground">
            {is403 ? "Bạn không có quyền xem bài tập này." : "Không thể tải thông tin bài tập."}
          </p>
          <Link to="/student/assignments" className="text-primary hover:underline text-sm">
            Quay lại danh sách bài tập
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (loadingAssignment || (id && !assignment && !loadingAssignment)) {
    return (
      <AppLayout userRole="student">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!assignment) {
    return (
      <AppLayout userRole="student">
        <div className="text-center py-24 text-muted-foreground">Không tìm thấy bài tập.</div>
      </AppLayout>
    );
  }

  const className = assignment.class?.name ?? "";
  const classId = assignment.classId;

  return (
    <AppLayout userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <Link
            to={classId ? `/student/classes/${classId}` : "/student/assignments"}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại {className || "Bài tập"}
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <FileText className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{assignment.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {className}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Hạn nộp:{" "}
                    {assignment.dueDate
                      ? format(parseISO(assignment.dueDate), "dd/MM/yyyy HH:mm", { locale: vi })
                      : "–"}
                  </span>
                  {assignment.allowLate && (
                    <span className="text-xs border rounded px-2 py-0.5">Cho phép nộp trễ</span>
                  )}
                </div>
                {!isOverdue && (
                  <div
                    className={`mt-2 text-sm font-medium ${
                      daysLeft <= 1 ? "text-destructive" : daysLeft <= 3 ? "text-warning" : "text-muted-foreground"
                    }`}
                  >
                    {daysLeft <= 1 && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                    Còn {daysLeft} ngày để nộp bài
                  </div>
                )}
                {isOverdue && !hasSubmission && (
                  <div className="mt-2 text-sm font-medium text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Đã quá hạn {Math.abs(daysLeft)} ngày
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Nội dung bài tập</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignment.description ? (
                    <MarkdownContent content={assignment.description} />
                  ) : (
                    <p className="text-muted-foreground">Không có mô tả.</p>
                  )}
                  {assignment.fileUrl && (
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">File đính kèm</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Tải file đề bài
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {hasSubmission ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        Bài đã nộp
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-warning" />
                        Nộp bài
                      </>
                    )}
                  </CardTitle>
                  {hasSubmission && mySubmission?.submittedAt && (
                    <CardDescription>
                      Đã nộp lúc {format(new Date(mySubmission.submittedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {hasSubmission ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-success/5 border border-success/20">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {mySubmission?.fileUrl ? "Đã nộp file" : mySubmission?.content ? "Đã nộp nội dung" : "Đã nộp"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Nộp lúc{" "}
                            {mySubmission?.submittedAt
                              ? format(new Date(mySubmission.submittedAt), "dd/MM/yyyy HH:mm", { locale: vi })
                              : ""}
                          </p>
                        </div>
                        {mySubmission?.fileUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={mySubmission.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              Tải xuống
                            </a>
                          </Button>
                        )}
                      </div>
                      {!isGraded && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium mb-3">Nộp lại bài (thay thế bài cũ)</p>
                          <FileUpload
                            accept=".zip,.pdf,.docx"
                            maxSize={100}
                            onUpload={handleSubmit}
                            disabled={isSubmitting}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <FileUpload
                      accept=".zip,.pdf,.docx"
                      maxSize={100}
                      onUpload={handleSubmit}
                      disabled={isSubmitting}
                    />
                  )}
                  {isSubmitting && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang nộp bài...
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Kết quả</CardTitle>
                </CardHeader>
                <CardContent>
                  {isGraded && mySubmission?.grade ? (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success/10 mb-4">
                        <span className="text-3xl font-bold text-success">
                          {mySubmission.grade.score}/{assignment.maxScore ?? 10}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Đã chấm lúc{" "}
                        {format(new Date(mySubmission.grade.gradedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </p>
                    </div>
                  ) : hasSubmission ? (
                    <div className="text-center py-6">
                      <Clock className="w-12 h-12 text-info mx-auto mb-3" />
                      <p className="font-medium">Đang chờ chấm điểm</p>
                      <p className="text-sm text-muted-foreground mt-1">Giáo viên sẽ chấm điểm sớm nhất có thể</p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-3" />
                      <p className="font-medium">Chưa nộp bài</p>
                      <p className="text-sm text-muted-foreground mt-1">Hãy nộp bài để được chấm điểm</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <CommentsSection
                assignmentId={id ? Number(id) : undefined}
                submissionId={mySubmission?.id ? Number(mySubmission.id) : undefined}
                title="Nhận xét"
                className="border-0 shadow-md"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
