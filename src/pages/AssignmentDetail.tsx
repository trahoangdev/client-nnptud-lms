import { useState, useMemo } from "react";
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
  Filter,
  Search,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout";
import { GradeSubmissionModal } from "@/components/modals";
import { CommentsSection } from "@/components/CommentsSection";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { AssignmentItem, SubmissionItem } from "@/api";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseISO } from "date-fns";

type SubmissionDisplay = {
  id: string;
  studentName: string;
  studentId: string;
  studentEmail?: string;
  submittedAt: string | null;
  status: "submitted" | "late" | "not_submitted";
  fileUrl: string | null;
  fileName?: string;
  score: number | null;
  graded: boolean;
  feedback?: string;
};

/** Lấy tên file từ fileUrl (path hoặc URL). */
function fileNameFromUrl(fileUrl: string | null | undefined): string | undefined {
  if (!fileUrl) return undefined;
  try {
    const path = fileUrl.replace(/\?.*$/, "");
    const segment = path.split("/").pop();
    return segment ? decodeURIComponent(segment) : undefined;
  } catch {
    return undefined;
  }
}

function mapSubmission(s: SubmissionItem): SubmissionDisplay {
  const status =
    s.status === "LATE_SUBMITTED" ? "late" : s.status === "SUBMITTED" ? "submitted" : "not_submitted";
  return {
    id: String(s.id),
    studentName: s.student?.name ?? "",
    studentId: String(s.studentId),
    studentEmail: s.student?.email,
    submittedAt: s.submittedAt ?? null,
    status,
    fileUrl: s.fileUrl ?? null,
    fileName: fileNameFromUrl(s.fileUrl),
    score: s.grade?.score ?? null,
    graded: !!s.grade,
    feedback: undefined,
  };
}

