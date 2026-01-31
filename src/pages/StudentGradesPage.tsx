import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/layout";

const classGrades = [
  {
    classId: "1",
    className: "Lập trình Web - KTPM01",
    teacher: "Nguyễn Văn A",
    grades: [
      { id: "1", title: "React Hooks", score: 9, maxScore: 10, gradedAt: "29/01/2025" },
      { id: "2", title: "TypeScript Basics", score: 8.5, maxScore: 10, gradedAt: "25/01/2025" },
      { id: "3", title: "Component Styling", score: 9, maxScore: 10, gradedAt: "20/01/2025" },
    ],
    average: 8.83,
    trend: "up",
  },
  {
    classId: "2",
    className: "Cơ sở dữ liệu - KTPM02",
    teacher: "Trần Thị B",
    grades: [
      { id: "4", title: "SQL Queries", score: 8.5, maxScore: 10, gradedAt: "22/01/2025" },
      { id: "5", title: "ER Diagram", score: 9, maxScore: 10, gradedAt: "18/01/2025" },
    ],
    average: 8.75,
    trend: "up",
  },
  {
    classId: "3",
    className: "Thuật toán - KTPM03",
    teacher: "Lê Văn C",
    grades: [
      { id: "6", title: "Thuật toán sắp xếp", score: 7, maxScore: 10, gradedAt: "15/01/2025" },
      { id: "7", title: "Đệ quy", score: 7.5, maxScore: 10, gradedAt: "10/01/2025" },
      { id: "8", title: "Cấu trúc dữ liệu", score: 8, maxScore: 10, gradedAt: "05/01/2025" },
    ],
    average: 7.5,
    trend: "down",
  },
];

const overallStats = {
  totalAssignments: 8,
  totalGraded: 8,
  overallAverage: 8.31,
  highestScore: 9,
  lowestScore: 7,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function StudentGradesPage() {
  const [selectedClass, setSelectedClass] = useState("all");

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

  const filteredClasses = selectedClass === "all" 
    ? classGrades 
    : classGrades.filter((c) => c.classId === selectedClass);

  const handleExport = () => {
    // Generate CSV
    let csv = "Lớp học,Bài tập,Điểm,Điểm tối đa,Ngày chấm\n";
    classGrades.forEach((cls) => {
      cls.grades.forEach((grade) => {
        csv += `"${cls.className}","${grade.title}",${grade.score},${grade.maxScore},${grade.gradedAt}\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bang-diem.csv";
    link.click();
  };

  return (
    <AppLayout userRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Điểm số</h1>
            <p className="text-muted-foreground mt-1">
              Theo dõi kết quả học tập của bạn
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Xuất bảng điểm
          </Button>
        </div>

        {/* Stats Overview */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
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
                    <p className="text-2xl font-bold">{overallStats.totalGraded}/{overallStats.totalAssignments}</p>
                    <p className="text-xs text-muted-foreground">Đã chấm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filter */}
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

        {/* Grades by Class */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {filteredClasses.map((cls) => (
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
                        <CardDescription>GV: {cls.teacher}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Điểm TB</p>
                        <div className="flex items-center gap-1">
                          <span className={`text-xl font-bold ${getScoreColor(cls.average, 10)}`}>
                            {cls.average.toFixed(2)}
                          </span>
                          {cls.trend === "up" ? (
                            <TrendingUp className="w-4 h-4 text-success" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      </div>
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
                            <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold ${getScoreColor(grade.score, grade.maxScore)} ${getScoreBg(grade.score, grade.maxScore)}`}>
                              {grade.score}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            /{grade.maxScore}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {grade.gradedAt}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}
