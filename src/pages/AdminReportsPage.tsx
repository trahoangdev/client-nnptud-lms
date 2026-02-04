import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FileDown,
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Loader2 } from "lucide-react";

// Helper to generate user growth data from stats (simplified - would need historical data in real app)
const getUserGrowthData = (stats: AdminStats | undefined) => {
  if (!stats) return [];
  // Simplified: show current stats as last month
  const currentMonth = new Date().getMonth() + 1;
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const progress = month / 12;
    return {
      month: `T${month}`,
      teachers: Math.round((stats.totalTeachers || 0) * progress),
      students: Math.round((stats.totalStudents || 0) * progress),
    };
  });
};

// Helper to generate submission data from API stats
const getSubmissionData = (stats: { total: number; onTime: number; late: number; missing: number } | undefined) => {
  if (!stats) return [];
  // Simplified: distribute stats across 6 weeks
  return [
    { week: "Tuần 1", onTime: Math.round(stats.onTime * 0.15), late: Math.round(stats.late * 0.15), missing: Math.round(stats.missing * 0.15) },
    { week: "Tuần 2", onTime: Math.round(stats.onTime * 0.18), late: Math.round(stats.late * 0.18), missing: Math.round(stats.missing * 0.18) },
    { week: "Tuần 3", onTime: Math.round(stats.onTime * 0.20), late: Math.round(stats.late * 0.20), missing: Math.round(stats.missing * 0.20) },
    { week: "Tuần 4", onTime: Math.round(stats.onTime * 0.17), late: Math.round(stats.late * 0.17), missing: Math.round(stats.missing * 0.17) },
    { week: "Tuần 5", onTime: Math.round(stats.onTime * 0.15), late: Math.round(stats.late * 0.15), missing: Math.round(stats.missing * 0.15) },
    { week: "Tuần 6", onTime: Math.round(stats.onTime * 0.15), late: Math.round(stats.late * 0.15), missing: Math.round(stats.missing * 0.15) },
  ];
};

// Helper to generate grade distribution from API stats
const getGradeDistribution = (stats: {
  percentages: { excellent: number; good: number; average: number; belowAverage: number; poor: number };
} | undefined) => {
  if (!stats) return [];
  return [
    { name: "Xuất sắc (9-10)", value: Math.round(stats.percentages.excellent), color: "hsl(var(--chart-1))" },
    { name: "Giỏi (8-8.9)", value: Math.round(stats.percentages.good), color: "hsl(var(--chart-2))" },
    { name: "Khá (6.5-7.9)", value: Math.round(stats.percentages.average), color: "hsl(var(--chart-3))" },
    { name: "TB (5-6.4)", value: Math.round(stats.percentages.belowAverage), color: "hsl(var(--chart-4))" },
    { name: "Yếu (<5)", value: Math.round(stats.percentages.poor), color: "hsl(var(--chart-5))" },
  ];
};

const classActivityData = [
  { name: "Toán 12A1", assignments: 24, submissions: 456, avgGrade: 8.2 },
  { name: "Văn 11B2", assignments: 18, submissions: 342, avgGrade: 7.8 },
  { name: "Anh 10C1", assignments: 22, submissions: 418, avgGrade: 8.5 },
  { name: "Lý 12A2", assignments: 20, submissions: 380, avgGrade: 7.5 },
  { name: "Hóa 11B1", assignments: 16, submissions: 304, avgGrade: 8.0 },
];

const storageData = [
  { month: "T7", used: 12.5 },
  { month: "T8", used: 15.2 },
  { month: "T9", used: 18.8 },
  { month: "T10", used: 22.4 },
  { month: "T11", used: 26.1 },
  { month: "T12", used: 28.7 },
];

const dailyActiveUsers = [
  { date: "01/12", users: 145 },
  { date: "02/12", users: 132 },
  { date: "03/12", users: 158 },
  { date: "04/12", users: 142 },
  { date: "05/12", users: 89 },
  { date: "06/12", users: 76 },
  { date: "07/12", users: 168 },
  { date: "08/12", users: 175 },
  { date: "09/12", users: 162 },
  { date: "10/12", users: 148 },
  { date: "11/12", users: 155 },
  { date: "12/12", users: 178 },
  { date: "13/12", users: 185 },
  { date: "14/12", users: 172 },
];

interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalAssignments: number;
  activeUsers: number;
}

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState("month");
  const [isExporting, setIsExporting] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats-reports"],
    queryFn: () => api.get<AdminStats>("/admin/stats"),
  });

  const { data: submissionsStats } = useQuery({
    queryKey: ["admin-reports-submissions", timeRange],
    queryFn: () => api.get<{ total: number; onTime: number; late: number; missing: number }>(`/admin/reports/submissions?timeRange=${timeRange}`),
  });

  const { data: gradesStats } = useQuery({
    queryKey: ["admin-reports-grades"],
    queryFn: () => api.get<{
      distribution: { excellent: number; good: number; average: number; belowAverage: number; poor: number };
      total: number;
      average: number;
      percentages: { excellent: number; good: number; average: number; belowAverage: number; poor: number };
    }>("/admin/reports/grades"),
  });

  const handleExportPDF = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const reportContent = `
NNPTUD LMS - BÁO CÁO THỐNG KÊ HỆ THỐNG
=====================================
Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}
Khoảng thời gian: ${timeRange === "week" ? "7 ngày qua" : timeRange === "month" ? "30 ngày qua" : timeRange === "quarter" ? "3 tháng qua" : "12 tháng qua"}

1. TỔNG QUAN NGƯỜI DÙNG
-----------------------
- Tổng số người dùng: ${stats?.totalUsers ?? "–"}
- Tổng số giáo viên: ${stats?.totalTeachers ?? "–"}
- Tổng số sinh viên: ${stats?.totalStudents ?? "–"}
- Tài khoản hoạt động: ${stats?.activeUsers ?? "–"}

2. THỐNG KÊ LỚP HỌC
-------------------
- Tổng số lớp học: ${stats?.totalClasses ?? "–"}
- Bài tập đã tạo: ${stats?.totalAssignments ?? "–"}

3. THỐNG KÊ BÀI NỘP / PHÂN BỐ ĐIỂM
----------------------------------
(Dữ liệu chi tiết cần API bổ sung)

4. DUNG LƯỢNG LƯU TRỮ
---------------------
(Chưa có API theo dõi dung lượng)
`;
    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LMS_Report_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <AppLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Báo cáo & Thống kê</h1>
            <p className="text-muted-foreground">Phân tích dữ liệu chi tiết của hệ thống</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">7 ngày qua</SelectItem>
                <SelectItem value="month">30 ngày qua</SelectItem>
                <SelectItem value="quarter">3 tháng qua</SelectItem>
                <SelectItem value="year">12 tháng qua</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportPDF} disabled={isExporting}>
              <FileDown className="w-4 h-4 mr-2" />
              {isExporting ? "Đang xuất..." : "Xuất báo cáo"}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {statsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!statsLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng người dùng</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers ?? "–"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Giáo viên + Sinh viên</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lớp học</p>
                  <p className="text-2xl font-bold">{stats?.totalClasses ?? "–"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tổng lớp trong hệ thống</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bài tập đã tạo</p>
                  <p className="text-2xl font-bold">{stats?.totalAssignments ?? "–"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tổng bài tập trong hệ thống</p>
                </div>
                <div className="p-3 rounded-full bg-orange-500/10">
                  <FileText className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tài khoản hoạt động</p>
                  <p className="text-2xl font-bold">{stats?.activeUsers ?? "–"}</p>
                  <p className="text-xs text-muted-foreground mt-1">ACTIVE</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <Download className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Charts Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="submissions">Bài nộp</TabsTrigger>
            <TabsTrigger value="grades">Điểm số</TabsTrigger>
            <TabsTrigger value="classes">Lớp học</TabsTrigger>
            <TabsTrigger value="storage">Lưu trữ</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tăng trưởng người dùng</CardTitle>
                  <CardDescription>Số lượng giáo viên và học sinh theo tháng</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getUserGrowthData(stats)}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="students" 
                          stackId="1"
                          stroke="hsl(var(--chart-1))" 
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.6}
                          name="Học sinh"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="teachers" 
                          stackId="1"
                          stroke="hsl(var(--chart-2))" 
                          fill="hsl(var(--chart-2))"
                          fillOpacity={0.6}
                          name="Giáo viên"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Người dùng hoạt động hàng ngày</CardTitle>
                  <CardDescription>Số người dùng truy cập mỗi ngày</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyActiveUsers}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="users" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                          name="Người dùng"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thống kê bài nộp theo tuần</CardTitle>
                <CardDescription>Tỷ lệ nộp đúng hạn, trễ hạn và chưa nộp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getSubmissionData(submissionsStats)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="onTime" fill="hsl(var(--chart-1))" name="Đúng hạn" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="late" fill="hsl(var(--chart-4))" name="Trễ hạn" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="missing" fill="hsl(var(--chart-5))" name="Chưa nộp" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Phân bố điểm số</CardTitle>
                  <CardDescription>Tỷ lệ phần trăm theo mức điểm</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getGradeDistribution(gradesStats)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${value}%`}
                        >
                          {getGradeDistribution(gradesStats).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thống kê chi tiết</CardTitle>
                  <CardDescription>Tổng quan về điểm số trong hệ thống</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getGradeDistribution(gradesStats).map((grade, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: grade.color }}
                        />
                        <span className="text-sm">{grade.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{grade.value}%</Badge>
                        {gradesStats && (
                          <span className="text-sm text-muted-foreground">
                            ~{Math.round((gradesStats.total || 0) * grade.value / 100)} học sinh
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Điểm trung bình hệ thống</span>
                      <span className="font-semibold text-primary">
                        {gradesStats?.average ? gradesStats.average.toFixed(2) : "–"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hoạt động theo lớp học</CardTitle>
                <CardDescription>So sánh số bài tập và bài nộp giữa các lớp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classActivityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="assignments" fill="hsl(var(--chart-1))" name="Bài tập" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="submissions" fill="hsl(var(--chart-2))" name="Bài nộp" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Điểm trung bình theo lớp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classActivityData.map((cls, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium">{cls.name}</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${cls.avgGrade * 10}%` }}
                        />
                      </div>
                      <Badge variant={cls.avgGrade >= 8 ? "default" : "secondary"}>
                        {cls.avgGrade.toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dung lượng sử dụng theo thời gian</CardTitle>
                  <CardDescription>Xu hướng sử dụng lưu trữ (GB)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={storageData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value) => [`${value} GB`, 'Đã dùng']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="used" 
                          stroke="hsl(var(--chart-3))" 
                          fill="hsl(var(--chart-3))"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Phân bổ lưu trữ</CardTitle>
                  <CardDescription>Theo loại file</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tài liệu (PDF, DOCX)</span>
                        <span className="text-muted-foreground">12.5 GB</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '44%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Hình ảnh</span>
                        <span className="text-muted-foreground">8.2 GB</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '29%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Video</span>
                        <span className="text-muted-foreground">5.8 GB</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: '20%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Khác</span>
                        <span className="text-muted-foreground">2.2 GB</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '7%' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tổng đã sử dụng</span>
                      <span className="font-semibold">28.7 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Giới hạn</span>
                      <span className="font-semibold">100 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Còn trống</span>
                      <span className="font-semibold text-green-600">71.3 GB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
