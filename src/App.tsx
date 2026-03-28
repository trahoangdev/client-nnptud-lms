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
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomeOrDashboard } from "@/components/HomeOrDashboard";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UsersManagementPage = lazy(() => import("./pages/UsersManagementPage"));
const ClassesManagementPage = lazy(() => import("./pages/ClassesManagementPage"));
const AdminSettingsPage = lazy(() => import("./pages/AdminSettingsPage"));
const AdminReportsPage = lazy(() => import("./pages/AdminReportsPage"));
const AdminActivityLogPage = lazy(() => import("./pages/AdminActivityLogPage"));
const ClassDetail = lazy(() => import("./pages/ClassDetail"));
const ClassesPage = lazy(() => import("./pages/ClassesPage"));
const AssignmentDetail = lazy(() => import("./pages/AssignmentDetail"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const StudentClassesPage = lazy(() => import("./pages/StudentClassesPage"));
const StudentClassDetailPage = lazy(() => import("./pages/StudentClassDetailPage"));
const StudentAssignmentsPage = lazy(() => import("./pages/StudentAssignmentsPage"));
const StudentAssignmentDetailPage = lazy(() => import("./pages/StudentAssignmentDetailPage"));
const StudentGradesPage = lazy(() => import("./pages/StudentGradesPage"));
const StudentSettingsPage = lazy(() => import("./pages/StudentSettingsPage"));
const StudentCalendarPage = lazy(() => import("./pages/StudentCalendarPage"));
const TeacherConversationsPage = lazy(() => import("./pages/TeacherConversationsPage"));
const StudentConversationsPage = lazy(() => import("./pages/StudentConversationsPage"));
const TeacherCalendarPage = lazy(() => import("./pages/TeacherCalendarPage"));

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
          <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

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
          </Suspense>
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
