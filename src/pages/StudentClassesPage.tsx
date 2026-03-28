import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Users, Search, UserPlus, Clock, CheckCircle2, ArrowRight, Loader2, MoreVertical, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppLayout } from "@/components/layout";
import { JoinClassModal } from "@/components/modals";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { classesService } from "@/api";
import { toast } from "sonner";
import type { ClassItem } from "@/api";

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

export default function StudentClassesPage() {
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [leaveTarget, setLeaveTarget] = useState<ClassItem | null>(null);
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading, refetch } = useQuery({
    queryKey: ["student-classes"],
    queryFn: () => api.get<ClassItem[]>("/classes"),
  });

  const leaveMutation = useMutation({
    mutationFn: ({ classId }: { classId: number; className: string }) => classesService.leave(classId),
    onSuccess: (_data, variables) => {
      toast.success(`Đã rời lớp "${variables.className}" thành công`);
      setLeaveTarget(null);
      queryClient.invalidateQueries({ queryKey: ["student-classes"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Rời lớp thất bại");
    },
  });

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.teacher?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout userRole="student">
      <JoinClassModal
        open={showJoinClass}
        onOpenChange={setShowJoinClass}
        onSuccess={() => refetch()}
      />

      <AlertDialog open={!!leaveTarget} onOpenChange={(open) => !open && setLeaveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rời lớp học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn rời lớp <strong>"{leaveTarget?.name}"</strong>? Bạn có thể tham gia lại bằng mã lớp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={leaveMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={leaveMutation.isPending}
              onClick={() => leaveTarget && leaveMutation.mutate({ classId: leaveTarget.id, className: leaveTarget.name })}
            >
              {leaveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Rời lớp
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Lớp học của tôi</h1>
            <p className="text-muted-foreground mt-1">Bạn đang tham gia {classes.length} lớp học</p>
          </div>
          <Button onClick={() => setShowJoinClass(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tham gia lớp
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm lớp theo tên, mã lớp, giáo viên..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredClasses.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {classes.length === 0
                  ? "Bạn chưa tham gia lớp nào. Bấm Tham gia lớp và nhập mã lớp."
                  : "Không tìm thấy lớp phù hợp."}
              </div>
            ) : (
              filteredClasses.map((cls, i) => (
                <motion.div key={cls.id} variants={item}>
                  <Card className="border-0 shadow-md card-interactive overflow-hidden h-full">
                    <div className={`h-2 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Link to={`/student/classes/${cls.id}`}>
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center shadow-lg`}
                          >
                            <BookOpen className="w-6 h-6 text-primary-foreground" />
                          </div>
                        </Link>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {cls.code}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setLeaveTarget(cls)}
                              >
                                <LogOut className="w-4 h-4 mr-2" />
                                Rời lớp
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <Link to={`/student/classes/${cls.id}`}>
                        <h3 className="text-lg font-semibold hover:text-primary transition-colors">{cls.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        GV: {cls.teacher?.name ?? "–"}
                      </p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {cls.students ?? cls._count?.members ?? 0} thành viên
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <BookOpen className="w-4 h-4" />
                          {cls.assignments ?? cls._count?.assignments ?? 0} bài tập
                        </div>
                      </div>
                      <Link to={`/student/classes/${cls.id}`} className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                        Xem chi tiết
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