export default function AssignmentDetail() {
  const { id } = useParams();
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [submissionFilter, setSubmissionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: assignment, isLoading: loadingAssignment } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () =>
      api.get<AssignmentItem & { class?: { id: number; name: string } }>(`/assignments/${id}`),
    enabled: !!id,
  });

  const { data: submissionsRaw = [], refetch: refetchSubmissions } = useQuery({
    queryKey: ["assignment-submissions", id],
    queryFn: () => api.get<SubmissionItem[]>(`/assignments/${id}/submissions`),
    enabled: !!id,
  });

  const submissionsList = useMemo(() => submissionsRaw.map(mapSubmission), [submissionsRaw]);

  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((submission) => {
      const matchesSearch =
        submission.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.studentId.includes(searchQuery);
      if (!matchesSearch) return false;
      switch (submissionFilter) {
        case "graded":
          return submission.graded;
        case "pending":
          return submission.status !== "not_submitted" && !submission.graded;
        case "late":
          return submission.status === "late";
        case "not_submitted":
          return submission.status === "not_submitted";
        default:
          return true;
      }
    });
  }, [submissionsList, submissionFilter, searchQuery]);

  const selectedSubmissionData = submissionsList.find((s) => s.id === selectedSubmission) ?? null;

  const stats = useMemo(() => {
    const graded = submissionsList.filter((s) => s.graded);
    const scores = graded.map((s) => s.score ?? 0);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highScore = scores.length ? Math.max(...scores) : 0;
    const lowScore = scores.length ? Math.min(...scores) : 0;
    return { avgScore, highScore, lowScore };
  }, [submissionsList]);

  const submittedCount = submissionsList.filter((s) => s.status !== "not_submitted").length;
  const gradedCount = submissionsList.filter((s) => s.graded).length;
  const maxScore = assignment?.maxScore ?? 10;
  const classId = assignment?.classId;
  const className = assignment?.class?.name ?? "";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-success/10 text-success border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Đã nộp
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-warning/10 text-warning border-0">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Trễ hạn
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Chưa nộp
          </Badge>
        );
    }
  };

  if (loadingAssignment || (id && !assignment && !loadingAssignment)) {
    return (
      <AppLayout userRole="teacher">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!assignment) {
    return (
      <AppLayout userRole="teacher">
        <div className="text-center py-24 text-muted-foreground">Không tìm thấy bài tập.</div>
      </AppLayout>
    );
  }

  const dueDateFormatted = assignment.dueDate
    ? format(parseISO(assignment.dueDate), "dd/MM/yyyy HH:mm", { locale: vi })
    : "–";

  return (
    <AppLayout userRole="teacher">
      <GradeSubmissionModal
        open={showGradeModal}
        onOpenChange={setShowGradeModal}
        submission={selectedSubmissionData}
        submissionId={selectedSubmission ? Number(selectedSubmission) : undefined}
        assignmentTitle={assignment.title}
        maxScore={maxScore}
        onSuccess={() => {
          refetchSubmissions();
          setShowGradeModal(false);
        }}
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <Link
            to={classId ? `/classes/${classId}` : "/classes"}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại {className || "lớp học"}
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
                    <Calendar className="w-4 h-4" />
                    Hạn nộp: {dueDateFormatted}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Điểm tối đa: {maxScore}
                  </span>
                  {assignment.allowLate && (
                    <Badge variant="outline" className="text-xs">
                      Cho phép nộp trễ
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{submittedCount}/{submissionsList.length || 1}</p>
                <p className="text-xs text-muted-foreground">Đã nộp</p>
              </div>
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{gradedCount}</p>
                <p className="text-xs text-muted-foreground">Đã chấm</p>
              </div>
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.avgScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Điểm TB</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tiến độ chấm điểm</span>
              <span className="text-sm text-muted-foreground">
                {gradedCount}/{submittedCount || 1} bài đã chấm
              </span>
            </div>
            <Progress
              value={submittedCount ? (gradedCount / submittedCount) * 100 : 0}
              className="h-2"
            />
          </CardContent>
        </Card>

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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Danh sách bài nộp</CardTitle>
                      <CardDescription>{filteredSubmissions.length} học sinh</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Tìm học sinh..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-40"
                        />
                      </div>
                      <Select value={submissionFilter} onValueChange={setSubmissionFilter}>
                        <SelectTrigger className="w-36">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="pending">Chờ chấm</SelectItem>
                          <SelectItem value="graded">Đã chấm</SelectItem>
                          <SelectItem value="late">Nộp trễ</SelectItem>
                          <SelectItem value="not_submitted">Chưa nộp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          onClick={() => {
                            setSelectedSubmission(submission.id);
                            if (submission.status !== "not_submitted") {
                              setShowGradeModal(true);
                            }
                          }}
                          className={cn(
                            "flex items-center justify-between p-4 cursor-pointer transition-colors",
                            selectedSubmission === submission.id ? "bg-accent" : "hover:bg-muted/50",
                            submission.status === "not_submitted" && "opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {submission.studentName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{submission.studentName}</p>
                              <p className="text-xs text-muted-foreground">{submission.studentId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {submission.submittedAt && (
                              <span className="text-xs text-muted-foreground hidden md:block">
                                {format(parseISO(submission.submittedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                              </span>
                            )}
                            {getStatusBadge(submission.status)}
                            {submission.graded && (
                              <span
                                className={cn(
                                  "font-bold min-w-[50px] text-right",
                                  (submission.score ?? 0) >= 8 ? "text-success" : (submission.score ?? 0) >= 6 ? "text-warning" : "text-destructive"
                                )}
                              >
                                {submission.score}/{maxScore}
                              </span>
                            )}
                            {!submission.graded && submission.status !== "not_submitted" && (
                              <Button size="sm" variant="outline">
                                Chấm điểm
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        Không tìm thấy bài nộp nào
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Thống kê
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-success">{stats.highScore}</p>
                      <p className="text-xs text-muted-foreground">Cao nhất</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-primary">{stats.avgScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Trung bình</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-destructive">{stats.lowScore}</p>
                      <p className="text-xs text-muted-foreground">Thấp nhất</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Đã nộp đúng hạn</span>
                      <span className="font-medium">
                        {submissionsList.filter((s) => s.status === "submitted").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nộp trễ</span>
                      <span className="font-medium text-warning">
                        {submissionsList.filter((s) => s.status === "late").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Chưa nộp</span>
                      <span className="font-medium text-destructive">
                        {submissionsList.filter((s) => s.status === "not_submitted").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <CommentsSection
                assignmentId={id ? Number(id) : undefined}
                title="Nhận xét gần đây"
                className="border-0 shadow-md"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
