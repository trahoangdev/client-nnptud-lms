import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout";
import { toast } from "sonner";

interface SettingsPageProps {
  userRole?: "teacher" | "student" | "admin";
}

export default function SettingsPage({ userRole = "teacher" }: SettingsPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: userRole === "teacher" ? "Nguyễn Văn A" : userRole === "student" ? "Trần Thị B" : "Admin",
    email: `${userRole}@lms.edu.vn`,
    phone: "0912 345 678",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewAssignment: true,
    emailGradeUpdate: true,
    emailComment: false,
    pushNewAssignment: true,
    pushGradeUpdate: true,
    pushComment: true,
    pushDeadlineReminder: true,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "system",
    language: "vi",
    compactMode: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    allowClassInvites: true,
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Đã lưu thông tin cá nhân!");
    setIsLoading(false);
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Đã cập nhật cài đặt thông báo!");
    setIsLoading(false);
  };

  const handleSaveAppearance = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Đã cập nhật giao diện!");
    setIsLoading(false);
  };

  const handleSavePrivacy = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Đã cập nhật cài đặt bảo mật!");
    setIsLoading(false);
  };

  const handleChangePassword = async () => {
    toast.info("Chức năng đổi mật khẩu sẽ sớm được cập nhật!");
  };

  return (
    <AppLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cài đặt</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản và tuỳ chỉnh trải nghiệm của bạn
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
              <span className="hidden sm:inline">Bảo mật</span>
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
                    Ảnh đại diện giúp người khác nhận ra bạn dễ dàng hơn
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {profile.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Thay đổi ảnh
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG hoặc GIF. Tối đa 2MB.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân của bạn
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
                      <Input
                        value={
                          userRole === "teacher"
                            ? "Giảng viên"
                            : userRole === "student"
                            ? "Sinh viên"
                            : "Quản trị viên"
                        }
                        disabled
                        className="bg-muted"
                      />
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
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
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
                    <div className="space-y-0.5">
                      <Label>Bài tập mới</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận email khi có bài tập mới được giao
                      </p>
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
                    <div className="space-y-0.5">
                      <Label>Cập nhật điểm</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận email khi bài tập được chấm điểm
                      </p>
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
                    <div className="space-y-0.5">
                      <Label>Nhận xét mới</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận email khi có nhận xét mới cho bài nộp
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailComment}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailComment: checked })
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
                    Cài đặt thông báo hiển thị trên ứng dụng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bài tập mới</Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo khi có bài tập mới
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
                      <Label>Cập nhật điểm</Label>
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
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Nhắc nhở deadline</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhắc nhở trước khi bài tập hết hạn
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
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Giao diện</CardTitle>
                  <CardDescription>
                    Tuỳ chỉnh giao diện theo sở thích của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-3">
                    <Label>Chế độ hiển thị</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setAppearance({ ...appearance, theme: "light" })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          appearance.theme === "light"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Sun className="w-6 h-6 mx-auto mb-2 text-warning" />
                        <p className="text-sm font-medium">Sáng</p>
                      </button>
                      <button
                        onClick={() => setAppearance({ ...appearance, theme: "dark" })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          appearance.theme === "dark"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Moon className="w-6 h-6 mx-auto mb-2 text-info" />
                        <p className="text-sm font-medium">Tối</p>
                      </button>
                      <button
                        onClick={() => setAppearance({ ...appearance, theme: "system" })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          appearance.theme === "system"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Monitor className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Hệ thống</p>
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {/* Language */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Ngôn ngữ</Label>
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
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Compact Mode */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Chế độ thu gọn</Label>
                      <p className="text-sm text-muted-foreground">
                        Giảm khoảng cách giữa các thành phần
                      </p>
                    </div>
                    <Switch
                      checked={appearance.compactMode}
                      onCheckedChange={(checked) =>
                        setAppearance({ ...appearance, compactMode: checked })
                      }
                    />
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
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Quyền riêng tư</CardTitle>
                  <CardDescription>
                    Kiểm soát thông tin được hiển thị với người khác
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hiển thị email</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép người khác xem email của bạn
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
                        Cho phép người khác xem số điện thoại
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
                      <Label>Cho phép mời vào lớp</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép giáo viên mời bạn vào lớp học mới
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowClassInvites}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, allowClassInvites: checked })
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

              {/* Danger Zone */}
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
                      <Label>Xoá tài khoản</Label>
                      <p className="text-sm text-muted-foreground">
                        Xoá vĩnh viễn tài khoản và tất cả dữ liệu
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => toast.error("Chức năng này cần xác nhận thêm!")}
                    >
                      Xoá tài khoản
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
