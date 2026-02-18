import { LogOut, Settings, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ModeToggle } from "@/components/ModeToggle";

interface HeaderProps {
  userRole: "teacher" | "student" | "admin";
  userName?: string | null;
  userEmail?: string | null;
}

export function Header({ userRole, userName: propUserName, userEmail: propUserEmail }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userName = propUserName ?? user?.name ?? (userRole === "teacher" ? "Giảng viên" : userRole === "student" ? "Sinh viên" : "Admin");
  const userEmail = propUserEmail ?? user?.email ?? "";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const dashboardPath = userRole === "teacher" ? "/" : userRole === "student" ? "/student" : "/admin";
  const settingsPath = userRole === "teacher" ? "/settings" : userRole === "student" ? "/student/settings" : "/admin/settings";

  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-end h-16 px-4 md:px-6">
        {/* Right section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme toggle */}
          <ModeToggle />

          {/* Notifications */}
          <NotificationCenter />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar ?? ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{userName}</span>
                  <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userName}</span>
                  <span className="text-sm font-normal text-muted-foreground">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={dashboardPath}>
                  <Home className="w-4 h-4 mr-2" />
                  Trang chủ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={settingsPath}>
                  <Settings className="w-4 h-4 mr-2" />
                  Cài đặt
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
