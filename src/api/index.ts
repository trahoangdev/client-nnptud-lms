export { api, apiUpload, getToken, setToken, clearToken, getStoredUser, setStoredUser, clearStoredUser } from "./client";

// Types trùng với server response
export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

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

export interface ClassDetailItem extends ClassItem {
  members?: { id: number; userId: number; user: { id: number; name: string; email: string } }[];
  assignments?: AssignmentItem[];
}

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

export interface GradeItem {
  id: number;
  submissionId: number;
  score: number;
  gradedAt: string;
}

export interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  user?: { id: number; name: string; role: string };
  submissionId?: number | null;
  assignmentId?: number | null;
}

/** Response from GET /student/assignments */
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
