import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Key,
  Ban,
  CheckCircle2,
  Loader2,
  Save,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "student" | "admin";
  status: "active" | "inactive";
  classes: number;
  createdAt: string;
}

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onStatusChange?: (userId: string, newStatus: "active" | "inactive") => void;
  onPasswordReset?: (userId: string) => void;
}

export function UserDetailModal({
  open,
  onOpenChange,
  user,
  onStatusChange,
  onPasswordReset,
}: UserDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedEmail, setEditedEmail] = useState(user?.email || "");

  if (!user) return null;

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Đã cập nhật thông tin người dùng!");
    setIsLoading(false);
  };

  const handleToggleStatus = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newStatus = user.status === "active" ? "inactive" : "active";
    onStatusChange?.(user.id, newStatus);
    toast.success(
      newStatus === "active"
        ? "Đã kích hoạt tài khoản!"
        : "Đã khóa tài khoản!"
    );
    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onPasswordReset?.(user.id);
    toast.success("Đã gửi email đặt lại mật khẩu!");
    setIsLoading(false);
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{user.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                {getRoleBadge(user.role)}
                {user.status === "active" ? (
                  <Badge className="bg-success/10 text-success border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge className="bg-muted text-muted-foreground border-0">
                    <Ban className="w-3 h-3 mr-1" />
                    Đã khóa
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">
              <User className="w-4 h-4 mr-2" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex-1">
              <BookOpen className="w-4 h-4 mr-2" />
              Lớp học
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1">
              <Shield className="w-4 h-4 mr-2" />
              Bảo mật
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={editedName || user.name}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={editedEmail || user.email}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày tạo</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted rounded-md">
                  <Calendar className="w-4 h-4" />
                  {user.createdAt}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Số lớp học</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted rounded-md">
                  <BookOpen className="w-4 h-4" />
                  {user.classes} lớp
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="mt-4">
            <div className="space-y-3">
              {user.role === "teacher" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Các lớp do giáo viên này quản lý:
                  </p>
                  <div className="space-y-2">
                    {["Lập trình Web - KTPM01", "Cơ sở dữ liệu - KTPM02"].map(
                      (className) => (
                        <div
                          key={className}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{className}</span>
                        </div>
                      )
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Các lớp học sinh đang tham gia:
                  </p>
                  <div className="space-y-2">
                    {[
                      "Lập trình Web - KTPM01",
                      "Thuật toán - KTPM03",
                      "Mạng máy tính - KTPM04",
                    ].map((className) => (
                      <div
                        key={className}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-info" />
                        </div>
                        <span className="font-medium">{className}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-4 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Đặt lại mật khẩu</p>
                  <p className="text-sm text-muted-foreground">
                    Gửi email đặt lại mật khẩu cho người dùng
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  Gửi email
                </Button>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {user.status === "active"
                      ? "Khóa tài khoản"
                      : "Kích hoạt tài khoản"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.status === "active"
                      ? "Người dùng sẽ không thể đăng nhập"
                      : "Người dùng sẽ có thể đăng nhập lại"}
                  </p>
                </div>
                <Button
                  variant={user.status === "active" ? "destructive" : "default"}
                  onClick={handleToggleStatus}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : user.status === "active" ? (
                    <Ban className="w-4 h-4 mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  {user.status === "active" ? "Khóa" : "Kích hoạt"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
