import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api/client";
import { setToken, setStoredUser } from "@/api/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Đã đăng nhập admin -> redirect
  if (token && user) {
    const role = (user.role || "").toUpperCase();
    if (role === "ADMIN") return <Navigate to="/admin" replace />;
    // Nếu đăng nhập nhưng không phải admin, redirect về trang phù hợp
    if (role === "TEACHER") return <Navigate to="/" replace />;
    if (role === "STUDENT") return <Navigate to="/student" replace />;
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post<{ token: string; user: { id: number; name: string; email: string; role: string } }>(
        "/admin/login",
        { email: email.trim(), password }
      );
      setToken(res.token);
      setStoredUser(res.user);
      await refreshUser();
      navigate("/admin", { replace: true });
      toast.success("Đăng nhập Admin thành công");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Admin branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px)`,
            }}
          />
          <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 backdrop-blur flex items-center justify-center border border-amber-500/30">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">NNPTUD LMS</h1>
              <p className="text-amber-400/80 text-xs font-semibold tracking-widest uppercase">Administration</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Bảng điều khiển<br />Quản trị viên
            </h2>
            <p className="text-slate-400 mt-4 text-lg max-w-md">
              Quản lý người dùng, lớp học, cài đặt hệ thống và giám sát hoạt động
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 max-w-md"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-amber-200/80 text-sm">
              Khu vực dành riêng cho quản trị viên. Truy cập trái phép sẽ được ghi nhận.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-600 text-sm">© {new Date().getFullYear()} NNPTUD LMS. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Admin login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Shield className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">NNPTUD LMS</h1>
              <p className="text-amber-500 text-xs font-semibold tracking-widest uppercase">Admin</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                <Shield className="w-7 h-7 text-amber-500" />
              </div>
              <CardTitle className="text-2xl">Đăng nhập Admin</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">Nhập thông tin quản trị viên để tiếp tục</p>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@nnptud.edu.vn"
                      className={cn("pl-10", errors.email && "border-destructive focus-visible:ring-destructive")}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
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

                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" size="lg" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 ml-2" />
                  )}
                  Đăng nhập
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  Không phải quản trị viên?{" "}
                  <a href="/login" className="text-primary hover:underline font-medium">
                    Đăng nhập Sinh viên / Giảng viên
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
