import { Bell, Search, LogOut, Settings, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

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
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Search */}
        <div className="flex-1 max-w-md ml-12 md:ml-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm lớp học, bài tập..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <span className="font-medium">Bài tập mới</span>
                  <span className="text-sm text-muted-foreground">
                    Giáo viên vừa giao bài "React Hooks" - Hạn nộp: 3 ngày
                  </span>
                  <span className="text-xs text-muted-foreground">5 phút trước</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <span className="font-medium">Điểm mới</span>
                  <span className="text-sm text-muted-foreground">
                    Bài "TypeScript Basics" đã được chấm điểm: 9/10
                  </span>
                  <span className="text-xs text-muted-foreground">1 giờ trước</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <span className="font-medium">Comment mới</span>
                  <span className="text-sm text-muted-foreground">
                    Giáo viên đã bình luận về bài nộp của bạn
                  </span>
                  <span className="text-xs text-muted-foreground">2 giờ trước</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
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
