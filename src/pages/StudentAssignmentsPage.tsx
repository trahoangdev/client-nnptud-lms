import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { StudentAssignmentWithSubmission } from "@/api";
import { Loader2 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function getStatus(
  item: StudentAssignmentWithSubmission
): "not_submitted" | "submitted" | "graded" | "late" {
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

export default function StudentAssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: () => api.get<StudentAssignmentWithSubmission[]>("/student/assignments"),
  });

  const classesForFilter = useMemo(() => {
    const seen = new Map<number, string>();
    list.forEach((item) => {
      if (!seen.has(item.class.id)) seen.set(item.class.id, item.class.name);
    });
    return [{ id: "all", name: "Tất cả lớp học" }, ...Array.from(seen.entries()).map(([id, name]) => ({ id: String(id), name }))];
  }, [list]);

  const allAssignments = useMemo(() => {
    return list.map((item) => ({
      id: String(item.assignment.id),
      title: item.assignment.title,
      class: item.class.name,
      classId: String(item.class.id),
      dueDate: item.assignment.dueDate ? new Date(item.assignment.dueDate).toLocaleDateString("vi-VN") : "",
      dueTime: item.assignment.dueDate ? new Date(item.assignment.dueDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "23:59",
      status: getStatus(item),
      daysLeft: getDaysLeft(item),
      maxScore: item.assignment.maxScore ?? 10,
      score: item.mySubmission?.grade?.score ?? null,
      raw: item,
    }));
  }, [list]);

  const getFilteredAssignments = (tab: string) => {
    let filtered = allAssignments;
    if (selectedClass !== "all") filtered = filtered.filter((a) => a.classId === selectedClass);
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.class.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    switch (tab) {
      case "pending":
        return filtered.filter((a) => a.status === "not_submitted" && a.daysLeft >= 0);
      case "submitted":
        return filtered.filter((a) => a.status === "submitted");
      case "graded":
        return filtered.filter((a) => a.status === "graded");
      case "late":
        return filtered.filter((a) => a.status === "late" || (a.status === "not_submitted" && a.daysLeft < 0));
      default:
        return filtered;
    }
  };

  const getDaysLeftColor = (days: number) => {
    if (days < 0) return "text-destructive";
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
        return (
          <Badge variant="outline">
            Chưa nộp
          </Badge>
        );
    }
  };

  const pendingCount = getFilteredAssignments("pending").length;
  const submittedCount = getFilteredAssignments("submitted").length;
  const gradedCount = getFilteredAssignments("graded").length;
  const lateCount = getFilteredAssignments("late").length;

  return (
    <AppLayout userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Bài tập</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý và theo dõi tất cả bài tập từ các lớp học
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm bài tập..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Lọc theo lớp" />
            </SelectTrigger>
            <SelectContent>
              {classesForFilter.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start bg-muted/50 p-1">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Chờ nộp
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="submitted" className="gap-2">
              <FileText className="w-4 h-4" />
              Đã nộp
              {submittedCount > 0 && (
                <Badge variant="secondary" className="ml-1">{submittedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="graded" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Đã chấm
              {gradedCount > 0 && (
                <Badge variant="secondary" className="ml-1">{gradedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="late" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Trễ hạn
              {lateCount > 0 && (
                <Badge variant="destructive" className="ml-1">{lateCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            ["pending", "submitted", "graded", "late"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-6">
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {getFilteredAssignments(tab).length > 0 ? (
                    getFilteredAssignments(tab).map((assignment) => (
                      <motion.div key={assignment.id} variants={item}>
                        <Link to={`/student/assignments/${assignment.id}`}>
                          <Card className="border-0 shadow-md card-interactive">
                            <CardContent className="p-5">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h3 className="font-semibold hover:text-primary transition-colors">
                                        {assignment.title}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                          {assignment.class}
                                        </span>
                                      </div>
                                    </div>
                                    {getStatusBadge(assignment.status, assignment.score, assignment.maxScore)}
                                  </div>
                                  <div className="flex items-center gap-4 mt-3 text-sm">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                      <Calendar className="w-4 h-4" />
                                      Hạn: {assignment.dueDate} {assignment.dueTime}
                                    </span>
                                    {assignment.daysLeft >= 0 ? (
                                      <span className={`font-medium ${getDaysLeftColor(assignment.daysLeft)}`}>
                                        {assignment.daysLeft <= 1 && (
                                          <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                                        )}
                                        Còn {assignment.daysLeft} ngày
                                      </span>
                                    ) : (
                                      <span className="font-medium text-destructive">
                                        Quá hạn {Math.abs(assignment.daysLeft)} ngày
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="shrink-0">
                                  {assignment.status === "not_submitted" ? "Nộp bài" : "Xem chi tiết"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Không có bài tập</h3>
                      <p className="text-muted-foreground">
                        {tab === "pending" && "Bạn đã hoàn thành tất cả bài tập!"}
                        {tab === "submitted" && "Chưa có bài tập nào đang chờ chấm"}
                        {tab === "graded" && "Chưa có bài tập nào được chấm điểm"}
                        {tab === "late" && "Không có bài tập nào trễ hạn"}
                      </p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            ))
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
