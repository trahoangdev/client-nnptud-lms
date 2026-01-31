import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Chỉ cho phép các role này (teacher = TEACHER, student = STUDENT, admin = ADMIN) */
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = (user.role || "").toUpperCase();
  if (allowedRoles && allowedRoles.length > 0) {
    const allowed = allowedRoles.map((r) => r.toUpperCase());
    if (!allowed.includes(role)) {
      // Redirect về dashboard theo role
      if (role === "TEACHER") return <Navigate to="/" replace />;
      if (role === "STUDENT") return <Navigate to="/student" replace />;
      if (role === "ADMIN") return <Navigate to="/admin" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
