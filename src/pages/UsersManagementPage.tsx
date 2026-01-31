import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  MoreVertical,
  UserPlus,
  Ban,
  CheckCircle2,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Calendar,
  Shield,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { CreateUserModal, UserDetailModal } from "@/components/modals";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Loader2 } from "lucide-react";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 5;

export default function UsersManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const { data: usersList = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-users", roleFilter, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter.toUpperCase());
      if (statusFilter !== "all") params.set("status", statusFilter.toUpperCase());
      return api.get<UserData[]>(`/admin/users?${params.toString()}`);
    },
  });

  const users = usersList.map((u) => ({
    ...u,
    id: String(u.id),
    role: (u.role || "").toLowerCase(),
    status: (u.status || "").toLowerCase(),
    classes: 0,
    lastLogin: "",
    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "",
  })) as (UserData & { id: string; classes: number; lastLogin: string })[];

  // Stats
  const stats = [
    {
      title: "Tổng người dùng",
      value: users.length,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Giáo viên",
      value: users.filter(u => u.role === "teacher").length,
      icon: GraduationCap,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Sinh viên",
      value: users.filter(u => u.role === "student").length,
      icon: Users,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Đang hoạt động",
      value: users.filter(u => u.status === "active").length,
      icon: CheckCircle2,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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
      default:
        return null;
    }
  };

  const handleUserStatusChange = (userId: string, newStatus: "active" | "inactive") => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
  };

  const handleExportUsers = () => {
    toast.success("Đã xuất danh sách người dùng!", {
      description: "File CSV đã được tải xuống",
    });
  };

  const handleResetPassword = (userId: string) => {
    toast.success("Đã gửi email đặt lại mật khẩu!", {
      description: "Người dùng sẽ nhận được link đổi mật khẩu qua email",
    });
  };

  const handleSendEmail = (email: string) => {
    toast.success("Đã mở email client!", {
      description: `Gửi email đến ${email}`,
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
      <CreateUserModal
        open={showCreateUser}
        onOpenChange={setShowCreateUser}
        onSuccess={() => {
          refetch();
          toast.success("Đã tạo người dùng mới!");
        }}
      />
      <UserDetailModal
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        user={selectedUser}
        onStatusChange={handleUserStatusChange}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Quản lý người dùng</h1>
            <p className="text-muted-foreground">
              Quản lý tài khoản giáo viên, sinh viên và quản trị viên
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleExportUsers}>
              <Download className="w-4 h-4 mr-2" />
              Xuất CSV
            </Button>
            <Button onClick={() => setShowCreateUser(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Thêm người dùng
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

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Danh sách người dùng
                </CardTitle>
                <CardDescription>
                  Tìm thấy {filteredUsers.length} người dùng
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
                <Select value={roleFilter} onValueChange={(value) => {
                  setRoleFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="teacher">Giáo viên</SelectItem>
                    <SelectItem value="student">Sinh viên</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="inactive">Đã khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Lớp học</TableHead>
                  <TableHead>Đăng nhập gần nhất</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchQuery("");
                          setRoleFilter("all");
                          setStatusFilter("all");
                        }}
                      >
                        Xóa bộ lọc
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-center">{user.classes}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
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
                              handleSendEmail(user.email);
                            }}>
                              <Mail className="w-4 h-4 mr-2" />
                              Gửi email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleResetPassword(user.id);
                            }}>
                              <Shield className="w-4 h-4 mr-2" />
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} trong {filteredUsers.length} người dùng
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
