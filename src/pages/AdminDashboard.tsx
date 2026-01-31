import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  FileText,
  HardDrive,
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

// Mock data
const stats = [
  {
    title: "Tổng người dùng",
    value: "1,234",
    change: "+12%",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Lớp học hoạt động",
    value: "156",
    change: "+8%",
    icon: BookOpen,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Bài tập đã giao",
    value: "2,847",
    change: "+23%",
    icon: FileText,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    title: "Dung lượng sử dụng",
    value: "45.2 GB",
    change: "68%",
    icon: HardDrive,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "student" | "admin";
  status: "active" | "inactive";
  classes: number;
  createdAt: string;
}

const initialUsers: UserData[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    role: "teacher",
    status: "active",
    classes: 5,
    createdAt: "2025-01-01",
  },
  {
    id: "2",
    name: "Trần Văn B",
    email: "tranvanb@email.com",
    role: "student",
    status: "active",
    classes: 3,
    createdAt: "2025-01-05",
  },
  {
    id: "3",
    name: "Lê Thị C",
    email: "lethic@email.com",
    role: "teacher",
    status: "inactive",
    classes: 2,
    createdAt: "2025-01-08",
  },
  {
    id: "4",
    name: "Phạm Văn D",
    email: "phamvand@email.com",
    role: "student",
    status: "active",
    classes: 4,
    createdAt: "2025-01-10",
  },
  {
    id: "5",
    name: "Hoàng Thị E",
    email: "hoangthie@email.com",
    role: "student",
    status: "active",
    classes: 2,
    createdAt: "2025-01-12",
  },
  {
    id: "6",
    name: "Vũ Minh F",
    email: "vuminhf@email.com",
    role: "teacher",
    status: "active",
    classes: 3,
    createdAt: "2025-01-15",
  },
  {
    id: "7",
    name: "Đỗ Thị G",
    email: "dothig@email.com",
    role: "student",
    status: "active",
    classes: 5,
    createdAt: "2025-01-18",
  },
];

const initialClasses = [
  {
    id: "1",
    name: "Lập trình Web - KTPM01",
    teacher: "Nguyễn Văn A",
    students: 32,
    assignments: 5,
    status: "active" as const,
    storage: "1.2 GB",
  },
  {
    id: "2",
    name: "Cơ sở dữ liệu - KTPM02",
    teacher: "Nguyễn Văn A",
    students: 28,
    assignments: 8,
    status: "active" as const,
    storage: "0.8 GB",
  },
  {
    id: "3",
    name: "Thuật toán - KTPM03",
    teacher: "Lê Thị C",
    students: 35,
    assignments: 3,
    status: "archived" as const,
    storage: "2.1 GB",
  },
  {
    id: "4",
    name: "Mạng máy tính - KTPM04",
    teacher: "Vũ Minh F",
    students: 25,
    assignments: 4,
    status: "active" as const,
    storage: "0.5 GB",
  },
  {
    id: "5",
    name: "Kỹ thuật phần mềm - KTPM05",
    teacher: "Vũ Minh F",
    students: 30,
    assignments: 6,
    status: "active" as const,
    storage: "1.8 GB",
  },
];

const recentActivities = [
  {
    id: "1",
    action: "Tạo tài khoản mới",
    user: "Hoàng Thị E",
    role: "student",
    time: "5 phút trước",
    type: "create",
  },
  {
    id: "2",
    action: "Tạo lớp học mới",
    user: "Nguyễn Văn A",
    role: "teacher",
    time: "1 giờ trước",
    type: "create",
  },
  {
    id: "3",
    action: "Khóa tài khoản",
    user: "Lê Thị C",
    role: "teacher",
    time: "2 giờ trước",
    type: "warning",
  },
  {
    id: "4",
    action: "Reset mật khẩu",
    user: "Trần Văn B",
    role: "student",
    time: "3 giờ trước",
    type: "security",
  },
  {
    id: "5",
    action: "Xuất dữ liệu lớp",
    user: "Nguyễn Văn A",
    role: "teacher",
    time: "5 giờ trước",
    type: "export",
  },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Modal states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof initialUsers[0] | null>(null);
  const [selectedClass, setSelectedClass] = useState<typeof initialClasses[0] | null>(null);
  
  // Data state
  const [users, setUsers] = useState(initialUsers);
  const [classes] = useState(initialClasses);

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

  const handleUserStatusChange = (userId: string, newStatus: "active" | "inactive") => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  const handleExportUsers = () => {
    toast.success("Đã xuất danh sách người dùng!", {
      description: "File CSV đã được tải xuống",
    });
  };

  const handleExportClasses = () => {
    toast.success("Đã xuất danh sách lớp học!", {
      description: "File CSV đã được tải xuống",
    });
  };

  return (
    <AppLayout userRole="admin">
      {/* Modals */}
      <CreateUserModal
        open={showCreateUser}
        onOpenChange={setShowCreateUser}
        onSuccess={() => {
          // Refresh user list
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
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => setShowCreateUser(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Storage Overview */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-warning" />
              Tổng quan dung lượng
            </CardTitle>
            <CardDescription>Quản lý và giám sát dung lượng lưu trữ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tổng dung lượng</span>
                  <span className="text-sm text-muted-foreground">45.2 / 100 GB</span>
                </div>
                <Progress value={45.2} className="h-3" />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    File bài tập: 28.5 GB
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-info" />
                    File nộp: 16.7 GB
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Lớp dùng nhiều nhất</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Thuật toán - KTPM03</span>
                    <span className="font-medium">2.1 GB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">KT Phần mềm - KTPM05</span>
                    <span className="font-medium">1.8 GB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lập trình Web - KTPM01</span>
                    <span className="font-medium">1.2 GB</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-8 border-primary/20 flex items-center justify-center relative">
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-primary"
                      style={{
                        clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)",
                        transform: "rotate(-90deg)",
                      }}
                    />
                    <span className="text-2xl font-bold">45%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Đã sử dụng</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                                          toast.success("Đã khóa tài khoản!");
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
                                          toast.success("Đã kích hoạt tài khoản!");
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
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toast.success("Đã lưu trữ lớp học!");
                                      }}
                                    >
                                      Lưu trữ lớp
                                    </DropdownMenuItem>
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
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex items-start gap-2">
                    <HardDrive className="w-4 h-4 text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning">
                        Dung lượng sắp đầy
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Đã sử dụng 68% dung lượng lưu trữ. Cân nhắc nâng cấp gói hoặc dọn dẹp file cũ.
                      </p>
                    </div>
                  </div>
                </div>
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
      </div>
    </AppLayout>
  );
}
