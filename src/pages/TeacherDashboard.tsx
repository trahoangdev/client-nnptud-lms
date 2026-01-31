import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/layout";
import { Link } from "react-router-dom";
import { CreateClassModal, CreateAssignmentModal } from "@/components/modals";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { ClassItem } from "@/api";
import { useAuth } from "@/context/AuthContext";

const COLORS = [
  "from-primary to-primary/70",
  "from-info to-info/70",
  "from-success to-success/70",
  "from-warning to-warning/70",
  "from-destructive to-destructive/70",
  "from-primary/80 to-info/70",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function TeacherDashboard() {
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const { user } = useAuth();

  const { data: classes = [], isLoading, refetch } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get<ClassItem[]>("/classes"),
  });

  const stats = {
    totalClasses: classes.length,
    totalStudents: classes.reduce((s, c) => s + (c.students ?? c._count?.members ?? 0), 0),
    totalAssignments: classes.reduce((s, c) => s + (c.assignments ?? c._count?.assignments ?? 0), 0),
  };

  const recentClasses = classes.slice(0, 6).map((cls, i) => ({
    id: String(cls.id),
    name: cls.name,
    students: cls.students ?? cls._count?.members ?? 0,
    assignments: cls.assignments ?? cls._count?.assignments ?? 0,
    pendingSubmissions: 0,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <AppLayout userRole="teacher">
      <CreateClassModal
        open={showCreateClass}
        onOpenChange={setShowCreateClass}
        onSuccess={() => {
          refetch();
        }}
      />
      <CreateAssignmentModal
        open={showCreateAssignment}
        onOpenChange={setShowCreateAssignment}
        onSuccess={() => refetch()}
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Xin chào, <span className="text-gradient">{user?.name ?? "Giảng viên"}</span> 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCreateAssignment(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Giao bài mới
            </Button>
            <Button onClick={() => setShowCreateClass(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo lớp học
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                { title: "Tổng lớp học", value: String(stats.totalClasses), icon: BookOpen, change: "", color: "primary" },
                { title: "Học sinh", value: String(stats.totalStudents), icon: Users, change: "", color: "info" },
                { title: "Bài tập đã giao", value: String(stats.totalAssignments), icon: FileText, change: "", color: "success" },
                { title: "Chờ chấm điểm", value: "–", icon: Clock, change: "Xem tại từng lớp", color: "warning" },
              ].map((stat) => (
                <motion.div key={stat.title} variants={item}>
                  <Card className="card-interactive border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-3xl font-bold mt-1">{stat.value}</p>
                          {stat.change && <p className={`text-xs mt-2 text-${stat.color}`}>{stat.change}</p>}
                        </div>
                        <div className={`p-3 rounded-xl bg-${stat.color}/10`}>
                          <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
                <Card className="border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg">Lớp học gần đây</CardTitle>
                      <CardDescription>Quản lý các lớp của bạn</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/classes">
                        Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentClasses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Chưa có lớp nào. Tạo lớp học để bắt đầu.</p>
                    ) : (
                      recentClasses.map((cls) => (
                        <Link key={cls.id} to={`/classes/${cls.id}`} className="block">
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cls.color} flex items-center justify-center flex-shrink-0`}
                            >
                              <BookOpen className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{cls.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {cls.students} học sinh
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5" />
                                  {cls.assignments} bài tập
                                </span>
                              </div>
                            </div>
                            {cls.pendingSubmissions > 0 && (
                              <Badge variant="secondary" className="bg-warning/10 text-warning">
                                {cls.pendingSubmissions} chờ chấm
                              </Badge>
                            )}
                          </div>
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="border-0 shadow-md h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-warning" />
                      Bài nộp mới
                    </CardTitle>
                    <CardDescription>Vào từng lớp → bài tập → tab Submissions để chấm</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" size="sm" asChild>
                      <Link to="/classes">Xem lớp học</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    Tổng quan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lớp học</span>
                        <span className="font-medium">{stats.totalClasses}</span>
                      </div>
                      <Progress value={stats.totalClasses ? Math.min(100, stats.totalClasses * 15) : 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Học sinh</span>
                        <span className="font-medium">{stats.totalStudents}</span>
                      </div>
                      <Progress value={stats.totalStudents ? Math.min(100, stats.totalStudents) : 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bài tập</span>
                        <span className="font-medium">{stats.totalAssignments}</span>
                      </div>
                      <Progress value={stats.totalAssignments ? Math.min(100, stats.totalAssignments * 5) : 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
