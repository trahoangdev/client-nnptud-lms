import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  User,
  Bell,
  Palette,
  Shield,
  Key,
  Mail,
  Phone,
  Camera,
  Save,
  Moon,
  Sun,
  Monitor,
  GraduationCap,
  BookOpen,
  Clock,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { api } from "@/api/client";
import { authService } from "@/api/services/auth";

export default function StudentSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    studentId: user?.id != null ? String(user.id) : "",
    faculty: "",
    class: "",
  });

  useEffect(() => {
    if (user) {
      setProfile((p) => ({
        ...p,
        fullName: user.name ?? p.fullName,
        email: user.email ?? p.email,
        studentId: user.id != null ? String(user.id) : p.studentId,
      }));
    }
  }, [user]);

  // Notification settings - student specific — persist in localStorage
  const NOTIF_STORAGE_KEY = "lms_notif_settings_student";
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {
      // Email
      emailNewAssignment: true,
      emailGradeUpdate: true,
      emailComment: true,
      emailDeadlineReminder: true,
      // Push
      pushNewAssignment: true,
      pushGradeUpdate: true,
      pushComment: true,
      pushDeadlineReminder: true,
      // Reminder settings
      reminderHours: "24", // hours before deadline
    };
  });

  // Appearance settings
  const { theme: currentTheme, setTheme: setNextTheme } = useTheme();
  const [appearance, setAppearance] = useState({
    theme: currentTheme || "system",
    language: "vi",
    compactMode: false,
    showDeadlineCountdown: true,
    sortAssignmentsBy: "deadline",
  });

  // Privacy settings — persist in localStorage
  const PRIVACY_STORAGE_KEY = "lms_privacy_settings_student";
  const [privacy, setPrivacy] = useState(() => {
    try {
      const saved = localStorage.getItem(PRIVACY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {
      showEmail: false,
      showPhone: false,
      showProfileToClassmates: true,
      allowTeacherContact: true,
    };
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await api.patch("/me", { name: profile.fullName, email: profile.email });
      toast.success("Đã lưu thông tin cá nhân!");
      refreshUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi cập nhật hồ sơ";
      toast.error(msg);
    }
    setIsLoading(false);
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifications));
      toast.success("Đã cập nhật cài đặt thông báo!");
    } catch {
      toast.error("Lỗi lưu cài đặt thông báo");
    }
    setIsLoading(false);
  };

  const handleSaveAppearance = async () => {
    setIsLoading(true);
    setNextTheme(appearance.theme);
    toast.success("Đã cập nhật giao diện!");
    setIsLoading(false);
  };

  const handleSavePrivacy = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(privacy));
      toast.success("Đã cập nhật cài đặt quyền riêng tư!");
    } catch {
      toast.error("Lỗi lưu cài đặt quyền riêng tư");
    }
    setIsLoading(false);
  };

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại và mật khẩu mới");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setIsLoading(true);
    try {
      await api.patch("/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi đổi mật khẩu";
      toast.error(msg);
    }
    setIsLoading(false);
  };

  return (
    <AppLayout userRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cài đặt</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản và tuỳ chỉnh trải nghiệm học tập của bạn
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Hồ sơ</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Thông báo</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Giao diện</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Quyền riêng tư</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Avatar Section */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Ảnh đại diện</CardTitle>
                  <CardDescription>
                    Ảnh đại diện giúp giáo viên và bạn học nhận ra bạn dễ dàng hơn
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatar ?? ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {profile.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="student-avatar-upload"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("File quá lớn. Tối đa 2MB.");
                          return;
                        }
                        try {
                          await authService.uploadAvatar(file);
                          toast.success("Cập nhật ảnh đại diện thành công!");
                          refreshUser();
                        } catch {
                          toast.error("Lỗi upload ảnh đại diện");
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("student-avatar-upload")?.click()}>
                      <Camera className="w-4 h-4 mr-2" />
                      Thay đổi ảnh
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG hoặc GIF. Tối đa 2MB.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Student Info */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Thông tin sinh viên
                  </CardTitle>
                  <CardDescription>
                    Thông tin học vụ của bạn (chỉ đọc)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Mã sinh viên</Label>
                      <Input value={profile.studentId} disabled className="bg-muted font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label>Khoa</Label>
                      <Input value={profile.faculty} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Lớp</Label>
                      <Input value={profile.class} disabled className="bg-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin liên hệ của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) =>
                          setProfile({ ...profile, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Vai trò</Label>
                      <div className="flex items-center gap-2 h-10">
                        <Badge className="bg-primary/10 text-primary">Sinh viên</Badge>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu thay đổi
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Đổi mật khẩu</CardTitle>
                  <CardDescription>
                    Đảm bảo tài khoản của bạn luôn an toàn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={handleChangePassword}>
                      <Key className="w-4 h-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                  </div>
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
              {/* Deadline Reminders - Student specific */}
              <Card className="border-0 shadow-md border-l-4 border-l-warning">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Nhắc nhở Deadline
                  </CardTitle>
                  <CardDescription>
                    Cấu hình thông báo nhắc nhở trước khi bài tập hết hạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bật nhắc nhở deadline</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo trước khi bài tập hết hạn
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushDeadlineReminder}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushDeadlineReminder: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Thời gian nhắc trước</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhắc nhở trước deadline bao lâu
                      </p>
                    </div>
                    <Select
                      value={notifications.reminderHours}
                      onValueChange={(value) =>
                        setNotifications({ ...notifications, reminderHours: value })
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 giờ trước</SelectItem>
                        <SelectItem value="12">12 giờ trước</SelectItem>
                        <SelectItem value="24">1 ngày trước</SelectItem>
                        <SelectItem value="48">2 ngày trước</SelectItem>
                        <SelectItem value="72">3 ngày trước</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Email Notifications */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Thông báo Email
                  </CardTitle>
                  <CardDescription>
                    Chọn loại thông báo bạn muốn nhận qua email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label>Bài tập mới</Label>
                        <p className="text-sm text-muted-foreground">
                          Khi giáo viên giao bài tập mới
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailNewAssignment}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailNewAssignment: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label>Điểm số mới</Label>
                        <p className="text-sm text-muted-foreground">
                          Khi bài tập được chấm điểm
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailGradeUpdate}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailGradeUpdate: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label>Nhận xét từ giáo viên</Label>
                        <p className="text-sm text-muted-foreground">
                          Khi giáo viên comment bài nộp
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailComment}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailComment: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label>Nhắc deadline qua email</Label>
                        <p className="text-sm text-muted-foreground">
                          Nhận email nhắc nhở trước deadline
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailDeadlineReminder}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailDeadlineReminder: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Push Notifications */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Thông báo đẩy
                  </CardTitle>
                  <CardDescription>
                    Thông báo hiển thị trên ứng dụng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bài tập mới</Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo ngay khi có bài tập mới
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNewAssignment}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushNewAssignment: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Điểm số mới</Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo khi bài được chấm
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushGradeUpdate}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushGradeUpdate: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Nhận xét mới</Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo khi có comment mới
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushComment}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushComment: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cài đặt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Theme */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Giao diện</CardTitle>
                  <CardDescription>
                    Tuỳ chỉnh giao diện theo sở thích của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Chế độ hiển thị</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "light", icon: Sun, label: "Sáng" },
                        { value: "dark", icon: Moon, label: "Tối" },
                        { value: "system", icon: Monitor, label: "Hệ thống" },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setAppearance({ ...appearance, theme: theme.value })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            appearance.theme === theme.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <theme.icon className={`w-6 h-6 ${
                            appearance.theme === theme.value ? "text-primary" : "text-muted-foreground"
                          }`} />
                          <span className={`text-sm font-medium ${
                            appearance.theme === theme.value ? "text-primary" : ""
                          }`}>
                            {theme.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="language">Ngôn ngữ</Label>
                      <p className="text-sm text-muted-foreground">
                        Chọn ngôn ngữ hiển thị
                      </p>
                    </div>
                    <Select
                      value={appearance.language}
                      onValueChange={(value) =>
                        setAppearance({ ...appearance, language: value })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Chế độ gọn nhẹ</Label>
                      <p className="text-sm text-muted-foreground">
                        Giảm khoảng cách và hiệu ứng để tối ưu hiệu năng
                      </p>
                    </div>
                    <Switch
                      checked={appearance.compactMode}
                      onCheckedChange={(checked) =>
                        setAppearance({ ...appearance, compactMode: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Student-specific display options */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Hiển thị học tập</CardTitle>
                  <CardDescription>
                    Tuỳ chỉnh cách hiển thị thông tin học tập
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hiển thị đếm ngược deadline</Label>
                      <p className="text-sm text-muted-foreground">
                        Hiển thị số ngày còn lại cho mỗi bài tập
                      </p>
                    </div>
                    <Switch
                      checked={appearance.showDeadlineCountdown}
                      onCheckedChange={(checked) =>
                        setAppearance({ ...appearance, showDeadlineCountdown: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sắp xếp bài tập theo</Label>
                      <p className="text-sm text-muted-foreground">
                        Thứ tự mặc định khi xem danh sách bài tập
                      </p>
                    </div>
                    <Select
                      value={appearance.sortAssignmentsBy}
                      onValueChange={(value) =>
                        setAppearance({ ...appearance, sortAssignmentsBy: value })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deadline">Deadline gần nhất</SelectItem>
                        <SelectItem value="created">Mới giao gần đây</SelectItem>
                        <SelectItem value="class">Theo lớp học</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveAppearance} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cài đặt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Profile Visibility */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Hiển thị hồ sơ</CardTitle>
                  <CardDescription>
                    Kiểm soát thông tin người khác có thể xem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hiển thị email</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép bạn học xem email của bạn
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, showEmail: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hiển thị số điện thoại</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép bạn học xem số điện thoại
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, showPhone: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hiển thị trong danh sách lớp</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép bạn cùng lớp thấy bạn trong danh sách thành viên
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showProfileToClassmates}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, showProfileToClassmates: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Permissions */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Quyền liên hệ</CardTitle>
                  <CardDescription>
                    Ai có thể liên hệ trực tiếp với bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cho phép giáo viên liên hệ</Label>
                      <p className="text-sm text-muted-foreground">
                        Giáo viên có thể gửi tin nhắn trực tiếp cho bạn
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowTeacherContact}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, allowTeacherContact: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSavePrivacy} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu cài đặt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card className="border-0 shadow-md border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">Vùng nguy hiểm</CardTitle>
                  <CardDescription>
                    Các hành động không thể hoàn tác
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rời khỏi tất cả lớp học</Label>
                      <p className="text-sm text-muted-foreground">
                        Huỷ đăng ký khỏi tất cả các lớp hiện tại
                      </p>
                    </div>
                    <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                      Rời lớp
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
