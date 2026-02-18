import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomeOrDashboard } from "@/components/HomeOrDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UsersManagementPage from "./pages/UsersManagementPage";
import ClassesManagementPage from "./pages/ClassesManagementPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminActivityLogPage from "./pages/AdminActivityLogPage";
import ClassDetail from "./pages/ClassDetail";
import ClassesPage from "./pages/ClassesPage";
import AssignmentDetail from "./pages/AssignmentDetail";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import StudentClassesPage from "./pages/StudentClassesPage";
import StudentClassDetailPage from "./pages/StudentClassDetailPage";
import StudentAssignmentsPage from "./pages/StudentAssignmentsPage";
import StudentAssignmentDetailPage from "./pages/StudentAssignmentDetailPage";
import StudentGradesPage from "./pages/StudentGradesPage";
import StudentSettingsPage from "./pages/StudentSettingsPage";
import StudentCalendarPage from "./pages/StudentCalendarPage";
import TeacherConversationsPage from "./pages/TeacherConversationsPage";
import StudentConversationsPage from "./pages/StudentConversationsPage";
import TeacherCalendarPage from "./pages/TeacherCalendarPage";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
          <NotificationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Trang chủ: Landing khi chưa đăng nhập, Dashboard theo vai trò khi đã đăng nhập */}
            <Route path="/" element={<HomeOrDashboard />} />
            <Route
              path="/classes"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <ClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes/:id"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <ClassDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/:id"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <AssignmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conversations"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherConversationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherCalendarPage />
                </ProtectedRoute>
              }
            />

            {/* Student */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/classes"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/classes/:id"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentClassDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentAssignmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments/:id"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentAssignmentDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/grades"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentGradesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/calendar"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/conversations"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentConversationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UsersManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ClassesManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activity"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminActivityLogPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
