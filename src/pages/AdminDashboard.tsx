import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  FileText,
  Shield,
  Search,
  MoreVertical,
  UserPlus,
  Ban,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLayout } from "@/components/layout";
import { CreateUserModal, UserDetailModal, ClassDetailAdminModal } from "@/components/modals";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Loader2 } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "student" | "admin";
  status: "active" | "inactive";
  classes: number;
  createdAt: string;
}

interface ClassRow {
  id: string;
  name: string;
  teacher: string;
  students: number;
  assignments: number;
  status: "active" | "archived";
  storage: string;
}

// Placeholder recent activities (no API yet)
const recentActivities = [
  { id: "1", action: "Tạo tài khoản mới", user: "–", role: "student", time: "Gần đây", type: "create" as const },
  { id: "2", action: "Tạo lớp học mới", user: "–", role: "teacher", time: "Gần đây", type: "create" as const },
  { id: "3", action: "Khóa / kích hoạt tài khoản", user: "–", role: "teacher", time: "Gần đây", type: "warning" as const },
  { id: "4", action: "Reset mật khẩu", user: "–", role: "student", time: "Gần đây", type: "security" as const },
  { id: "5", action: "Xuất dữ liệu lớp", user: "–", role: "teacher", time: "Gần đây", type: "export" as const },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);

  const { data: statsData } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get<{ totalUsers: number; totalTeachers: number; totalStudents: number; totalClasses: number; totalAssignments: number; activeUsers: number }>("/admin/stats"),
  });

  const { data: usersList = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["admin-users-dashboard"],
    queryFn: () => api.get<{ id: number; name: string; email: string; role: string; status: string; createdAt: string }[]>("/admin/users"),
  });

  const { data: classesList = [], isLoading: classesLoading, refetch: refetchClasses } = useQuery({
    queryKey: ["admin-classes-dashboard"],
    queryFn: () => api.get<{ id: number; name: string; code?: string; status: string; teacher?: { name: string }; _count?: { members: number; assignments: number } }[]>("/admin/classes"),
  });

  const users: UserData[] = usersList.map((u) => ({
    id: String(u.id),
    name: u.name,
    email: u.email,
    role: (u.role || "").toLowerCase() as UserData["role"],
    status: (u.status || "").toLowerCase() as UserData["status"],
    classes: 0,
    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "",
  }));

  const classes: ClassRow[] = classesList.map((c) => ({
    id: String(c.id),
    name: c.name,
    teacher: c.teacher?.name ?? "–",
    students: c._count?.members ?? 0,
    assignments: c._count?.assignments ?? 0,
    status: (c.status === "ARCHIVED" ? "archived" : "active") as ClassRow["status"],
    storage: "–",
  }));

  const stats = [
    { title: "Tổng người dùng", value: String(statsData?.totalUsers ?? users.length), change: "–", icon: Users, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Lớp học", value: String(statsData?.totalClasses ?? classes.length), change: "–", icon: BookOpen, color: "text-success", bgColor: "bg-success/10" },
    { title: "Bài tập đã giao", value: String(statsData?.totalAssignments ?? classes.reduce((a, c) => a + c.assignments, 0)), change: "–", icon: FileText, color: "text-info", bgColor: "bg-info/10" },
  ];

  const handleRefetch = () => {
    refetchUsers();
    refetchClasses();
    toast.success("Đã làm mới dữ liệu");
  };

  const handleUserStatusChange = async (userId: string, newStatus: "active" | "inactive") => {
    try {
      await api.patch(`/admin/users/${userId}`, { status: newStatus.toUpperCase() });
      refetchUsers();
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, status: newStatus });
      toast.success(newStatus === "active" ? "Đã kích hoạt tài khoản!" : "Đã khóa tài khoản!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật trạng thái thất bại");
    }
  };

  const handleClassStatusChange = async (classId: string, newStatus: "active" | "archived") => {
    await api.patch(`/classes/${classId}`, { status: newStatus === "archived" ? "ARCHIVED" : "ACTIVE" });
    refetchClasses();
    if (selectedClass?.id === classId) setSelectedClass({ ...selectedClass, status: newStatus });
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filter classes
  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "teacher":
        return <Badge className="bg-primary/10 text-primary border-0">Giáo viên</Badge>;
      case "student":
        return <Badge className="bg-info/10 text-info border-0">Sinh viên</Badge>;
      case "admin":
        return <Badge className="bg-warning/10 text-warning border-0">Admin</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success/10 text-success border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Hoạt động
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-muted text-muted-foreground border-0">
            <Ban className="w-3 h-3 mr-1" />
            Đã khóa
          </Badge>
        );
      case "archived":
        return (
          <Badge className="bg-muted text-muted-foreground border-0">
            Lưu trữ
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "create":
        return <UserPlus className="w-4 h-4 text-success" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "security":
        return <Shield className="w-4 h-4 text-info" />;
      case "export":
        return <Download className="w-4 h-4 text-primary" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  function escapeCsv(s: string) {
    if (/[",\r\n]/.test(String(s))) return `"${String(s).replace(/"/g, '""')}"`;
    return String(s);
  }

  const handleExportUsers = () => {
    const header = "STT,Họ tên,Email,Vai trò,Trạng thái,Ngày tạo";
    const rows = filteredUsers.map((u, i) =>
      [i + 1, escapeCsv(u.name), escapeCsv(u.email), u.role, u.status, escapeCsv(u.createdAt)].join(",")
    );
    const csv = "\uFEFF" + [header, ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `danh-sach-nguoi-dung-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất danh sách người dùng (CSV)!");
  };

  const handleExportClasses = () => {
    const header = "STT,Tên lớp,Giáo viên,Số SV,Số BT,Trạng thái";
    const rows = filteredClasses.map((c, i) =>
      [i + 1, escapeCsv(c.name), escapeCsv(c.teacher), c.students, c.assignments, c.status].join(",")
    );
    const csv = "\uFEFF" + [header, ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `danh-sach-lop-hoc-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất danh sách lớp học (CSV)!");
  };

  const isLoading = usersLoading || classesLoading;

  return (
    <AppLayout userRole="admin">
      {/* Modals */}
      <CreateUserModal
        open={showCreateUser}
        onOpenChange={setShowCreateUser}
        onSuccess={() => {
          refetchUsers();
          toast.success("Đã thêm người dùng. Danh sách đã được làm mới.");
        }}
      />
      <UserDetailModal
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        user={selectedUser}
        onStatusChange={handleUserStatusChange}
      />
      <ClassDetailAdminModal
        open={!!selectedClass}
        onOpenChange={(open) => !open && setSelectedClass(null)}
        classData={selectedClass}
        onArchive={(classId) => handleClassStatusChange(classId, "archived")}
        onDeleted={() => {
          refetchClasses();
          setSelectedClass(null);
        }}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Quản trị hệ thống</h1>
            <p className="text-muted-foreground">
              Quản lý người dùng, lớp học và giám sát hoạt động
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefetch} title="Làm mới">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => setShowCreateUser(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && (
        <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3 h-3 text-success" />
                        <span className="text-xs text-success font-medium">
                          {stat.change}
                        </span>
                        <span className="text-xs text-muted-foreground">so với tháng trước</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tabs with Users/Classes */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <TabsList>
                  <TabsTrigger value="users" className="gap-2">
                    <Users className="w-4 h-4" />
                    Người dùng ({users.length})
                  </TabsTrigger>
                  <TabsTrigger value="classes" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Lớp học ({classes.length})
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[180px]"
                    />
                  </div>
                  {activeTab === "users" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Filter className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="p-2 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Vai trò</p>
                          <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tất cả</SelectItem>
                              <SelectItem value="teacher">Giáo viên</SelectItem>
                              <SelectItem value="student">Sinh viên</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs font-medium text-muted-foreground">Trạng thái</p>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tất cả</SelectItem>
                              <SelectItem value="active">Hoạt động</SelectItem>
                              <SelectItem value="inactive">Đã khóa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={activeTab === "users" ? handleExportUsers : handleExportClasses}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Xuất
                  </Button>
                </div>
              </div>

              <TabsContent value="users">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Người dùng</TableHead>
                          <TableHead>Vai trò</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-center">Lớp học</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Không tìm thấy người dùng nào
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow 
                              key={user.id} 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => setSelectedUser(user)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                      {user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getRoleBadge(user.role)}</TableCell>
                              <TableCell>{getStatusBadge(user.status)}</TableCell>
                              <TableCell className="text-center">{user.classes}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {user.createdAt}
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
                                      setSelectedUser(user);
                                    }}>
                                      Xem chi tiết
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      toast.success("Đã gửi email đặt lại mật khẩu!");
                                    }}>
                                      Đổi mật khẩu
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {user.status === "active" ? (
                                      <DropdownMenuItem 
                                        className="text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUserStatusChange(user.id, "inactive");
                                        }}
                                      >
                                        <Ban className="w-4 h-4 mr-2" />
                                        Khóa tài khoản
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem 
                                        className="text-success"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUserStatusChange(user.id, "active");
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="classes">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lớp học</TableHead>
                          <TableHead>Giáo viên</TableHead>
                          <TableHead className="text-center">Học sinh</TableHead>
                          <TableHead className="text-center">Bài tập</TableHead>
                          <TableHead>Dung lượng</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClasses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Không tìm thấy lớp học nào
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredClasses.map((cls) => (
                            <TableRow 
                              key={cls.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => setSelectedClass(cls)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                  </div>
                                  <span className="font-medium">{cls.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {cls.teacher}
                              </TableCell>
                              <TableCell className="text-center">{cls.students}</TableCell>
                              <TableCell className="text-center">{cls.assignments}</TableCell>
                              <TableCell>{cls.storage}</TableCell>
                              <TableCell>{getStatusBadge(cls.status)}</TableCell>
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
                                      Xem chi tiết
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      toast.success("Đã xuất dữ liệu lớp học!");
                                    }}>
                                      Xuất dữ liệu
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {cls.status === "active" ? (
                                      <DropdownMenuItem 
                                        className="text-destructive"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            await handleClassStatusChange(cls.id, "archived");
                                            toast.success("Đã lưu trữ lớp học!");
                                          } catch (err) {
                                            toast.error(err instanceof Error ? err.message : "Lỗi");
                                          }
                                        }}
                                      >
                                        Lưu trữ lớp
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem 
                                        className="text-success"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            await handleClassStatusChange(cls.id, "active");
                                            toast.success("Đã kích hoạt lớp học!");
                                          } catch (err) {
                                            toast.error(err instanceof Error ? err.message : "Lỗi");
                                          }
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Recent Activities & Alerts */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" />
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Cảnh báo hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-info/10 rounded-lg border border-info/20">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-info mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-info">
                        Cập nhật bảo mật
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Phiên bản mới v2.1.0 đã sẵn sàng với các bản vá bảo mật.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-success">
                        Backup hoàn tất
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Backup tự động lần cuối: 2 giờ trước
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Thống kê nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Giáo viên</span>
                  <span className="font-semibold">{users.filter(u => u.role === "teacher").length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sinh viên</span>
                  <span className="font-semibold">{users.filter(u => u.role === "student").length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tài khoản bị khóa</span>
                  <span className="font-semibold text-destructive">
                    {users.filter(u => u.status === "inactive").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lớp đang hoạt động</span>
                  <span className="font-semibold">{classes.filter(c => c.status === "active").length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lớp đã lưu trữ</span>
                  <span className="font-semibold">{classes.filter(c => c.status === "archived").length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </>
        )}
      </div>
    </AppLayout>
  );
}
