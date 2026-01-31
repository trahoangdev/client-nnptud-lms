import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Shield,
  Database,
  HardDrive,
  Bell,
  Mail,
  Globe,
  Lock,
  Key,
  Users,
  Server,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppLayout } from "@/components/layout";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    siteName: "NNPTUD LMS",
    siteUrl: "https://lms.edu.vn",
    adminEmail: "admin@lms.edu.vn",
    maxFileSize: "50",
    maxStoragePerClass: "5",
    sessionTimeout: "30",
    maintenanceMode: false,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    passwordMinLength: "8",
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    passwordRequireSpecial: false,
    maxLoginAttempts: "5",
    lockoutDuration: "15",
    sessionConcurrent: true,
  });

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "noreply@lms.edu.vn",
    smtpPassword: "",
    smtpSecure: "tls",
    fromName: "NNPTUD LMS",
    fromEmail: "noreply@lms.edu.vn",
  });

  // Backup settings
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: "30",
    backupLocation: "local",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    notifyNewUser: true,
    notifyNewClass: true,
    notifyStorageWarning: true,
    notifySecurityAlert: true,
    dailyReport: false,
    weeklyReport: true,
  });

  // Mock backup history
  const backupHistory = [
    { id: "1", date: "2025-01-29 02:00", size: "2.5 GB", status: "success", type: "auto" },
    { id: "2", date: "2025-01-28 02:00", size: "2.4 GB", status: "success", type: "auto" },
    { id: "3", date: "2025-01-27 14:30", size: "2.4 GB", status: "success", type: "manual" },
    { id: "4", date: "2025-01-27 02:00", size: "2.3 GB", status: "failed", type: "auto" },
    { id: "5", date: "2025-01-26 02:00", size: "2.3 GB", status: "success", type: "auto" },
  ];

  // Mock active sessions
  const activeSessions = [
    { id: "1", user: "admin@lms.edu.vn", ip: "192.168.1.100", device: "Chrome / Windows", lastActivity: "Hiện tại" },
    { id: "2", user: "nguyenvana@email.com", ip: "192.168.1.105", device: "Safari / macOS", lastActivity: "5 phút trước" },
    { id: "3", user: "tranvanb@email.com", ip: "10.0.0.50", device: "Chrome / Android", lastActivity: "15 phút trước" },
  ];

  const handleSaveSystem = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Đã lưu cài đặt hệ thống!");
    setIsLoading(false);
  };

  const handleSaveSecurity = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Đã cập nhật cài đặt bảo mật!");
    setIsLoading(false);
  };

  const handleSaveEmail = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Đã lưu cấu hình email!");
    setIsLoading(false);
  };

  const handleTestEmail = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("Email test đã được gửi!", {
      description: "Kiểm tra hộp thư của bạn",
    });
    setIsLoading(false);
  };

  const handleSaveBackup = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Đã cập nhật cài đặt backup!");
    setIsLoading(false);
  };

  const handleManualBackup = async () => {
    setIsLoading(true);
    toast.info("Đang tạo backup...", { duration: 3000 });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    toast.success("Backup hoàn tất!", {
      description: "File backup đã được tạo thành công",
    });
    setIsLoading(false);
  };

  const handleRestoreBackup = (backupId: string) => {
    toast.warning("Bạn có chắc muốn khôi phục từ backup này?", {
      description: "Dữ liệu hiện tại sẽ bị ghi đè",
      action: {
        label: "Xác nhận",
        onClick: () => toast.success("Đang khôi phục..."),
      },
    });
  };

  const handleTerminateSession = (sessionId: string) => {
    toast.success("Đã kết thúc phiên làm việc!");
  };

  const handleTerminateAllSessions = () => {
    toast.success("Đã kết thúc tất cả phiên làm việc khác!");
  };

  return (
    <AppLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Cài đặt hệ thống</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý cấu hình, bảo mật và các thiết lập hệ thống
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-success/10 text-success border-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Hệ thống hoạt động bình thường
            </Badge>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="system" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="system" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Hệ thống</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Bảo mật</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Backup</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Thông báo</span>
            </TabsTrigger>
          </TabsList>

          {/* System Tab */}
          <TabsContent value="system">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* General Settings */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Cài đặt chung
                  </CardTitle>
                  <CardDescription>
                    Thông tin cơ bản của hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Tên hệ thống</Label>
                      <Input
                        id="siteName"
                        value={systemSettings.siteName}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, siteName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteUrl">URL hệ thống</Label>
                      <Input
                        id="siteUrl"
                        value={systemSettings.siteUrl}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, siteUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email quản trị</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={systemSettings.adminEmail}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, adminEmail: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Storage & Limits */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-warning" />
                    Giới hạn lưu trữ
                  </CardTitle>
                  <CardDescription>
                    Cấu hình dung lượng và giới hạn tải lên
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxFileSize">Kích thước file tối đa (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        value={systemSettings.maxFileSize}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, maxFileSize: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStoragePerClass">Dung lượng tối đa/lớp (GB)</Label>
                      <Input
                        id="maxStoragePerClass"
                        type="number"
                        value={systemSettings.maxStoragePerClass}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, maxStoragePerClass: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session timeout (phút)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={systemSettings.sessionTimeout}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, sessionTimeout: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  
                  {/* Current Storage */}
                  <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dung lượng đã sử dụng</span>
                      <span className="text-sm text-muted-foreground">45.2 / 100 GB</span>
                    </div>
                    <Progress value={45.2} className="h-2" />
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
                </CardContent>
              </Card>

              {/* Maintenance Mode */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="w-5 h-5 text-info" />
                    Chế độ bảo trì
                  </CardTitle>
                  <CardDescription>
                    Tạm ngưng truy cập hệ thống để bảo trì
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bật chế độ bảo trì</Label>
                      <p className="text-sm text-muted-foreground">
                        Khi bật, người dùng sẽ thấy trang thông báo bảo trì
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setSystemSettings({ ...systemSettings, maintenanceMode: checked })
                      }
                    />
                  </div>
                  {systemSettings.maintenanceMode && (
                    <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Chế độ bảo trì đang bật</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chỉ admin mới có thể truy cập hệ thống
                      </p>
                    </div>
                  )}
                  <Separator className="my-4" />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSystem} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cài đặt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Password Policy */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    Chính sách mật khẩu
                  </CardTitle>
                  <CardDescription>
                    Quy tắc về độ mạnh mật khẩu người dùng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">Độ dài tối thiểu</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Yêu cầu chữ hoa</Label>
                        <p className="text-sm text-muted-foreground">
                          Mật khẩu phải có ít nhất 1 chữ in hoa
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.passwordRequireUppercase}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({ ...securitySettings, passwordRequireUppercase: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Yêu cầu số</Label>
                        <p className="text-sm text-muted-foreground">
                          Mật khẩu phải có ít nhất 1 chữ số
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.passwordRequireNumber}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({ ...securitySettings, passwordRequireNumber: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Yêu cầu ký tự đặc biệt</Label>
                        <p className="text-sm text-muted-foreground">
                          Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$...)
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.passwordRequireSpecial}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({ ...securitySettings, passwordRequireSpecial: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Login Security */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="w-5 h-5 text-warning" />
                    Bảo mật đăng nhập
                  </CardTitle>
                  <CardDescription>
                    Cấu hình bảo vệ tài khoản khi đăng nhập
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Xác thực 2 yếu tố (2FA)</Label>
                      <p className="text-sm text-muted-foreground">
                        Yêu cầu tất cả người dùng bật 2FA
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorRequired}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, twoFactorRequired: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Số lần đăng nhập sai tối đa</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lockoutDuration">Thời gian khóa (phút)</Label>
                      <Input
                        id="lockoutDuration"
                        type="number"
                        value={securitySettings.lockoutDuration}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, lockoutDuration: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cho phép đăng nhập đồng thời</Label>
                      <p className="text-sm text-muted-foreground">
                        Người dùng có thể đăng nhập từ nhiều thiết bị
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.sessionConcurrent}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, sessionConcurrent: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSecurity} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cài đặt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-info" />
                        Phiên đăng nhập đang hoạt động
                      </CardTitle>
                      <CardDescription>
                        Quản lý các phiên làm việc hiện tại
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleTerminateAllSessions}>
                      Kết thúc tất cả
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Người dùng</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Thiết bị</TableHead>
                        <TableHead>Hoạt động</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">{session.user}</TableCell>
                          <TableCell className="text-muted-foreground">{session.ip}</TableCell>
                          <TableCell className="text-muted-foreground">{session.device}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {session.lastActivity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {session.lastActivity !== "Hiện tại" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleTerminateSession(session.id)}
                              >
                                Kết thúc
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Cấu hình SMTP
                  </CardTitle>
                  <CardDescription>
                    Thiết lập máy chủ gửi email cho hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={emailSettings.smtpUser}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <div className="relative">
                        <Input
                          id="smtpPassword"
                          type={showSmtpPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={emailSettings.smtpPassword}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        >
                          {showSmtpPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpSecure">Bảo mật</Label>
                    <Select
                      value={emailSettings.smtpSecure}
                      onValueChange={(value) =>
                        setEmailSettings({ ...emailSettings, smtpSecure: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không</SelectItem>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromName">Tên người gửi</Label>
                      <Input
                        id="fromName"
                        value={emailSettings.fromName}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, fromName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">Email người gửi</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, fromEmail: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleTestEmail} disabled={isLoading}>
                      <Mail className="w-4 h-4 mr-2" />
                      Gửi email test
                    </Button>
                    <Button onClick={handleSaveEmail} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cấu hình
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Backup Settings */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Cài đặt Backup
                  </CardTitle>
                  <CardDescription>
                    Cấu hình sao lưu tự động cho hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Backup tự động</Label>
                      <p className="text-sm text-muted-foreground">
                        Tự động sao lưu dữ liệu theo lịch
                      </p>
                    </div>
                    <Switch
                      checked={backupSettings.autoBackup}
                      onCheckedChange={(checked) =>
                        setBackupSettings({ ...backupSettings, autoBackup: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tần suất backup</Label>
                      <Select
                        value={backupSettings.backupFrequency}
                        onValueChange={(value) =>
                          setBackupSettings({ ...backupSettings, backupFrequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Mỗi giờ</SelectItem>
                          <SelectItem value="daily">Mỗi ngày</SelectItem>
                          <SelectItem value="weekly">Mỗi tuần</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backupRetention">Lưu giữ (ngày)</Label>
                      <Input
                        id="backupRetention"
                        type="number"
                        value={backupSettings.backupRetention}
                        onChange={(e) =>
                          setBackupSettings({ ...backupSettings, backupRetention: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vị trí lưu trữ</Label>
                      <Select
                        value={backupSettings.backupLocation}
                        onValueChange={(value) =>
                          setBackupSettings({ ...backupSettings, backupLocation: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local Server</SelectItem>
                          <SelectItem value="s3">Amazon S3</SelectItem>
                          <SelectItem value="gcs">Google Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleManualBackup} disabled={isLoading}>
                      <Download className="w-4 h-4 mr-2" />
                      Backup ngay
                    </Button>
                    <Button onClick={handleSaveBackup} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cài đặt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Backup History */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-info" />
                    Lịch sử Backup
                  </CardTitle>
                  <CardDescription>
                    Các bản sao lưu gần đây
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Kích thước</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backupHistory.map((backup) => (
                        <TableRow key={backup.id}>
                          <TableCell className="font-medium">{backup.date}</TableCell>
                          <TableCell>{backup.size}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {backup.type === "auto" ? "Tự động" : "Thủ công"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {backup.status === "success" ? (
                              <Badge className="bg-success/10 text-success border-0">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Thành công
                              </Badge>
                            ) : (
                              <Badge className="bg-destructive/10 text-destructive border-0">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Thất bại
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {backup.status === "success" && (
                                <>
                                  <Button variant="ghost" size="sm">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRestoreBackup(backup.id)}
                                  >
                                    <Upload className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Thông báo Admin
                  </CardTitle>
                  <CardDescription>
                    Cấu hình thông báo cho quản trị viên
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Người dùng mới đăng ký</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo khi có người dùng mới
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.notifyNewUser}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, notifyNewUser: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lớp học mới</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo khi có lớp học mới được tạo
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.notifyNewClass}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, notifyNewClass: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cảnh báo dung lượng</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo khi dung lượng gần đầy
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.notifyStorageWarning}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, notifyStorageWarning: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cảnh báo bảo mật</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo về các sự kiện bảo mật
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.notifySecurityAlert}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, notifySecurityAlert: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-info" />
                    Báo cáo định kỳ
                  </CardTitle>
                  <CardDescription>
                    Nhận báo cáo tổng hợp qua email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Báo cáo hàng ngày</Label>
                      <p className="text-sm text-muted-foreground">
                        Tổng hợp hoạt động mỗi ngày
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.dailyReport}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, dailyReport: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Báo cáo hàng tuần</Label>
                      <p className="text-sm text-muted-foreground">
                        Tổng hợp hoạt động mỗi tuần
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReport}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, weeklyReport: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={() => toast.success("Đã lưu cài đặt thông báo!")}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cài đặt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
