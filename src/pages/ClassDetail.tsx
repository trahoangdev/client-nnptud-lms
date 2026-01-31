import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  FileText,
  Settings,
  Plus,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  MoreVertical,
  Pencil,
  Trash2,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLayout } from "@/components/layout";
import { CreateAssignmentModal, AddMemberModal } from "@/components/modals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { exportGradebookToExcel } from "@/lib/exportGradebook";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { ClassDetailItem, AssignmentItem, SubmissionItem } from "@/api";
import { Loader2 } from "lucide-react";

export default function ClassDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("assignments");
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const { data: classDetail, isLoading: loadingClass } = useQuery({
    queryKey: ["class", id],
    queryFn: () => api.get<ClassDetailItem>(`/classes/${id}`),
    enabled: !!id,
  });

  const { data: assignmentsList = [], refetch: refetchAssignments } = useQuery({
    queryKey: ["class-assignments", id],
    queryFn: () => api.get<(AssignmentItem & { _count?: { submissions: number } })[]>(`/classes/${id}/assignments`),
    enabled: !!id,
  });

  const classData = classDetail
    ? {
        id: String(classDetail.id),
        name: classDetail.name,
        code: classDetail.code,
        description: classDetail.description ?? "",
        students: classDetail.students ?? classDetail.members?.length ?? 0,
        assignments: classDetail.assignments?.length ?? assignmentsList.length,
      }
    : null;

  const assignments = assignmentsList.map((a) => ({
    id: String(a.id),
    title: a.title,
    dueDate: a.dueDate ? new Date(a.dueDate).toLocaleString("vi-VN") : "",
    submissions: (a as { _count?: { submissions: number } })._count?.submissions ?? 0,
    graded: 0,
    total: classData?.students ?? 0,
    maxScore: a.maxScore ?? 10,
    status: a.dueDate && new Date(a.dueDate) < new Date() ? "completed" : "active",
  }));

  const students =
    classDetail?.members?.map((m) => ({
      id: String(m.user.id),
      name: m.user.name,
      email: m.user.email,
      studentId: String(m.user.id),
      joinedAt: "",
    })) ?? [];

  const { data: submissionsData } = useQuery({
    queryKey: ["class-submissions", id, assignmentsList.map((a) => a.id)],
    queryFn: async () => {
      const results: Record<number, SubmissionItem[]> = {};
      await Promise.all(
        assignmentsList.map(async (a) => {
          const subs = await api.get<SubmissionItem[]>(`/assignments/${a.id}/submissions`);
          results[a.id] = subs;
        })
      );
      return results;
    },
    enabled: !!id && assignmentsList.length > 0 && activeTab === "gradebook",
  });

  const gradebook =
    students.map((s) => {
      const scores: Record<string, number | null> = {};
      const submissionStatus: Record<string, string> = {};
      let sum = 0;
      let count = 0;
      assignmentsList.forEach((a) => {
        const subs = submissionsData?.[a.id] ?? [];
        const sub = subs.find((x) => x.studentId === Number(s.id));
        if (sub?.grade) {
          scores[String(a.id)] = sub.grade.score;
          submissionStatus[String(a.id)] = "graded";
          sum += sub.grade.score;
          count++;
        } else if (sub) {
          scores[String(a.id)] = null;
          submissionStatus[String(a.id)] = sub.status === "LATE_SUBMITTED" ? "late" : "submitted";
        } else {
          scores[String(a.id)] = null;
          submissionStatus[String(a.id)] = "none";
        }
      });
      return {
        studentId: s.id,
        name: s.name,
        scores,
        submissionStatus,
        average: count > 0 ? sum / count : 0,
      };
    }) ?? [];

  const copyClassCode = () => {
    if (classData) {
      navigator.clipboard.writeText(classData.code);
      toast.success("Đã sao chép mã lớp!");
    }
  };

  const getSubmissionStatus = (submissions: number, total: number) => {
    const percent = (submissions / total) * 100;
    if (percent === 100) return { label: "Đủ", color: "bg-success/10 text-success" };
    if (percent >= 80) return { label: "Gần đủ", color: "bg-info/10 text-info" };
    return { label: "Đang chờ", color: "bg-warning/10 text-warning" };
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 8) return "text-success font-semibold";
    if (score >= 6) return "text-warning font-semibold";
    return "text-destructive font-semibold";
  };

  const getAverageColor = (avg: number) => {
    if (avg >= 8) return "text-success";
    if (avg >= 6) return "text-warning";
    return "text-destructive";
  };

  const gradebookStats = gradebook.length
    ? {
        classAverage: gradebook.reduce((sum, s) => sum + s.average, 0) / gradebook.length,
        highestAvg: Math.max(...gradebook.map((s) => s.average)),
        lowestAvg: Math.min(...gradebook.map((s) => s.average)),
        totalGraded: gradebook.reduce(
          (sum, s) => sum + Object.values(s.scores).filter((score) => score !== null).length,
          0
        ),
        totalPending: gradebook.reduce(
          (sum, s) =>
            sum +
            Object.values(s.submissionStatus).filter((status) => status === "submitted" || status === "late").length,
          0
        ),
      }
    : { classAverage: 0, highestAvg: 0, lowestAvg: 0, totalGraded: 0, totalPending: 0 };

  const filteredGradebook = gradebook.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    switch (gradeFilter) {
      case "pending":
        return Object.values(student.submissionStatus).some((s) => s === "submitted" || s === "late");
      case "high":
        return student.average >= 8;
      case "low":
        return student.average < 6;
      default:
        return true;
    }
  });

  // Filter members
  const filteredMembers = students.filter(student =>
    student.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
    student.studentId.includes(memberSearch)
  );

  const handleExportGradebook = () => {
    if (!classData) return;
    try {
      const exportData = gradebook.map((student) => ({
        studentId: student.studentId,
        name: student.name,
        scores: student.scores as Record<string, number | null>,
        average: student.average,
      }));

      const exportAssignments = assignments.map((a) => ({
        id: a.id,
        title: a.title,
        maxScore: a.maxScore,
      }));

      const filename = exportGradebookToExcel({
        className: classData.name,
        classCode: classData.code,
        teacherName: classDetail?.teacher?.name ?? "",
        assignments: exportAssignments,
        gradebook: exportData,
      });

      toast.success("Xuất Excel thành công!", {
        description: `File ${filename} đã được tải về`,
      });
    } catch (error) {
      toast.error("Lỗi khi xuất file Excel");
      console.error(error);
    }
  };

  if (loadingClass || (id && !classDetail && !loadingClass)) {
    return (
      <AppLayout userRole="teacher">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!classData) {
    return (
      <AppLayout userRole="teacher">
        <div className="text-center py-24 text-muted-foreground">Không tìm thấy lớp học.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole="teacher">
      <CreateAssignmentModal
        open={showCreateAssignment}
        onOpenChange={setShowCreateAssignment}
        classId={id}
        className={classData.name}
        onSuccess={() => refetchAssignments()}
      />
      
      <AddMemberModal
        open={showAddMember}
        onOpenChange={setShowAddMember}
        classId={id || ""}
        className={classData.name}
        classCode={classData.code}
        onSuccess={(emails) => {
          // Refresh members list
          console.log("Invited:", emails);
        }}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link 
            to="/classes" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách lớp
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{classData.name}</h1>
                <p className="text-muted-foreground mt-1">{classData.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={copyClassCode}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <span className="text-sm font-mono font-medium">{classData.code}</span>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {classData.students} học sinh
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    {classData.assignments} bài tập
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Cài đặt
            </Button>
            <Button onClick={() => setShowCreateAssignment(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Giao bài mới
            </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start bg-muted/50 p-1">
            <TabsTrigger value="assignments" className="gap-2">
              <FileText className="w-4 h-4" />
              Bài tập
            </TabsTrigger>
            <TabsTrigger value="gradebook" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Bảng điểm
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Thành viên
            </TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {assignments.map((assignment) => {
                const status = getSubmissionStatus(assignment.submissions, assignment.total);
                return (
                  <Card key={assignment.id} className="border-0 shadow-md card-interactive">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <Link 
                              to={`/assignments/${assignment.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              <h3 className="text-lg font-semibold">{assignment.title}</h3>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              Hạn: {assignment.dueDate}
                            </span>
                            {assignment.status === "active" && (
                              <Badge className={status.color + " border-0"}>
                                {status.label}
                              </Badge>
                            )}
                            {assignment.status === "completed" && (
                              <Badge className="bg-success/10 text-success border-0">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Hoàn thành
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{assignment.submissions}</p>
                            <p className="text-xs text-muted-foreground">Đã nộp</p>
                          </div>
                          <div className="w-px h-10 bg-border" />
                          <div className="text-center">
                            <p className="text-2xl font-bold">{assignment.graded}</p>
                            <p className="text-xs text-muted-foreground">Đã chấm</p>
                          </div>
                          <div className="w-px h-10 bg-border" />
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Tiến độ</span>
                              <span>{assignment.total ? Math.round((assignment.graded / assignment.total) * 100) : 0}%</span>
                            </div>
                            <Progress value={assignment.total ? (assignment.graded / assignment.total) * 100 : 0} className="h-2" />
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/assignments/${assignment.id}`}>
                              Xem chi tiết
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          </TabsContent>

          {/* Gradebook Tab - Enhanced */}
          <TabsContent value="gradebook" className="mt-6 space-y-6">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className={cn("text-xl font-bold", getAverageColor(gradebookStats.classAverage))}>
                        {gradebookStats.classAverage.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Điểm TB lớp</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-success">{gradebookStats.highestAvg.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Cao nhất</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-destructive">{gradebookStats.lowestAvg.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Thấp nhất</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-info/10">
                      <CheckCircle2 className="w-4 h-4 text-info" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{gradebookStats.totalGraded}</p>
                      <p className="text-xs text-muted-foreground">Đã chấm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <Clock className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{gradebookStats.totalPending}</p>
                      <p className="text-xs text-muted-foreground">Chờ chấm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gradebook Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle className="text-lg">Bảng điểm tổng hợp</CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm học sinh..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-48"
                      />
                    </div>
                    
                    {/* Filter */}
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Lọc" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="pending">Chờ chấm điểm</SelectItem>
                        <SelectItem value="high">Điểm cao (≥8)</SelectItem>
                        <SelectItem value="low">Điểm thấp (&lt;6)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" onClick={handleExportGradebook}>
                      <Download className="w-4 h-4 mr-2" />
                      Xuất Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Học sinh</TableHead>
                          {assignments.map((a) => (
                            <TableHead key={a.id} className="text-center min-w-[120px]">
                              <div className="text-xs font-normal text-muted-foreground mb-1 truncate">
                                {a.title}
                              </div>
                              <div className="text-xs">/{a.maxScore}</div>
                            </TableHead>
                          ))}
                          <TableHead className="text-center">TB</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGradebook.length > 0 ? (
                          filteredGradebook.map((student) => (
                            <TableRow key={student.studentId}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                      {student.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{student.name}</span>
                                </div>
                              </TableCell>
                              {assignments.map((a) => {
                                const score = student.scores[a.id as keyof typeof student.scores];
                                const status = student.submissionStatus[a.id as keyof typeof student.submissionStatus];
                                
                                return (
                                  <TableCell key={a.id} className="text-center">
                                    {score !== null ? (
                                      <span className={getScoreColor(score)}>{score}</span>
                                    ) : status === "submitted" ? (
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Chờ
                                      </Badge>
                                    ) : status === "late" ? (
                                      <Badge className="bg-warning/10 text-warning border-0 text-xs">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Trễ
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground">–</span>
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell className={cn("text-center font-bold", getAverageColor(student.average))}>
                                {student.average.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={assignments.length + 2} className="text-center py-8 text-muted-foreground">
                              Không tìm thấy học sinh nào
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Members Tab - Enhanced */}
          <TabsContent value="members" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Danh sách thành viên</CardTitle>
                    <CardDescription>{students.length} học sinh</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm theo tên, email, MSSV..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    
                    <Button size="sm" onClick={() => setShowAddMember(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm học sinh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Học sinh</TableHead>
                        <TableHead>MSSV</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ngày tham gia</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    {student.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {student.studentId}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {student.email}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {student.joinedAt}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Xem điểm
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Gửi email
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Xóa khỏi lớp
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Không tìm thấy học sinh nào
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
