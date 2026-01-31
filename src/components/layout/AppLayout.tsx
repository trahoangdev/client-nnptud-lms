import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
  /** Nếu không truyền thì lấy từ useAuth (user.role) */
  userRole?: "teacher" | "student" | "admin";
}

export function AppLayout({ children, userRole: propUserRole }: AppLayoutProps) {
  const { user } = useAuth();
  const userRole = propUserRole ?? (user?.role?.toLowerCase() as "teacher" | "student" | "admin" | undefined) ?? "teacher";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header userRole={userRole} userName={user?.name} userEmail={user?.email} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
