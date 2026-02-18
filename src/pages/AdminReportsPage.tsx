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
const getUserGrowthData = (_stats: AdminStats | undefined, realData?: { month: string; teachers: number; students: number }[]) => {
  if (realData && realData.length > 0) return realData;
  return [];
};

// Helper to generate submission data from API stats
const getSubmissionData = (_stats: { total: number; onTime: number; late: number; missing: number } | undefined, realTimeline?: { week: string; onTime: number; late: number }[]) => {
  if (realTimeline && realTimeline.length > 0) return realTimeline;
  return [];
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

interface ClassActivityItem {
  name: string;
  assignments: number;
  submissions: number;
  avgGrade: number;
}

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

  const { data: userGrowthData } = useQuery({
    queryKey: ["admin-reports-user-growth"],
    queryFn: () => api.get<{ month: string; teachers: number; students: number }[]>("/admin/reports/user-growth"),
  });

  const { data: classActivityData } = useQuery({
    queryKey: ["admin-reports-class-activity"],
    queryFn: () => api.get<ClassActivityItem[]>("/admin/reports/class-activity"),
  });

  const { data: submissionsTimeline } = useQuery({
    queryKey: ["admin-reports-submissions-timeline", timeRange],
    queryFn: () => api.get<{ week: string; onTime: number; late: number }[]>(`/admin/reports/submissions-timeline?timeRange=${timeRange}`),
  });

  const { data: dailyActiveData } = useQuery({
    queryKey: ["admin-reports-daily-active"],
    queryFn: () => api.get<{ date: string; users: number }[]>("/admin/reports/daily-active"),
  });

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();
      const timeLabel = timeRange === "week" ? "7 ngay qua" : timeRange === "month" ? "30 ngay qua" : timeRange === "quarter" ? "3 thang qua" : "12 thang qua";

      // Title
      doc.setFontSize(18);
      doc.setTextColor(41, 98, 255);
      doc.text("NNPTUD LMS - BAO CAO THONG KE HE THONG", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Ngay xuat: ${new Date().toLocaleDateString("vi-VN")} | Thoi gian: ${timeLabel}`, 14, 28);

      // Section 1: Users overview
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("1. Tong quan nguoi dung", 14, 40);
      autoTable(doc, {
        startY: 44,
        head: [["Chi tieu", "Gia tri"]],
        body: [
          ["Tong so nguoi dung", String(stats?.totalUsers ?? 0)],
          ["Giao vien", String(stats?.totalTeachers ?? 0)],
          ["Sinh vien", String(stats?.totalStudents ?? 0)],
          ["Tai khoan hoat dong", String(stats?.activeUsers ?? 0)],
        ],
        theme: "grid",
        headStyles: { fillColor: [41, 98, 255] },
      });

      // Section 2: Class & assignments
      const y2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 80;
      doc.setFontSize(14);
      doc.text("2. Thong ke lop hoc", 14, y2 + 10);
      autoTable(doc, {
        startY: y2 + 14,
        head: [["Chi tieu", "Gia tri"]],
        body: [
          ["Tong so lop hoc", String(stats?.totalClasses ?? 0)],
          ["Tong bai tap", String(stats?.totalAssignments ?? 0)],
        ],
        theme: "grid",
        headStyles: { fillColor: [41, 98, 255] },
      });

      // Section 3: Submissions
      const y3 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 120;
      doc.setFontSize(14);
      doc.text("3. Bai nop", 14, y3 + 10);
      autoTable(doc, {
        startY: y3 + 14,
        head: [["Chi tieu", "Gia tri"]],
        body: [
          ["Tong bai nop", String(submissionsStats?.total ?? 0)],
          ["Dung han", String(submissionsStats?.onTime ?? 0)],
          ["Tre han", String(submissionsStats?.late ?? 0)],
        ],
        theme: "grid",
        headStyles: { fillColor: [41, 98, 255] },
      });

      // Section 4: Grade distribution
      const y4 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 160;
      doc.setFontSize(14);
      doc.text("4. Phan bo diem so", 14, y4 + 10);
      autoTable(doc, {
        startY: y4 + 14,
        head: [["Muc diem", "Ty le (%)"]],
        body: [
          ["Xuat sac (>=90%)", `${gradesStats?.percentages?.excellent?.toFixed(1) ?? 0}%`],
          ["Gioi (80-89%)", `${gradesStats?.percentages?.good?.toFixed(1) ?? 0}%`],
          ["Kha (65-79%)", `${gradesStats?.percentages?.average?.toFixed(1) ?? 0}%`],
          ["Trung binh (50-64%)", `${gradesStats?.percentages?.belowAverage?.toFixed(1) ?? 0}%`],
          ["Yeu (<50%)", `${gradesStats?.percentages?.poor?.toFixed(1) ?? 0}%`],
        ],
        theme: "grid",
        headStyles: { fillColor: [41, 98, 255] },
      });

      doc.save(`LMS_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Export PDF error:", error);
    }
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
                      <AreaChart data={getUserGrowthData(stats, userGrowthData)}>
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
                      <LineChart data={dailyActiveData || []}>
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
                    <BarChart data={getSubmissionData(submissionsStats, submissionsTimeline)}>
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
                    <BarChart data={classActivityData || []} layout="vertical">
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
                  {(classActivityData || []).map((cls, index) => (
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
                      <AreaChart data={[]}>
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
                  <p className="text-sm text-muted-foreground text-center mt-2">Dữ liệu lưu trữ trên Cloudinary — chưa có API theo dõi</p>
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
