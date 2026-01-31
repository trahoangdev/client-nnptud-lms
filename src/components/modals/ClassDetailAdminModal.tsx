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
}

const mockStudents = [
  { id: "1", name: "Trần Văn B", email: "tranvanb@email.com", submissions: 5, avgScore: 8.5 },
  { id: "2", name: "Phạm Văn D", email: "phamvand@email.com", submissions: 4, avgScore: 7.2 },
  { id: "3", name: "Hoàng Thị E", email: "hoangthie@email.com", submissions: 5, avgScore: 9.1 },
  { id: "4", name: "Lê Văn F", email: "levanf@email.com", submissions: 3, avgScore: 6.8 },
];

const mockAssignments = [
  { id: "1", title: "Bài tập React Hooks", submissions: 28, avgScore: 8.2, dueDate: "2025-01-30" },
  { id: "2", title: "TypeScript Basics", submissions: 32, avgScore: 7.8, dueDate: "2025-01-25" },
  { id: "3", title: "Component Styling", submissions: 25, avgScore: 8.5, dueDate: "2025-02-05" },
];

export function ClassDetailAdminModal({
  open,
  onOpenChange,
  classData,
  onArchive,
  onExport,
}: ClassDetailAdminModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!classData) return null;

  const handleExport = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onExport?.(classData.id);
    toast.success("Đã xuất dữ liệu lớp học!", {
      description: "File CSV đã được tải xuống",
    });
    setIsLoading(false);
  };

  const handleArchive = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onArchive?.(classData.id);
    toast.success("Đã lưu trữ lớp học!");
    setIsLoading(false);
    onOpenChange(false);
  };

  const storagePercent = parseFloat(classData.storage) / 5 * 100; // Assuming 5GB max per class

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
              <DialogDescription className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4" />
                {classData.teacher}
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
            <p className="text-xl font-bold">85%</p>
            <p className="text-xs text-muted-foreground">Tỷ lệ nộp</p>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Dung lượng sử dụng</span>
            <span className="text-sm text-muted-foreground">{classData.storage} / 5 GB</span>
          </div>
          <Progress value={storagePercent} className="h-2" />
        </div>

        <Tabs defaultValue="students" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="students" className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Học sinh ({mockStudents.length})
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Bài tập ({mockAssignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học sinh</TableHead>
                    <TableHead className="text-center">Đã nộp</TableHead>
                    <TableHead className="text-center">Điểm TB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.submissions}/{mockAssignments.length}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            student.avgScore >= 8
                              ? "bg-success/10 text-success border-0"
                              : student.avgScore >= 6
                              ? "bg-warning/10 text-warning border-0"
                              : "bg-destructive/10 text-destructive border-0"
                          }
                        >
                          {student.avgScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bài tập</TableHead>
                    <TableHead className="text-center">Đã nộp</TableHead>
                    <TableHead className="text-center">Điểm TB</TableHead>
                    <TableHead>Hạn nộp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell className="text-center">
                        {assignment.submissions}/{classData.students}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-primary/10 text-primary border-0">
                          {assignment.avgScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {assignment.dueDate}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleExport} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Xuất dữ liệu (CSV)
          </Button>

          <div className="flex gap-2">
            {classData.status === "active" && (
              <Button variant="outline" onClick={handleArchive} disabled={isLoading}>
                <Archive className="w-4 h-4 mr-2" />
                Lưu trữ
              </Button>
            )}
            <Button variant="destructive" disabled>
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa lớp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
