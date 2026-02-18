/**
 * Shared TypeScript types — mirrors server response shapes.
 * Extracted from api/index.ts for reuse across services and pages.
 */

// ================== ENUMS ==================

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";
export type UserStatus = "ACTIVE" | "INACTIVE";
export type ClassStatus = "ACTIVE" | "ARCHIVED";
export type SubmissionStatus = "SUBMITTED" | "LATE_SUBMITTED" | "GRADED";

// ================== AUTH / USER ==================

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
}

export interface UserProfile extends AuthUser {
  status: UserStatus;
  createdAt: string;
}

// ================== CLASS ==================

export interface ClassItem {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  status?: string;
  teacherId: number;
  teacher?: { id: number; name: string };
  students?: number;
  assignments?: number;
  _count?: { members: number; assignments: number };
}

export interface ClassDetailItem extends Omit<ClassItem, "assignments"> {
  members?: { id: number; userId: number; user: { id: number; name: string; email: string } }[];
  assignments?: AssignmentItem[];
}

// ================== ASSIGNMENT ==================

export interface AssignmentItem {
  id: number;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  dueDate?: string | null;
  startTime?: string | null;
  allowLate?: boolean;
  maxScore?: number;
  classId: number;
  _count?: { submissions: number };
}

// ================== SUBMISSION ==================

export interface SubmissionItem {
  id: number;
  assignmentId: number;
  studentId: number;
  fileUrl?: string | null;
  content?: string | null;
  submittedAt: string;
  lastUpdatedAt?: string | null;
  status: string;
  student?: { id: number; name: string; email: string };
  grade?: { id: number; score: number; gradedAt: string } | null;
}

// ================== GRADE ==================

export interface GradeItem {
  id: number;
  submissionId: number;
  score: number;
  gradedAt: string;
}

// ================== COMMENT ==================

export interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  user?: { id: number; name: string; role: string };
  submissionId?: number | null;
  assignmentId?: number | null;
}

// ================== STUDENT ASSIGNMENT VIEW ==================

export interface StudentAssignmentWithSubmission {
  assignment: {
    id: number;
    title: string;
    description?: string | null;
    fileUrl?: string | null;
    dueDate?: string | null;
    allowLate?: boolean;
    maxScore?: number;
    classId: number;
  };
  class: { id: number; name: string };
  mySubmission: SubmissionItem | null;
}

// ================== ADMIN ==================

export interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalAssignments: number;
  activeUsers: number;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  userId: string | null;
  userName: string;
  userRole: string;
  action: string;
  actionType: string;
  resource: string;
  resourceId: string | null;
  details: string;
  ipAddress: string;
  status: string;
}

export interface ActivityLogsResponse {
  logs: ActivityLogItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminSettings {
  system: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    maxFileSize: number;
    maxStoragePerClass: number;
    sessionTimeout: number;
    maintenanceMode: boolean;
  };
  security: {
    twoFactorRequired: boolean;
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireNumber: boolean;
    passwordRequireSpecial: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
    sessionConcurrent: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpSecure: string;
    fromName: string;
    fromEmail: string;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    backupRetention: number;
    backupLocation: string;
  };
  notifications: {
    notifyNewUser: boolean;
    notifyNewClass: boolean;
    notifyStorageWarning: boolean;
    notifySecurityAlert: boolean;
    dailyReport: boolean;
    weeklyReport: boolean;
  };
}

export interface GradeDistribution {
  distribution: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
    poor: number;
  };
  total: number;
  average: number;
  averagePercentage: number;
  percentages: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
    poor: number;
  };
}

export interface SubmissionReport {
  total: number;
  onTime: number;
  late: number;
  missing: number;
}

// ================== PAGINATION ==================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ================== NOTIFICATIONS ==================

export interface NotificationItem {
  id: number;
  userId: number;
  type: "submission" | "grade" | "comment" | "assignment" | "system";
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

// ================== GRADEBOOK ==================

export interface GradebookAssignment {
  id: number;
  title: string;
  maxScore: number;
  dueDate: string | null;
}

export interface GradebookCell {
  assignmentId: number;
  submitted: boolean;
  status: string;
  submittedAt: string | null;
  score: number | null;
  graded: boolean;
  submissionId: number | null;
}

export interface GradebookStudent {
  studentId: number;
  studentName: string;
  studentEmail: string;
  grades: GradebookCell[];
}

export interface GradebookData {
  classId: number;
  assignments: GradebookAssignment[];
  students: GradebookStudent[];
  stats: {
    totalStudents: number;
    totalAssignments: number;
    submissionRate: number;
    gradingRate: number;
    lateSubmissions: number;
  };
}

// ================== DASHBOARD STATS ==================

export interface TeacherAssignmentStat {
  id: number;
  title: string;
  maxScore: number;
  dueDate: string | null;
  submissionCount: number;
  totalStudents: number;
  submissionRate: number;
}

export interface TeacherClassStat {
  classId: number;
  className: string;
  totalStudents: number;
  totalAssignments: number;
  assignments: TeacherAssignmentStat[];
}

export interface RecentSubmission {
  id: number;
  studentName: string;
  assignmentTitle: string;
  className: string;
  classId: number;
  assignmentId: number;
  status: string;
  submittedAt: string;
}

export interface TeacherDashboardStats {
  classStats: TeacherClassStat[];
  pendingGrading: number;
  totalGraded: number;
  recentSubmissions: RecentSubmission[];
}

export interface StudentDashboardStats {
  totalClasses: number;
  totalAssignments: number;
  submittedCount: number;
  gradedCount: number;
  lateCount: number;
  avgScore: number | null;
  submissionRate: number;
  dueSoon: { id: number; title: string; dueDate: string; classId: number }[];
  classGrades: {
    classId: number;
    className: string;
    avgScore: number | null;
    assignmentsTotal: number;
    submitted: number;
    graded: number;
  }[];
}
