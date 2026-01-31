import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Award,
  Target,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppLayout } from "@/components/layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { StudentAssignmentWithSubmission } from "@/api";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function StudentGradesPage() {
  const [selectedClass, setSelectedClass] = useState("all");
  const queryClient = useQueryClient();

  const { data: list = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: () => api.get<StudentAssignmentWithSubmission[]>("/student/assignments"),
    refetchOnWindowFocus: true,
  });

  const gradedOnly = useMemo(
    () => list.filter((item) => item.mySubmission?.grade),
    [list]
  );

  const classGrades = useMemo(() => {
    const byClass = new Map<
      number,
      { classId: string; className: string; teacher?: string; grades: { id: string; title: string; score: number; maxScore: number; gradedAt: string }[] }
    >();
    gradedOnly.forEach((item) => {
      const key = item.class.id;
      if (!byClass.has(key)) {
        byClass.set(key, {
          classId: String(key),
          className: item.class.name,
          grades: [],
        });
      }
      const entry = byClass.get(key)!;
      const grade = item.mySubmission!.grade!;
      entry.grades.push({
        id: String(item.assignment.id),
        title: item.assignment.title,
        score: grade.score,
        maxScore: item.assignment.maxScore ?? 10,
        gradedAt: format(parseISO(grade.gradedAt), "dd/MM/yyyy", { locale: vi }),
      });
    });
    return Array.from(byClass.values()).map((cls) => ({
      ...cls,
      average: cls.grades.length ? cls.grades.reduce((s, g) => s + g.score, 0) / cls.grades.length : 0,
    }));
  }, [gradedOnly]);

  const overallStats = useMemo(() => {
    const totalAssignments = list.length;
    const totalGraded = gradedOnly.length;
    const scores = gradedOnly.map((item) => item.mySubmission!.grade!.score);
    const overallAverage = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highestScore = scores.length ? Math.max(...scores) : 0;
    const lowestScore = scores.length ? Math.min(...scores) : 0;
    return { totalAssignments, totalGraded, overallAverage, highestScore, lowestScore };
  }, [list.length, gradedOnly]);

  const filteredClasses = selectedClass === "all" ? classGrades : classGrades.filter((c) => c.classId === selectedClass);

  const getScoreColor = (score: number, max: number) => {
    const percent = (score / max) * 100;
    if (percent >= 80) return "text-success";
    if (percent >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (score: number, max: number) => {
    const percent = (score / max) * 100;
    if (percent >= 80) return "bg-success/10";
    if (percent >= 60) return "bg-warning/10";
    return "bg-destructive/10";
  };

  const handleExport = () => {
    let csv = "Lớp học,Bài tập,Điểm,Điểm tối đa,Ngày chấm\n";
    classGrades.forEach((cls) => {
      cls.grades.forEach((grade) => {
        csv += `"${cls.className}","${grade.title}",${grade.score},${grade.maxScore},${grade.gradedAt}\n`;
      });
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bang-diem.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <AppLayout userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Điểm số</h1>
            <p className="text-muted-foreground mt-1">Theo dõi kết quả học tập của bạn</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["student-assignments"] })}
              disabled={isFetching}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isFetching && "animate-spin")} />
              Làm mới
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={classGrades.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Xuất bảng điểm
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={item}>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overallStats.overallAverage.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Điểm TB</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-success/10">
                        <TrendingUp className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overallStats.highestScore}</p>
                        <p className="text-xs text-muted-foreground">Cao nhất</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-warning/10">
                        <Target className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overallStats.lowestScore}</p>
                        <p className="text-xs text-muted-foreground">Thấp nhất</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-info/10">
                        <CheckCircle2 className="w-5 h-5 text-info" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {overallStats.totalGraded}/{overallStats.totalAssignments}
                        </p>
                        <p className="text-xs text-muted-foreground">Đã chấm</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <div className="flex items-center gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[280px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Lọc theo lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả lớp học</SelectItem>
                  {classGrades.map((cls) => (
                    <SelectItem key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <motion.div key={cls.classId} variants={item}>
                    <Card className="border-0 shadow-md overflow-hidden">
                      <CardHeader className="bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{cls.className}</CardTitle>
                              <CardDescription>Điểm TB: {cls.average.toFixed(2)}</CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Điểm TB</p>
                            <span className={`text-xl font-bold ${getScoreColor(cls.average, 10)}`}>
                              {cls.average.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Bài tập</TableHead>
                              <TableHead className="text-center">Điểm</TableHead>
                              <TableHead className="text-center">Thang điểm</TableHead>
                              <TableHead className="text-right">Ngày chấm</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cls.grades.map((grade) => (
                              <TableRow key={grade.id}>
                                <TableCell className="font-medium">{grade.title}</TableCell>
                                <TableCell className="text-center">
                                  <span
                                    className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold ${getScoreColor(grade.score, grade.maxScore)} ${getScoreBg(grade.score, grade.maxScore)}`}
                                  >
                                    {grade.score}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">/{grade.maxScore}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{grade.gradedAt}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Chưa có bài tập nào được chấm điểm.
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
