import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Users,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLayout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { ClassDetailItem } from "@/api";
import type { StudentAssignmentWithSubmission } from "@/api";
import { Loader2 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

function getStatus(item: StudentAssignmentWithSubmission): "not_submitted" | "submitted" | "graded" | "late" {
  const sub = item.mySubmission;
  const due = item.assignment.dueDate ? parseISO(item.assignment.dueDate) : null;
  const now = new Date();
  if (sub?.grade) return "graded";
  if (sub) {
    if (due && sub.status === "LATE_SUBMITTED") return "late";
    return "submitted";
  }
  if (due && now > due) return "late";
  return "not_submitted";
}

function getDaysLeft(item: StudentAssignmentWithSubmission): number {
  const due = item.assignment.dueDate ? parseISO(item.assignment.dueDate) : null;
  if (!due) return 999;
  return differenceInDays(due, new Date());
}

export default function StudentClassDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("assignments");

  const { data: classDetail, isLoading: loadingClass, isError: classError, error: classErrorDetail } = useQuery({
    queryKey: ["class", id],
    queryFn: () => api.get<ClassDetailItem>(`/classes/${id}`),
    enabled: !!id,
  });

  const { data: myAssignmentsList = [] } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: () => api.get<StudentAssignmentWithSubmission[]>("/student/assignments"),
  });

  const classAssignmentsWithStatus = useMemo(() => {
    if (!classDetail?.assignments || !id) return [];
    const byClass = myAssignmentsList.filter((x) => String(x.class.id) === id);
    const subMap = new Map<number, StudentAssignmentWithSubmission>();
    byClass.forEach((x) => subMap.set(x.assignment.id, x));
    return classDetail.assignments.map((a) => {
      const item = subMap.get(a.id);
      const status = item ? getStatus(item) : "not_submitted";
      const daysLeft = item ? getDaysLeft(item) : (a.dueDate ? differenceInDays(parseISO(a.dueDate), new Date()) : 999);
      const score = item?.mySubmission?.grade?.score ?? null;
      return {
        id: String(a.id),
        title: a.title,
        dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString("vi-VN") : "",
        dueTime: a.dueDate ? new Date(a.dueDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "23:59",
        status,
        daysLeft,
        maxScore: a.maxScore ?? 10,
        score,
      };
    });
  }, [classDetail, id, myAssignmentsList]);

  const pendingAssignments = classAssignmentsWithStatus.filter((a) => a.status === "not_submitted" && a.daysLeft >= 0);
  const completedAssignments = classAssignmentsWithStatus.filter((a) => a.status === "graded" || a.status === "submitted");
  const gradedAssignments = classAssignmentsWithStatus.filter((a) => a.status === "graded");

  const completedCount = classAssignmentsWithStatus.filter((a) => a.status === "graded" || a.status === "submitted").length;
  const totalCount = classAssignmentsWithStatus.length;
  const averageScore =
    gradedAssignments.length > 0
      ? gradedAssignments.reduce((s, a) => s + (a.score ?? 0), 0) / gradedAssignments.length
      : 0;

  const getDaysLeftColor = (days: number) => {
    if (days < 0) return "text-muted-foreground";
    if (days <= 1) return "text-destructive";
    if (days <= 3) return "text-warning";
    return "text-muted-foreground";
  };

  const getStatusBadge = (status: string, score?: number | null, maxScore?: number) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-info/10 text-info border-0">
            <Clock className="w-3 h-3 mr-1" />
            Chờ chấm
          </Badge>
        );
      case "graded":
        return (
          <Badge className="bg-success/10 text-success border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {score != null && maxScore != null ? `${score}/${maxScore}` : "Đã chấm"}
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-warning/10 text-warning border-0">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Nộp trễ
          </Badge>
        );
      default:
        return <Badge variant="outline">Chưa nộp</Badge>;
    }
  };

  const members = classDetail?.members ?? [];
  const teacher = classDetail?.teacher;

  if (classError) {
    const is403 = (classErrorDetail as Error)?.message?.toLowerCase().includes("access") || (classErrorDetail as Error)?.message?.toLowerCase().includes("denied");
    return (
      <AppLayout userRole="student">
        <div className="text-center py-24 space-y-2">
          <p className="text-muted-foreground">
            {is403 ? "Bạn không có quyền xem lớp này." : "Không thể tải thông tin lớp học."}
          </p>
          <Link to="/student/classes" className="text-primary hover:underline text-sm">
            Quay lại danh sách lớp
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (loadingClass || (id && !classDetail && !loadingClass)) {
    return (
      <AppLayout userRole="student">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!classDetail) {
    return (
      <AppLayout userRole="student">
        <div className="text-center py-24 text-muted-foreground">Không tìm thấy lớp học.</div>
      </AppLayout>
    );
  }

  const classData = {
    name: classDetail.name,
    code: classDetail.code,
    description: classDetail.description ?? "",
    teacher: teacher?.name ?? "–",
    teacherEmail: (teacher as { email?: string } | undefined)?.email ?? "",
    totalStudents: classDetail.students ?? members.length,
  };

  return (
    <AppLayout userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <Link
            to="/student/classes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách lớp
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{classDetail.name}</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">{classData.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    GV: {classData.teacher}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {classData.totalStudents} học viên
                  </span>
                  <span className="text-sm text-muted-foreground font-mono">Mã: {classData.code}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {completedCount}/{totalCount || 1}
                </p>
                <p className="text-xs text-muted-foreground">Hoàn thành</p>
              </div>
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-success">{averageScore.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Điểm TB</p>
              </div>
            </div>
          </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tiến độ hoàn thành</span>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount || 1} bài tập
              </span>
            </div>
            <Progress value={totalCount ? (completedCount / totalCount) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start bg-muted/50 p-1">
            <TabsTrigger value="assignments" className="gap-2">
              <FileText className="w-4 h-4" />
              Bài tập
              {pendingAssignments.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingAssignments.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="grades" className="gap-2">
              <Award className="w-4 h-4" />
              Điểm số
            </TabsTrigger>
            <TabsTrigger value="classmates" className="gap-2">
              <Users className="w-4 h-4" />
              Thành viên
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="mt-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {pendingAssignments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Chờ nộp ({pendingAssignments.length})
                  </h3>
                  {pendingAssignments.map((assignment) => (
                    <Link key={assignment.id} to={`/student/assignments/${assignment.id}`}>
                      <Card className="border-0 shadow-md card-interactive">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-warning/70 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{assignment.title}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  Hạn: {assignment.dueDate} {assignment.dueTime}
                                </span>
                                <span className={`font-medium ${getDaysLeftColor(assignment.daysLeft)}`}>
                                  {assignment.daysLeft <= 1 && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}
                                  Còn {assignment.daysLeft} ngày
                                </span>
                              </div>
                            </div>
                            <Button size="sm">Nộp bài</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {completedAssignments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã hoàn thành ({completedAssignments.length})
                  </h3>
                  {completedAssignments.map((assignment) => (
                    <Link key={assignment.id} to={`/student/assignments/${assignment.id}`}>
                      <Card className="border-0 shadow-sm card-interactive opacity-80">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/80 to-success/50 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{assignment.title}</h3>
                              <span className="text-sm text-muted-foreground">Hạn: {assignment.dueDate}</span>
                            </div>
                            {getStatusBadge(assignment.status, assignment.score, assignment.maxScore)}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {classAssignmentsWithStatus.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">Chưa có bài tập nào trong lớp này.</p>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="grades" className="mt-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Bảng điểm</CardTitle>
                  <CardDescription>Kết quả các bài tập đã chấm trong lớp này</CardDescription>
                </CardHeader>
                <CardContent>
                  {gradedAssignments.length > 0 ? (
                    <div className="space-y-4">
                      {gradedAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <div>
                              <p className="font-medium">{assignment.title}</p>
                              <p className="text-xs text-muted-foreground">Hạn: {assignment.dueDate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-success">
                              {assignment.score}/{assignment.maxScore}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Chưa có bài tập nào được chấm điểm.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="classmates" className="mt-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Thành viên lớp học</CardTitle>
                  <CardDescription>{classData.totalStudents} học viên</CardDescription>
                </CardHeader>
                <CardContent>
                  {teacher && (
                    <div className="mb-6 pb-6 border-b">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Giảng viên</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {teacher.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{teacher.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {"email" in teacher ? teacher.email : ""}
                          </p>
                        </div>
                        <Badge className="ml-auto">Giảng viên</Badge>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Học viên</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {members.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {m.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{m.user.name}</span>
                        </div>
                      ))}
                      {members.length === 0 && (
                        <p className="text-muted-foreground col-span-2">Chưa có học viên nào.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
