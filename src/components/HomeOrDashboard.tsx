import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import TeacherDashboard from "@/pages/TeacherDashboard";
import LandingPage from "@/pages/LandingPage";
import { Loader2 } from "lucide-react";

/**
 * Route "/": hiển thị Landing khi chưa đăng nhập;
 * khi đã đăng nhập: Teacher → Dashboard, Student/Admin → redirect về /student hoặc /admin.
 */
export function HomeOrDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (user.role === "TEACHER") {
    return <TeacherDashboard />;
  }

  if (user.role === "STUDENT") {
    return <Navigate to="/student" replace />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <LandingPage />;
}
