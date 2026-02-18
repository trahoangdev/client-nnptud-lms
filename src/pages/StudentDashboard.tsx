import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  FileText,
  Calendar,
  ArrowRight,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/layout";
import { Link } from "react-router-dom";
import { JoinClassModal } from "@/components/modals";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { ClassItem } from "@/api";
import type { StudentDashboardStats } from "@/api/types";
import { useAuth } from "@/context/AuthContext";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const COLORS = [
  "from-primary to-primary/70",
  "from-info to-info/70",
  "from-success to-success/70",
  "from-warning to-warning/70",
];

export default function StudentDashboard() {
  const [showJoinClass, setShowJoinClass] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading: loadingClasses, isError: classesError, refetch } = useQuery({
    queryKey: ["student-classes"],
    queryFn: () => api.get<ClassItem[]>("/classes"),
  });

  const { data: assignmentsWithSub = [], isLoading: loadingAssignments, isError: assignmentsError, refetch: refetchAssignments } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: () => api.get<{ assignment: { dueDate?: string }; mySubmission: { grade?: unknown } | null }[]>("/student/assignments"),
  });

  // Realtime: auto-refetch when grade is updated
  const handleGradeUpdated = useCallback(
    (data: { assignment_title?: string; score?: number }) => {
      refetchAssignments();
      toast.success("Đã có điểm mới!", {
        description: data.assignment_title
          ? `${data.assignment_title}: ${data.score} điểm`
          : undefined,
      });
    },
    [refetchAssignments]
  );
  useSocketEvent("grade:updated", handleGradeUpdated);

  // Realtime: auto-refetch when teacher creates a new assignment
  const handleAssignmentNew = useCallback(
    (data: { title?: string; className?: string }) => {
      refetchAssignments();
      queryClient.invalidateQueries({ queryKey: ["student-dashboard-stats"] });
      toast.info("Bài tập mới!", {
        description: data.title
          ? `${data.title} — ${data.className || ""}`
          : "Giảng viên vừa giao bài tập mới",
      });
    },
    [refetchAssignments, queryClient]
  );
  useSocketEvent("assignment:new", handleAssignmentNew);

  // Enhanced stats from dashboard API
  const { data: dashStats } = useQuery({
    queryKey: ["student-dashboard-stats"],
    queryFn: () => api.get<StudentDashboardStats>("/student/dashboard-stats"),
  });

  const isLoading = loadingClasses || loadingAssignments;
  const hasError = classesError || assignmentsError;

  const submittedCount = assignmentsWithSub.filter((a) => a.mySubmission).length;
  const dueSoonCount = assignmentsWithSub.filter((a) => {
    if (!a.assignment.dueDate) return false;
    const due = new Date(a.assignment.dueDate);
    const now = new Date();
    if (due < now) return false;
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return daysLeft <= 7 && !a.mySubmission;
  }).length;

  const myClasses = classes.slice(0, 6).map((cls, i) => ({
    id: String(cls.id),
    name: cls.name,
    teacher: cls.teacher?.name ?? "–",
    totalAssignments: cls.assignments ?? cls._count?.assignments ?? 0,
    completed: 0,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <AppLayout userRole="student">
      <JoinClassModal open={showJoinClass} onOpenChange={setShowJoinClass} onSuccess={() => refetch()} />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Xin chào, <span className="text-gradient">{user?.name ?? "Sinh viên"}</span> 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Button onClick={() => setShowJoinClass(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tham gia lớp
          </Button>
        </div>

        {hasError ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-muted-foreground">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["student-classes"] });
                queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
              }}
            >
              Thử lại
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Lớp đang học</p>
                      <p className="text-3xl font-bold mt-1">{classes.length}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Bài tập</p>
                      <p className="text-3xl font-bold mt-1">
                        {classes.reduce((s, c) => s + (c.assignments ?? c._count?.assignments ?? 0), 0)}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-info/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Đã nộp</p>
                      <p className="text-3xl font-bold mt-1">{submittedCount}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-success/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sắp đến hạn</p>
                      <p className="text-3xl font-bold mt-1">{dueSoonCount}</p>
                    </div>
                    <Clock className="w-8 h-8 text-warning/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">Lớp học của tôi</CardTitle>
                    <CardDescription>Danh sách lớp bạn đang tham gia</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/student/classes">
                      Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myClasses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Chưa tham gia lớp nào. Bấm Tham gia lớp và nhập mã lớp.
                    </p>
                  ) : (
                    myClasses.map((cls) => (
                      <Link key={cls.id} to={`/student/classes/${cls.id}`} className="block">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cls.color} flex items-center justify-center flex-shrink-0`}
                          >
                            <BookOpen className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{cls.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">GV: {cls.teacher}</p>
                          </div>
                          <Badge variant="secondary">{cls.totalAssignments} bài tập</Badge>
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress overview from dashboard stats */}
            {dashStats && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      Tiến độ học tập
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tỉ lệ nộp bài</span>
                          <span className="font-medium">{dashStats.submissionRate}%</span>
                        </div>
                        <Progress value={dashStats.submissionRate} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Đã chấm điểm</span>
                          <span className="font-medium">{dashStats.gradedCount}/{dashStats.submittedCount}</span>
                        </div>
                        <Progress value={dashStats.submittedCount > 0 ? (dashStats.gradedCount / dashStats.submittedCount) * 100 : 0} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Điểm trung bình</span>
                          <span className="font-medium">{dashStats.avgScore != null ? `${dashStats.avgScore}%` : "–"}</span>
                        </div>
                        <Progress value={dashStats.avgScore ?? 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
