import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
  /** Nếu không truyền thì lấy từ useAuth (user.role) */
  userRole?: "teacher" | "student" | "admin";
}

export function AppLayout({ children, userRole: propUserRole }: AppLayoutProps) {
  const { user } = useAuth();
  const userRole = propUserRole ?? (user?.role?.toLowerCase() as "teacher" | "student" | "admin" | undefined) ?? "teacher";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(prev => !prev)} />
      <div
        className="flex-1 flex flex-col transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: isMobile ? 0 : (isCollapsed ? 80 : 256) }}
      >
        <Header userRole={userRole} userName={user?.name} userEmail={user?.email} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
