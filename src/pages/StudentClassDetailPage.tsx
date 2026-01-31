import { useState } from "react";
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

// Mock data
const classData = {
  id: "1",
  name: "Lập trình Web - KTPM01",
  code: "WEB2025A",
  description: "Khóa học lập trình web với React, TypeScript và Node.js. Học viên sẽ được thực hành xây dựng các ứng dụng web từ cơ bản đến nâng cao.",
  teacher: "Nguyễn Văn A",
  teacherEmail: "nguyenvana@lms.edu.vn",
  totalStudents: 32,
  totalAssignments: 5,
  completedAssignments: 3,
  averageScore: 8.83,
};

const assignments = [
  {
    id: "1",
    title: "Bài tập React Hooks",
    dueDate: "2025-01-30",
    dueTime: "23:59",
    status: "not_submitted",
    daysLeft: 2,
    maxScore: 10,
  },
  {
    id: "2",
    title: "TypeScript Basics",
    dueDate: "2025-01-25",
    dueTime: "23:59",
    status: "graded",
    daysLeft: -3,
    maxScore: 10,
    score: 9,
  },
  {
    id: "3",
    title: "Component Styling",
    dueDate: "2025-01-20",
    dueTime: "23:59",
    status: "graded",
    daysLeft: -8,
    maxScore: 10,
    score: 8.5,
  },
  {
    id: "4",
    title: "State Management",
    dueDate: "2025-01-15",
    dueTime: "23:59",
    status: "graded",
    daysLeft: -13,
    maxScore: 10,
    score: 9,
  },
  {
    id: "5",
    title: "REST API Integration",
    dueDate: "2025-02-05",
    dueTime: "23:59",
    status: "not_submitted",
    daysLeft: 8,
    maxScore: 10,
  },
];

const classmates = [
  { id: "1", name: "Lê Thị C", avatar: "L" },
  { id: "2", name: "Nguyễn Văn D", avatar: "N" },
  { id: "3", name: "Phạm Thị E", avatar: "P" },
  { id: "4", name: "Hoàng Văn F", avatar: "H" },
  { id: "5", name: "Trần Văn G", avatar: "T" },
];

export default function StudentClassDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("assignments");

  const getDaysLeftColor = (days: number) => {
    if (days < 0) return "text-muted-foreground";
    if (days <= 1) return "text-destructive";
    if (days <= 3) return "text-warning";
    return "text-muted-foreground";
  };

  const getStatusBadge = (status: string, score?: number, maxScore?: number) => {
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
            {score}/{maxScore}
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
        return (
          <Badge variant="outline">Chưa nộp</Badge>
        );
    }
  };

  const pendingAssignments = assignments.filter(a => a.status === "not_submitted" && a.daysLeft >= 0);
  const completedAssignments = assignments.filter(a => a.status === "graded" || a.status === "submitted");

  return (
    <AppLayout userRole="student">
      <div className="space-y-6">
        {/* Header */}
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
                <h1 className="text-2xl md:text-3xl font-bold">{classData.name}</h1>
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
                  <span className="text-sm text-muted-foreground font-mono">
                    Mã: {classData.code}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{classData.completedAssignments}/{classData.totalAssignments}</p>
                <p className="text-xs text-muted-foreground">Hoàn thành</p>
              </div>
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-success">{classData.averageScore}</p>
                <p className="text-xs text-muted-foreground">Điểm TB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tiến độ hoàn thành</span>
              <span className="text-sm text-muted-foreground">
                {classData.completedAssignments}/{classData.totalAssignments} bài tập
              </span>
            </div>
            <Progress 
              value={(classData.completedAssignments / classData.totalAssignments) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>

        {/* Tabs */}
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

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Pending */}
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

              {/* Completed */}
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
                              <span className="text-sm text-muted-foreground">
                                Hạn: {assignment.dueDate}
                              </span>
                            </div>
                            {getStatusBadge(assignment.status, assignment.score, assignment.maxScore)}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Bảng điểm</CardTitle>
                  <CardDescription>Kết quả các bài tập đã chấm trong lớp này</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments
                      .filter((a) => a.status === "graded")
                      .map((assignment) => (
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
                              <p className="text-xs text-muted-foreground">
                                Nộp ngày: {assignment.dueDate}
                              </p>
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
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Classmates Tab */}
          <TabsContent value="classmates" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Thành viên lớp học</CardTitle>
                  <CardDescription>{classData.totalStudents} học viên</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Teacher */}
                  <div className="mb-6 pb-6 border-b">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Giảng viên</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {classData.teacher.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{classData.teacher}</p>
                        <p className="text-sm text-muted-foreground">{classData.teacherEmail}</p>
                      </div>
                      <Badge className="ml-auto">Giảng viên</Badge>
                    </div>
                  </div>

                  {/* Students */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Học viên</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {classmates.map((student) => (
                        <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {student.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-center p-3 rounded-lg bg-muted/30 text-muted-foreground">
                        +{classData.totalStudents - classmates.length - 1} học viên khác
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
