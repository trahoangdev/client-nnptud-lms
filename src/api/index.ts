export { api, apiUpload, getToken, setToken, clearToken, getStoredUser, setStoredUser, clearStoredUser } from "./client";

// Re-export types from dedicated types file (backward compatible)
export type {
  UserRole,
  AuthUser,
  ClassItem,
  ClassDetailItem,
  AssignmentItem,
  SubmissionItem,
  GradeItem,
  CommentItem,
  StudentAssignmentWithSubmission,
  AdminStats,
  ActivityLogItem,
  ActivityLogsResponse,
  AdminSettings,
  GradeDistribution,
  SubmissionReport,
  PaginatedResponse,
  UserProfile,
} from "./types";

// Re-export services for convenient access
export {
  authService,
  classesService,
  assignmentsService,
  submissionsService,
  gradesService,
  commentsService,
  uploadService,
  adminService,
} from "./services";

