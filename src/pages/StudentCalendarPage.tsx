import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
  isBefore,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppLayout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { StudentAssignmentWithSubmission } from "@/api";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseISO } from "date-fns";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const COLORS = [
  "from-primary to-primary/70",
  "from-info to-info/70",
  "from-success to-success/70",
  "from-warning to-warning/70",
];

function getStatus(item: StudentAssignmentWithSubmission): "pending" | "submitted" | "graded" | "overdue" {
  const sub = item.mySubmission;
  const due = item.assignment.dueDate ? parseISO(item.assignment.dueDate) : null;
  const now = new Date();
  if (sub?.grade) return "graded";
  if (sub) return "submitted";
  if (due && now > due) return "overdue";
  return "pending";
}

export default function StudentCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: () => api.get<StudentAssignmentWithSubmission[]>("/student/assignments"),
  });

  const assignments = useMemo(() => {
    return list
      .filter((item) => item.assignment.dueDate)
      .map((item, i) => {
        const due = parseISO(item.assignment.dueDate!);
        const status = getStatus(item);
        return {
          id: String(item.assignment.id),
          title: item.assignment.title,
          class: item.class.name,
          classColor: COLORS[item.class.id % COLORS.length],
          dueDate: due,
          dueTime: format(due, "HH:mm", { locale: vi }),
          status,
        };
      });
  }, [list]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array(startDayOfWeek).fill(null);

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter((a) => isSameDay(a.dueDate, date));
  };

  const selectedDateAssignments = selectedDate ? getAssignmentsForDate(selectedDate) : [];

  const getStatusBadge = (status: string, dueDate: Date) => {
    const isOverdue = isBefore(dueDate, new Date()) && (status === "pending" || status === "overdue");
    if (isOverdue || status === "overdue") {
      return (
        <Badge className="bg-destructive/10 text-destructive border-0">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Trễ hạn
        </Badge>
      );
    }
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-info/10 text-info border-0">
            <Clock className="w-3 h-3 mr-1" />
            Đã nộp
          </Badge>
        );
      case "graded":
        return (
          <Badge className="bg-success/10 text-success border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Đã chấm
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <FileText className="w-3 h-3 mr-1" />
            Chờ nộp
          </Badge>
        );
    }
  };

  const getDayIndicators = (date: Date) => {
    const dayAssignments = getAssignmentsForDate(date);
    if (dayAssignments.length === 0) return null;
    const hasPending = dayAssignments.some(
      (a) => (a.status === "pending" || a.status === "overdue") && !isBefore(a.dueDate, new Date())
    );
    const hasOverdue = dayAssignments.some((a) => a.status === "overdue" || (a.status === "pending" && isBefore(a.dueDate, new Date())));
    const hasSubmitted = dayAssignments.some((a) => a.status === "submitted" || a.status === "graded");
    return (
      <div className="flex gap-0.5 justify-center mt-1">
        {hasOverdue && <div className="w-1.5 h-1.5 rounded-full bg-destructive" />}
        {hasPending && !hasOverdue && <div className="w-1.5 h-1.5 rounded-full bg-warning" />}
        {hasSubmitted && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
      </div>
    );
  };

  const upcomingThisMonth = assignments.filter(
    (a) =>
      isSameMonth(a.dueDate, currentMonth) &&
      (a.status === "pending" || a.status === "overdue") &&
      !isBefore(a.dueDate, new Date())
  ).length;
  const overdueCount = assignments.filter((a) => a.status === "overdue" || (a.status === "pending" && isBefore(a.dueDate, new Date()))).length;
  const submittedCount = assignments.filter((a) => a.status === "submitted").length;
  const gradedCount = assignments.filter((a) => a.status === "graded").length;

  return (
    <AppLayout userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
              Lịch deadline
            </h1>
            <p className="text-muted-foreground mt-1">Xem các bài tập theo lịch tháng</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                <span>Chờ nộp</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-success" />
                <span>Đã nộp</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                <span>Trễ hạn</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-warning/10">
                      <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{upcomingThisMonth}</p>
                      <p className="text-xs text-muted-foreground">Deadline tháng này</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-destructive/10">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overdueCount}</p>
                      <p className="text-xs text-muted-foreground">Đã trễ hạn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-info/10">
                      <FileText className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{submittedCount}</p>
                      <p className="text-xs text-muted-foreground">Chờ chấm điểm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-success/10">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{gradedCount}</p>
                      <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy", { locale: vi })}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentMonth(new Date());
                            setSelectedDate(new Date());
                          }}
                        >
                          Hôm nay
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 mb-2">
                      {WEEKDAYS.map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {paddingDays.map((_, index) => (
                        <div key={`padding-${index}`} className="aspect-square" />
                      ))}
                      {daysInMonth.map((day) => {
                        const dayAssignments = getAssignmentsForDate(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const hasDeadlines = dayAssignments.length > 0;
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                              "aspect-square p-1 rounded-lg transition-all hover:bg-muted relative flex flex-col items-center justify-center",
                              isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                              isToday(day) && !isSelected && "ring-2 ring-primary ring-offset-2",
                              hasDeadlines && !isSelected && "bg-muted/50"
                            )}
                          >
                            <span className={cn("text-sm font-medium", isSelected && "text-primary-foreground")}>
                              {format(day, "d")}
                            </span>
                            {!isSelected && getDayIndicators(day)}
                            {hasDeadlines && (
                              <span
                                className={cn(
                                  "absolute top-1 right-1 text-[10px] font-bold",
                                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                                )}
                              >
                                {dayAssignments.length}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-0 shadow-md h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {selectedDate ? format(selectedDate, "EEEE, d MMMM", { locale: vi }) : "Chọn ngày"}
                    </CardTitle>
                    <CardDescription>
                      {selectedDateAssignments.length > 0
                        ? `${selectedDateAssignments.length} bài tập đến hạn`
                        : "Không có deadline"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      {selectedDateAssignments.length > 0 ? (
                        <div className="space-y-3">
                          {selectedDateAssignments.map((assignment) => (
                            <Link key={assignment.id} to={`/student/assignments/${assignment.id}`} className="block">
                              <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                                      assignment.classColor
                                    )}
                                  >
                                    <BookOpen className="w-5 h-5 text-primary-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm truncate">{assignment.title}</h4>
                                    <p className="text-xs text-muted-foreground truncate">{assignment.class}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {assignment.dueTime}
                                      </span>
                                      {getStatusBadge(assignment.status, assignment.dueDate)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground text-sm">Không có bài tập nào đến hạn vào ngày này</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
