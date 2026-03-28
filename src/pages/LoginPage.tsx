import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type LoginRole = "STUDENT" | "TEACHER";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; role?: string }>({});
  const { login, logout, user, token } = useAuth();
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Đã đăng nhập -> redirect theo role
  if (token && user) {
    const role = (user.role || "").toUpperCase();
    if (role === "TEACHER") return <Navigate to="/" replace />;
    if (role === "STUDENT") return <Navigate to="/student" replace />;
    if (role === "ADMIN") return <Navigate to="/admin" replace />;
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; role?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!selectedRole) {
      newErrors.role = "Vui lòng chọn tư cách đăng nhập";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const { role } = await login(email.trim(), password);
      const r = (role || "").toUpperCase();
      if (r === "ADMIN") {
        logout();
        toast.error("Tài khoản Admin vui lòng đăng nhập tại trang quản trị.");
        setIsSubmitting(false);
        return;
      }
      const roleMatches = r === selectedRole;
      if (!roleMatches) {
        logout();
        toast.error(
          selectedRole === "TEACHER"
            ? "Tài khoản này không phải Giảng viên. Vui lòng chọn đăng nhập với tư cách Sinh viên."
            : "Tài khoản này không phải Sinh viên. Vui lòng chọn đăng nhập với tư cách Giảng viên."
        );
        setIsSubmitting(false);
        return;
      }
      if (r === "TEACHER") navigate("/", { replace: true });
      else if (r === "STUDENT") navigate("/student", { replace: true });
      else navigate("/", { replace: true });
      toast.success("Đăng nhập thành công");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(222,47%,11%)] via-[hsl(234,60%,25%)] to-primary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground">NNPTUD LMS</h1>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
              Nền tảng quản lý<br />bài tập hiệu quả
            </h2>
            <p className="text-primary-foreground/70 mt-4 text-lg max-w-md">
              Giao bài, nộp bài, chấm điểm và theo dõi tiến độ theo thời gian thực
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 max-w-md"
          >
            <div className="bg-primary-foreground/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold text-primary-foreground">500+</p>
              <p className="text-primary-foreground/60 text-sm">Giáo viên</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold text-primary-foreground">10K+</p>
              <p className="text-primary-foreground/60 text-sm">Học sinh</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold text-primary-foreground">50K+</p>
              <p className="text-primary-foreground/60 text-sm">Bài tập</p>
            </div>
          </motion.div>
        </div>
        <div className="relative z-10">
          <p className="text-primary-foreground/50 text-sm">© {new Date().getFullYear()} NNPTUD LMS. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">NNPTUD LMS</h1>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Đăng nhập</CardTitle>
              <CardDescription>Nhập email và mật khẩu để tiếp tục</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@nnptud.edu.vn"
                      className={cn("pl-10", errors.email && "border-destructive focus-visible:ring-destructive")}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={cn("pl-10 pr-10", errors.password && "border-destructive focus-visible:ring-destructive")}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Đăng nhập với tư cách</Label>
                  {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={selectedRole === "STUDENT" ? "default" : "outline"}
                      size="lg"
                      className={cn(
                        "h-12 gap-2",
                        selectedRole === "STUDENT" && "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => { setSelectedRole("STUDENT"); if (errors.role) setErrors(prev => ({ ...prev, role: undefined })); }}
                      disabled={isSubmitting}
                    >
                      <User className="w-4 h-4" />
                      Sinh viên
                    </Button>
                    <Button
                      type="button"
                      variant={selectedRole === "TEACHER" ? "default" : "outline"}
                      size="lg"
                      className={cn(
                        "h-12 gap-2",
                        selectedRole === "TEACHER" && "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => { setSelectedRole("TEACHER"); if (errors.role) setErrors(prev => ({ ...prev, role: undefined })); }}
                      disabled={isSubmitting}
                    >
                      <BookOpen className="w-4 h-4" />
                      Giảng viên
                    </Button>
                  </div>
                </div>

                <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 ml-2" />
                  )}
                  Đăng nhập
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t space-y-3 text-center">
                {/* <p className="text-xs text-muted-foreground">
                  Sau khi chạy <code className="bg-muted px-1 rounded">npm run seed</code> trên server, thử:{" "}
                  <span className="font-mono text-foreground">student@nnptud.edu.vn</span> / <span className="font-mono text-foreground">password123</span>
                </p> */}
                <p className="text-sm text-muted-foreground">
                  Học sinh mới? Vào mục <strong>Lớp học</strong> → <strong>Tham gia lớp</strong> và nhập mã lớp.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
