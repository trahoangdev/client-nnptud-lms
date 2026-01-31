import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  GraduationCap,
  FileText,
  ChevronLeft,
  Menu,
  LogOut,
  BarChart3,
  Activity,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  userRole: "teacher" | "student" | "admin";
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: ("teacher" | "student" | "admin")[];
}

const navItems: NavItem[] = [
  // Teacher
  { icon: LayoutDashboard, label: "Dashboard", href: "/", roles: ["teacher"] },
  { icon: BookOpen, label: "Lớp học", href: "/classes", roles: ["teacher"] },
  // Tạm ẩn hội thoại - chưa dùng tới
  // { icon: MessageSquare, label: "Hội thoại", href: "/conversations", roles: ["teacher"] },
  { icon: Settings, label: "Cài đặt", href: "/settings", roles: ["teacher"] },
  // Student  
  { icon: LayoutDashboard, label: "Dashboard", href: "/student", roles: ["student"] },
  { icon: BookOpen, label: "Lớp học", href: "/student/classes", roles: ["student"] },
  { icon: FileText, label: "Bài tập", href: "/student/assignments", roles: ["student"] },
  { icon: Calendar, label: "Lịch deadline", href: "/student/calendar", roles: ["student"] },
  // Tạm ẩn hội thoại - chưa dùng tới
  // { icon: MessageSquare, label: "Hội thoại", href: "/student/conversations", roles: ["student"] },
  { icon: GraduationCap, label: "Điểm số", href: "/student/grades", roles: ["student"] },
  { icon: Settings, label: "Cài đặt", href: "/student/settings", roles: ["student"] },
  // Admin
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", roles: ["admin"] },
  { icon: BookOpen, label: "Quản lý Lớp học", href: "/admin/classes", roles: ["admin"] },
  { icon: Users, label: "Quản lý Users", href: "/admin/users", roles: ["admin"] },
  { icon: BarChart3, label: "Báo cáo", href: "/admin/reports", roles: ["admin"] },
  { icon: Activity, label: "Nhật ký", href: "/admin/activity", roles: ["admin"] },
  { icon: Settings, label: "Cài đặt hệ thống", href: "/admin/settings", roles: ["admin"] },
];

export function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-sidebar-foreground whitespace-nowrap">
                LMS Mini
              </h1>
              <p className="text-xs text-sidebar-muted capitalize">{userRole}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground"
                )}
              />
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Collapse button */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
          {!isCollapsed && (
            <span className="text-sm">Thu gọn</span>
          )}
        </button>

        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sidebar-muted hover:text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Đăng xuất</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar z-50 md:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden md:block fixed left-0 top-0 bottom-0 bg-sidebar z-30"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
