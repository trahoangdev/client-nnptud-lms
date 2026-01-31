import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  BookOpen,
  Users,
  FileText,
  HardDrive,
  Calendar,
  User,
  Download,
  Archive,
  Trash2,
  Loader2,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

interface ClassData {
  id: string;
  name: string;
  teacher: string;
  students: number;
  assignments: number;
  status: "active" | "archived" | "suspended";
  storage: string;
}

interface ClassDetailAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: ClassData | null;
  onArchive?: (classId: string) => void;
  onExport?: (classId: string) => void;
  onDeleted?: (classId: string) => void;
}

function escapeCsv(s: string) {
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

interface ClassDetailResponse {
  id: number;
  name: string;
  members: { user: { id: number; name: string; email: string } }[];
  assignments: { id: number; title: string; dueDate: string | null }[];
}

export function ClassDetailAdminModal({
  open,
  onOpenChange,
  classData,
  onArchive,
  onExport,
  onDeleted,
}: ClassDetailAdminModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["class-detail-admin", classData?.id],
    queryFn: () => api.get<ClassDetailResponse>(`/classes/${classData!.id}`),
    enabled: !!open && !!classData?.id,
  });

  const students = detail?.members?.map((m) => ({
    id: String(m.user.id),
    name: m.user.name,
    email: m.user.email,
  })) ?? [];
  const assignments = detail?.assignments?.map((a) => ({
    id: String(a.id),
    title: a.title,
    dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString("vi-VN") : "–",
  })) ?? [];

  if (!classData) return null;

  const handleExport = () => {
    const rows: string[] = [];
    rows.push("Học sinh");
    rows.push("STT,Họ tên,Email");
    students.forEach((s, i) => rows.push(`${i + 1},${escapeCsv(s.name)},${escapeCsv(s.email)}`));
    rows.push("");
    rows.push("Bài tập");
    rows.push("STT,Tên bài tập,Hạn nộp");
    assignments.forEach((a, i) => rows.push(`${i + 1},${escapeCsv(a.title)},${a.dueDate}`));
    const csv = "\uFEFF" + rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lop-${classData.name.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.(classData.id);
    toast.success("Đã xuất dữ liệu lớp học (CSV)!");
  };

  const handleArchive = async () => {
    setIsLoading(true);
    try {
      await Promise.resolve(onArchive?.(classData.id));
      toast.success("Đã lưu trữ lớp học!");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/classes/${classData.id}`);
      onDeleted?.(classData.id);
      toast.success("Đã xóa lớp học!");
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa lớp thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const storageNum = classData.storage === "–" || !classData.storage ? 0 : parseFloat(classData.storage);
  const storagePercent = storageNum > 0 ? Math.min(100, (storageNum / 5) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">{classData.name}</DialogTitle>
              <DialogDescription asChild>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <User className="w-4 h-4 shrink-0" />
                  <span>{classData.teacher}</span>
                  {classData.status === "active" ? (
                    <Badge className="bg-success/10 text-success border-0 ml-2">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Hoạt động
                    </Badge>
                  ) : classData.status === "suspended" ? (
                    <Badge className="bg-destructive/10 text-destructive border-0 ml-2">
                      <Ban className="w-3 h-3 mr-1" />
                      Đình chỉ
                    </Badge>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground border-0 ml-2">
                      <Archive className="w-3 h-3 mr-1" />
                      Đã lưu trữ
                    </Badge>
                  )}
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <Users className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold">{classData.students}</p>
            <p className="text-xs text-muted-foreground">Học sinh</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <FileText className="w-5 h-5 mx-auto text-info mb-1" />
            <p className="text-xl font-bold">{classData.assignments}</p>
            <p className="text-xs text-muted-foreground">Bài tập</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <HardDrive className="w-5 h-5 mx-auto text-warning mb-1" />
            <p className="text-xl font-bold">{classData.storage}</p>
            <p className="text-xs text-muted-foreground">Dung lượng</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <Calendar className="w-5 h-5 mx-auto text-success mb-1" />
            <p className="text-xl font-bold">{detail ? assignments.length : "–"}</p>
            <p className="text-xs text-muted-foreground">Bài tập (chi tiết)</p>
          </div>
        </div>

        {classData.storage !== "–" && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Dung lượng sử dụng</span>
              <span className="text-sm text-muted-foreground">{classData.storage} / 5 GB</span>
            </div>
            <Progress value={storagePercent} className="h-2" />
          </div>
        )}

        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="students" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="students" className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Học sinh ({students.length})
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                Bài tập ({assignments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Học sinh</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                          Chưa có học sinh trong lớp
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student, i) => (
                        <TableRow key={student.id}>
                          <TableCell className="w-12">{i + 1}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Bài tập</TableHead>
                      <TableHead>Hạn nộp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                          Chưa có bài tập
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment, i) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="w-12">{i + 1}</TableCell>
                          <TableCell className="font-medium">{assignment.title}</TableCell>
                          <TableCell className="text-muted-foreground">{assignment.dueDate}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button variant="outline" onClick={handleExport} disabled={detailLoading}>
            <Download className="w-4 h-4 mr-2" />
            Xuất dữ liệu (CSV)
          </Button>

          <div className="flex gap-2">
            {classData.status === "active" && (
              <Button variant="outline" onClick={handleArchive} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Archive className="w-4 h-4 mr-2" />}
                Lưu trữ
              </Button>
            )}
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={isLoading}>
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa lớp
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lớp</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa lớp &quot;{classData.name}&quot;? Hành động này không thể hoàn tác và sẽ xóa cả bài tập, bài nộp liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xóa lớp"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
