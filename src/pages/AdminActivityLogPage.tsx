import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  UserPlus,
  UserMinus,
  BookOpen,
  FileText,
  Settings,
  LogIn,
  LogOut,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Loader2 } from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: "admin" | "teacher" | "student";
  action: string;
  actionType: "create" | "update" | "delete" | "login" | "logout" | "view" | "system";
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress: string;
  status: "success" | "warning" | "error";
}

interface ActivityLogsResponse {
  logs: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}

const getActionIcon = (actionType: ActivityLog["actionType"]) => {
  switch (actionType) {
    case "create":
      return <UserPlus className="w-4 h-4" />;
    case "update":
      return <Edit className="w-4 h-4" />;
    case "delete":
      return <Trash2 className="w-4 h-4" />;
    case "login":
      return <LogIn className="w-4 h-4" />;
    case "logout":
      return <LogOut className="w-4 h-4" />;
    case "view":
      return <Eye className="w-4 h-4" />;
    case "system":
      return <Settings className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getStatusBadge = (status: ActivityLog["status"]) => {
  switch (status) {
    case "success":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Thành công
        </Badge>
      );
    case "warning":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Cảnh báo
        </Badge>
      );
    case "error":
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Lỗi
        </Badge>
      );
  }
};

const getRoleBadge = (role: ActivityLog["userRole"]) => {
  switch (role) {
    case "admin":
      return <Badge variant="default">Admin</Badge>;
    case "teacher":
      return <Badge variant="secondary">Giáo viên</Badge>;
    case "student":
      return <Badge variant="outline">Học sinh</Badge>;
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function AdminActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, refetch } = useQuery<ActivityLogsResponse>({
    queryKey: ["admin-activity-logs", filterRole, filterAction, filterStatus, currentPage],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterRole !== "all") params.set("role", filterRole);
      if (filterAction !== "all") params.set("actionType", filterAction);
      if (filterStatus !== "all") params.set("status", filterStatus);
      params.set("limit", String(itemsPerPage));
      params.set("offset", String((currentPage - 1) * itemsPerPage));
      return api.get(`/admin/activity-logs?${params.toString()}`);
    },
  });

  const allLogs = data?.logs || [];
  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil((data?.total || 0) / itemsPerPage);
  const paginatedLogs = filteredLogs;

  const handleExport = () => {
    const headers = ["Thời gian", "Người dùng", "Vai trò", "Hành động", "Tài nguyên", "Chi tiết", "IP", "Trạng thái"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [
          formatTimestamp(log.timestamp),
          log.userName,
          log.userRole,
          log.action,
          log.resource,
          log.details || "",
          log.ipAddress,
          log.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const stats = {
    total: data?.total || 0,
    today: allLogs.filter(
      (log) => new Date(log.timestamp).toDateString() === new Date().toDateString()
    ).length,
    errors: allLogs.filter((log) => log.status === "error").length,
    warnings: allLogs.filter((log) => log.status === "warning").length,
  };

  return (
    <AppLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nhật ký hoạt động</h1>
            <p className="text-muted-foreground mt-1">
              Theo dõi tất cả hoạt động trong hệ thống theo thời gian thực
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Xuất CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Tổng hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.today}</p>
                  <p className="text-xs text-muted-foreground">Hôm nay</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.warnings}</p>
                  <p className="text-xs text-muted-foreground">Cảnh báo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.errors}</p>
                  <p className="text-xs text-muted-foreground">Lỗi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Giáo viên</SelectItem>
                  <SelectItem value="student">Học sinh</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại hành động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hành động</SelectItem>
                  <SelectItem value="create">Tạo mới</SelectItem>
                  <SelectItem value="update">Cập nhật</SelectItem>
                  <SelectItem value="delete">Xóa</SelectItem>
                  <SelectItem value="login">Đăng nhập</SelectItem>
                  <SelectItem value="logout">Đăng xuất</SelectItem>
                  <SelectItem value="view">Xem</SelectItem>
                  <SelectItem value="system">Hệ thống</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="warning">Cảnh báo</SelectItem>
                  <SelectItem value="error">Lỗi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách hoạt động</CardTitle>
            <CardDescription>
              Hiển thị {paginatedLogs.length} trong tổng số {data?.total || 0} hoạt động
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Thời gian</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead className="hidden md:table-cell">Chi tiết</TableHead>
                  <TableHead className="hidden lg:table-cell">IP</TableHead>
                  <TableHead className="text-right">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{log.userName}</span>
                        {getRoleBadge(log.userRole)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-muted">
                          {getActionIcon(log.actionType)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{log.action}</span>
                          <span className="text-xs text-muted-foreground">{log.resource}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px]">
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {log.details}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-xs">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell className="text-right">{getStatusBadge(log.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
