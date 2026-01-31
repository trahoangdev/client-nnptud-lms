import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Users, Plus, Search, MoreVertical, Settings, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { CreateClassModal } from "@/components/modals";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { ClassItem } from "@/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteClassId, setDeleteClassId] = useState<number | null>(null);

  const { data: classes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get<ClassItem[]>("/classes"),
  });

  const deleteClassMutation = useMutation({
    mutationFn: (classId: number) => api.delete(`/classes/${classId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-classes"] });
      setDeleteClassId(null);
      toast.success("Đã xóa lớp học");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout userRole="teacher">
      <CreateClassModal
        open={showCreateClass}
        onOpenChange={setShowCreateClass}
        onSuccess={() => refetch()}
      />

      <AlertDialog open={!!deleteClassId} onOpenChange={(open) => !open && setDeleteClassId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa lớp học?</AlertDialogTitle>
            <AlertDialogDescription>
              Lớp và toàn bộ bài tập, điểm, thành viên sẽ bị xóa. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteClassId != null && deleteClassMutation.mutate(deleteClassId)}
            >
              {deleteClassMutation.isPending ? "Đang xóa..." : "Xóa lớp"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Lớp học của tôi</h1>
            <p className="text-muted-foreground mt-1">Quản lý {classes.length} lớp học</p>
          </div>
          <Button onClick={() => setShowCreateClass(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo lớp mới
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm lớp học..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isError ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-muted-foreground">Không thể tải danh sách lớp. Vui lòng thử lại sau.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        ) : isLoading ? (
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
                {classes.length === 0 ? "Chưa có lớp nào. Bấm Tạo lớp mới để bắt đầu." : "Không tìm thấy lớp phù hợp."}
              </div>
            ) : (
              filteredClasses.map((cls, i) => (
                <motion.div key={cls.id} variants={item}>
                  <Card className="border-0 shadow-md card-interactive overflow-hidden group">
                    <div className={`h-2 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center shadow-lg`}
                        >
                          <BookOpen className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/classes/${cls.id}`}>
                                <Settings className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteClassId(cls.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa lớp
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <Link to={`/classes/${cls.id}`}>
                        <h3 className="text-lg font-semibold hover:text-primary transition-colors">{cls.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">Mã lớp: {cls.code}</p>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {cls.students ?? cls._count?.members ?? 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <BookOpen className="w-4 h-4" />
                          {cls.assignments ?? cls._count?.assignments ?? 0} bài tập
                        </div>
                      </div>
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
