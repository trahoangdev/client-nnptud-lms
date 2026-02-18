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
  Users,
  Loader2,
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
  parseISO,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppLayout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const COLORS = [
  "from-primary to-primary/70",
  "from-blue-500 to-blue-400",
  "from-emerald-500 to-emerald-400",
  "from-amber-500 to-amber-400",
  "from-purple-500 to-purple-400",
];

interface ClassItem {
  id: number;
  name: string;
  code: string;
}

interface AssignmentItem {
  id: number;
  title: string;
  dueDate: string | null;
  classId: number;
  submissions?: { id: number }[];
  _count?: { submissions: number };
}

interface CalendarAssignment {
  id: number;
  title: string;
  className: string;
  classColor: string;
  dueDate: Date;
  dueTime: string;
  classId: number;
  submissionCount: number;
  isOverdue: boolean;
  isPast: boolean;
}

export default function TeacherCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Fetch teacher's classes
  const { data: classes = [] } = useQuery<ClassItem[]>({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/classes"),
  });

  // Fetch all assignments across all classes
  const { data: allAssignments = [], isLoading } = useQuery<AssignmentItem[]>({
    queryKey: ["teacher-all-assignments"],
    queryFn: async () => {
      const results = await Promise.all(
        classes.map((cls) =>
          api
            .get<AssignmentItem[]>(`/classes/${cls.id}/assignments`)
            .then((assignments) =>
              assignments.map((a) => ({ ...a, classId: cls.id }))
            )
        )
      );
      return results.flat();
    },
    enabled: classes.length > 0,
  });

  // Map class names
  const classMap = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c])),
    [classes]
  );

  const assignments: CalendarAssignment[] = useMemo(() => {
    return allAssignments
      .filter((a) => a.dueDate)
      .map((a) => {
        const due = parseISO(a.dueDate!);
        const now = new Date();
        const cls = classMap[a.classId];
        return {
          id: a.id,
          title: a.title,
          className: cls?.name || "",
          classColor: COLORS[a.classId % COLORS.length],
          dueDate: due,
          dueTime: format(due, "HH:mm", { locale: vi }),
          classId: a.classId,
          submissionCount: a._count?.submissions || a.submissions?.length || 0,
          isOverdue: isBefore(due, now),
          isPast: isBefore(due, now),
        };
      });
  }, [allAssignments, classMap]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array(startDayOfWeek).fill(null);

  const getAssignmentsForDate = (date: Date) =>
    assignments.filter((a) => isSameDay(a.dueDate, date));

  const selectedDateAssignments = selectedDate
    ? getAssignmentsForDate(selectedDate)
    : [];

  const upcomingThisMonth = assignments.filter(
    (a) => isSameMonth(a.dueDate, currentMonth) && !a.isPast
  ).length;
  const pastThisMonth = assignments.filter(
    (a) => isSameMonth(a.dueDate, currentMonth) && a.isPast
  ).length;
  const totalThisMonth = assignments.filter((a) =>
    isSameMonth(a.dueDate, currentMonth)
  ).length;

  const getDayIndicators = (date: Date) => {
    const dayAssignments = getAssignmentsForDate(date);
    if (dayAssignments.length === 0) return null;
    const hasUpcoming = dayAssignments.some((a) => !a.isPast);
    const hasPast = dayAssignments.some((a) => a.isPast);
    return (
      <div className="flex gap-0.5 justify-center mt-1">
        {hasPast && (
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
        )}
        {hasUpcoming && (
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </div>
    );
  };

  return (
    <AppLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
              Lịch deadline
            </h1>
            <p className="text-muted-foreground mt-1">
              Xem deadline tất cả bài tập theo lịch tháng
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>Sắp tới</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
                <span>Đã qua</span>
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
            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalThisMonth}</p>
                      <p className="text-xs text-muted-foreground">
                        Deadline tháng này
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-warning/10">
                      <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{upcomingThisMonth}</p>
                      <p className="text-xs text-muted-foreground">
                        Sắp tới
                      </p>
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
                      <p className="text-2xl font-bold">{pastThisMonth}</p>
                      <p className="text-xs text-muted-foreground">
                        Đã qua
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2"
              >
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {format(currentMonth, "MMMM yyyy", { locale: vi })}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setCurrentMonth(subMonths(currentMonth, 1))
                          }
                        >
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setCurrentMonth(addMonths(currentMonth, 1))
                          }
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 mb-2">
                      {WEEKDAYS.map((day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-medium text-muted-foreground py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {paddingDays.map((_, index) => (
                        <div
                          key={`padding-${index}`}
                          className="aspect-square"
                        />
                      ))}
                      {daysInMonth.map((day) => {
                        const dayAssignments = getAssignmentsForDate(day);
                        const isSelected =
                          selectedDate && isSameDay(day, selectedDate);
                        const hasDeadlines = dayAssignments.length > 0;
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                              "aspect-square p-1 rounded-lg transition-all hover:bg-muted relative flex flex-col items-center justify-center",
                              isSelected &&
                                "bg-primary text-primary-foreground hover:bg-primary/90",
                              isToday(day) &&
                                !isSelected &&
                                "ring-2 ring-primary ring-offset-2",
                              hasDeadlines && !isSelected && "bg-muted/50"
                            )}
                          >
                            <span
                              className={cn(
                                "text-sm font-medium",
                                isSelected && "text-primary-foreground"
                              )}
                            >
                              {format(day, "d")}
                            </span>
                            {!isSelected && getDayIndicators(day)}
                            {hasDeadlines && (
                              <span
                                className={cn(
                                  "absolute top-1 right-1 text-[10px] font-bold",
                                  isSelected
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground"
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

              {/* Sidebar: selected date details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-md h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {selectedDate
                        ? format(selectedDate, "EEEE, d MMMM", { locale: vi })
                        : "Chọn ngày"}
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
                            <Link
                              key={assignment.id}
                              to={`/assignments/${assignment.id}`}
                              className="block"
                            >
                              <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                                      assignment.classColor
                                    )}
                                  >
                                    <BookOpen className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm truncate">
                                      {assignment.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {assignment.className}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {assignment.dueTime}
                                      </span>
                                      <Badge
                                        variant={
                                          assignment.isPast
                                            ? "secondary"
                                            : "default"
                                        }
                                        className="text-xs"
                                      >
                                        {assignment.isPast
                                          ? "Đã qua"
                                          : "Đang mở"}
                                      </Badge>
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
                          <p className="text-muted-foreground text-sm">
                            Không có bài tập nào đến hạn vào ngày này
                          </p>
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
