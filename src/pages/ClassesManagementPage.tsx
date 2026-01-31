import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  MoreVertical,
  Plus,
  Archive,
  CheckCircle2,
  Download,
  RefreshCw,
  Users,
  FileText,
  HardDrive,
  Calendar,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout";
import { ClassDetailAdminModal } from "@/components/modals";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { ClassItem } from "@/api";
import { Loader2 } from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  code: string;
  teacher: string;
  teacherEmail: string;
  students: number;
  assignments: number;
  submissions: number;
  status: string;
  storage: string;
  storageUsed: number;
  createdAt: string;
  lastActivity: string;
}

function useAdminClasses() {
  const { data: list = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: () => api.get<(ClassItem & { teacher?: { name: string; email?: string }; _count?: { members: number; assignments: number } })[]>("/admin/classes"),
  });
  const classes: ClassData[] = list.map((c) => ({
    id: String(c.id),
    name: c.name,
    code: c.code,
    teacher: c.teacher?.name ?? "–",
    teacherEmail: c.teacher?.email ?? "",
    students: c._count?.members ?? 0,
    assignments: c._count?.assignments ?? 0,
    submissions: 0,
    status: (c.status ?? "ACTIVE").toLowerCase(),
    storage: "–",
    storageUsed: 0,
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN") : "",
    lastActivity: "–",
  }));
  return { classes, isLoading, refetch };
}

const ITEMS_PER_PAGE = 5;

export default function ClassesManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);

  const { classes, isLoading, refetch } = useAdminClasses();

  // Stats
  const totalStorage = classes.reduce((acc, c) => acc + c.storageUsed, 0);
  const totalStudents = classes.reduce((acc, c) => acc + c.students, 0);
  const totalAssignments = classes.reduce((acc, c) => acc + c.assignments, 0);

  const stats = [
    {
      title: "Tổng lớp học",
      value: classes.length,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Đang hoạt động",
      value: classes.filter(c => c.status === "active").length,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Tổng sinh viên",
      value: totalStudents,
      icon: Users,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Dung lượng",
      value: `${(totalStorage / 10).toFixed(1)} GB`,
      icon: HardDrive,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  // Filter classes
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = 
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success/10 text-success border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Hoạt động
          </Badge>
        );
      case "archived":
        return (
          <Badge className="bg-muted text-muted-foreground border-0">
            <Archive className="w-3 h-3 mr-1" />
            Lưu trữ
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-destructive/10 text-destructive border-0">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Đình chỉ
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleExportClasses = () => {
    toast.success("Đã xuất danh sách lớp học!", {
      description: "File CSV đã được tải xuống",
    });
  };

  const handleArchiveClass = async (classId: string) => {
    try {
      await api.patch(`/classes/${classId}`, { status: "ARCHIVED" });
      refetch();
      toast.success("Đã lưu trữ lớp học!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    }
  };

  const handleActivateClass = async (classId: string) => {
    try {
      await api.patch(`/classes/${classId}`, { status: "ACTIVE" });
      refetch();
      toast.success("Đã kích hoạt lớp học!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    }
  };

  const handleExportClassData = (className: string) => {
    toast.success(`Đã xuất dữ liệu lớp ${className}!`, {
      description: "File ZIP đang được tải xuống",
    });
  };

  if (isLoading) {
    return (
      <AppLayout userRole="admin">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole="admin">
      <ClassDetailAdminModal
        open={!!selectedClass}
        onOpenChange={(open) => !open && setSelectedClass(null)}
        classData={selectedClass}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Quản lý lớp học</h1>
            <p className="text-muted-foreground">
              Giám sát và quản lý tất cả lớp học trong hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleExportClasses}>
              <Download className="w-4 h-4 mr-2" />
              Xuất CSV
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Storage Overview */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-warning" />
              Tổng quan dung lượng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tổng sử dụng</span>
                  <span className="text-sm text-muted-foreground">{(totalStorage / 10).toFixed(1)} / 100 GB</span>
                </div>
                <Progress value={totalStorage} className="h-3" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Lớp dùng nhiều nhất</p>
                <div className="space-y-1">
                  {classes
                    .sort((a, b) => b.storageUsed - a.storageUsed)
                    .slice(0, 3)
                    .map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{cls.name} - {cls.code}</span>
                        <span className="font-medium">{cls.storage}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes Table */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Danh sách lớp học
                </CardTitle>
                <CardDescription>
                  Tìm thấy {filteredClasses.length} lớp học
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="archived">Lưu trữ</SelectItem>
                    <SelectItem value="suspended">Đình chỉ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Giáo viên</TableHead>
                  <TableHead className="text-center">Sinh viên</TableHead>
                  <TableHead className="text-center">Bài tập</TableHead>
                  <TableHead>Dung lượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Không tìm thấy lớp học nào</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                        }}
                      >
                        Xóa bộ lọc
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClasses.map((cls) => (
                    <TableRow 
                      key={cls.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedClass(cls)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{cls.name}</p>
                            <p className="text-xs text-muted-foreground">{cls.code}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{cls.teacher}</p>
                          <p className="text-xs text-muted-foreground">{cls.teacherEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {cls.students}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {cls.assignments}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={cls.storageUsed} className="h-2 w-16" />
                          <span className="text-sm">{cls.storage}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(cls.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cls.lastActivity}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClass(cls);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleExportClassData(cls.name);
                            }}>
                              <Download className="w-4 h-4 mr-2" />
                              Xuất dữ liệu
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {cls.status === "active" ? (
                              <DropdownMenuItem 
                                className="text-warning"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveClass(cls.id);
                                }}
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                Lưu trữ
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-success"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActivateClass(cls.id);
                                }}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Kích hoạt
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredClasses.length)} trong {filteredClasses.length} lớp học
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
