import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Send,
  Calendar,
  Filter,
  Search,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout";
import { GradeSubmissionModal } from "@/components/modals";
import { MarkdownContent } from "@/components/MarkdownContent";
import { cn } from "@/lib/utils";

// Mock data - Teacher view
const assignmentData = {
  id: "1",
  title: "Bài tập React Hooks",
  description: `## Mục tiêu
Nắm vững cách sử dụng các React Hooks cơ bản: useState, useEffect, useContext.

## Yêu cầu
1. Tạo một ứng dụng Todo List sử dụng useState
2. Fetch dữ liệu từ API bằng useEffect
3. Sử dụng useContext để quản lý theme

### Ví dụ code useState

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

### Ví dụ code useEffect

\`\`\`javascript
useEffect(() => {
  // Fetch data từ API
  fetch('https://api.example.com/data')
    .then(res => res.json())
    .then(data => setData(data));
}, []); // Empty dependency array = chỉ chạy 1 lần
\`\`\`

## Nộp bài
- File nén \`.zip\` chứa source code
- Đặt tên theo format: \`HoTen_MSSV.zip\``,
  class: "Lập trình Web - KTPM01",
  classId: "1",
  dueDate: "2025-01-30",
  dueTime: "23:59",
  maxScore: 10,
  allowLate: true,
  attachmentUrl: "/files/react-hooks-guide.pdf",
  createdAt: "2025-01-20",
  submissions: {
    total: 32,
    submitted: 28,
    late: 3,
    graded: 15,
  },
};

const submissionsList = [
  {
    id: "1",
    studentName: "Trần Văn B",
    studentId: "20200001",
    studentEmail: "tranvanb@email.com",
    submittedAt: "2025-01-28 14:30",
    status: "submitted" as const,
    fileUrl: "/files/TranVanB_20200001.zip",
    fileName: "TranVanB_20200001.zip",
    fileSize: "2.5 MB",
    score: 9,
    graded: true,
    feedback: "Bài làm tốt, code clean!",
  },
  {
    id: "2",
    studentName: "Lê Thị C",
    studentId: "20200002",
    studentEmail: "lethic@email.com",
    submittedAt: "2025-01-29 10:15",
    status: "submitted" as const,
    fileUrl: "/files/LeThiC_20200002.zip",
    fileName: "LeThiC_20200002.zip",
    fileSize: "1.8 MB",
    score: null,
    graded: false,
  },
  {
    id: "3",
    studentName: "Nguyễn Văn D",
    studentId: "20200003",
    studentEmail: "nguyenvand@email.com",
    submittedAt: "2025-01-31 02:30",
    status: "late" as const,
    fileUrl: "/files/NguyenVanD_20200003.zip",
    fileName: "NguyenVanD_20200003.zip",
    fileSize: "3.1 MB",
    score: 7,
    graded: true,
    feedback: "Nộp trễ, trừ 1 điểm. Cần cải thiện phần useEffect.",
  },
  {
    id: "4",
    studentName: "Phạm Thị E",
    studentId: "20200004",
    studentEmail: "phamthie@email.com",
    submittedAt: null,
    status: "not_submitted" as const,
    fileUrl: null,
    score: null,
    graded: false,
  },
  {
    id: "5",
    studentName: "Hoàng Văn F",
    studentId: "20200005",
    studentEmail: "hoangvanf@email.com",
    submittedAt: "2025-01-27 20:45",
    status: "submitted" as const,
    fileUrl: "/files/HoangVanF_20200005.zip",
    fileName: "HoangVanF_20200005.zip",
    fileSize: "2.2 MB",
    score: 8.5,
    graded: true,
    feedback: "Tốt! Cần thêm comments cho code.",
  },
];

const comments = [
  {
    id: "1",
    author: "Nguyễn Văn A",
    role: "teacher" as const,
    content: "Bài làm rất tốt! Code clean và có comment đầy đủ. Tuy nhiên cần optimize lại phần useEffect để tránh re-render không cần thiết.",
    createdAt: "2025-01-29 15:30",
  },
  {
    id: "2",
    author: "Trần Văn B",
    role: "student" as const,
    content: "Em cảm ơn thầy ạ. Em sẽ xem lại phần useEffect và cập nhật lại code.",
    createdAt: "2025-01-29 16:00",
  },
];

export default function AssignmentDetail() {
  const { id } = useParams();
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>("2");
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-success/10 text-success border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Đã nộp
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-warning/10 text-warning border-0">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Trễ hạn
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Chưa nộp
          </Badge>
        );
    }
  };

  // Filter submissions
  const filteredSubmissions = submissionsList.filter(submission => {
    const matchesSearch = submission.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          submission.studentId.includes(searchQuery);
    
    if (!matchesSearch) return false;
    
    switch (submissionFilter) {
      case "graded":
        return submission.graded;
      case "pending":
        return submission.status !== "not_submitted" && !submission.graded;
      case "late":
        return submission.status === "late";
      case "not_submitted":
        return submission.status === "not_submitted";
      default:
        return true;
    }
  });

  const selectedSubmissionData = submissionsList.find(s => s.id === selectedSubmission);

  // Stats
  const stats = {
    avgScore: submissionsList.filter(s => s.graded).reduce((sum, s) => sum + (s.score || 0), 0) / 
              submissionsList.filter(s => s.graded).length || 0,
    highScore: Math.max(...submissionsList.filter(s => s.graded).map(s => s.score || 0)),
    lowScore: Math.min(...submissionsList.filter(s => s.graded && s.score !== null).map(s => s.score || 0)),
  };

  return (
    <AppLayout userRole="teacher">
      {/* Grade Modal */}
      <GradeSubmissionModal
        open={showGradeModal}
        onOpenChange={setShowGradeModal}
        submission={selectedSubmissionData || null}
        assignmentTitle={assignmentData.title}
        maxScore={assignmentData.maxScore}
        comments={comments}
        onSuccess={(data) => {
          console.log("Graded:", data);
          setShowGradeModal(false);
        }}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            to={`/classes/${assignmentData.classId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại {assignmentData.class}
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <FileText className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{assignmentData.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Hạn nộp: {assignmentData.dueDate} {assignmentData.dueTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Điểm tối đa: {assignmentData.maxScore}
                  </span>
                  {assignmentData.allowLate && (
                    <Badge variant="outline" className="text-xs">
                      Cho phép nộp trễ
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats Summary */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{assignmentData.submissions.submitted}/{assignmentData.submissions.total}</p>
                <p className="text-xs text-muted-foreground">Đã nộp</p>
              </div>
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{assignmentData.submissions.graded}</p>
                <p className="text-xs text-muted-foreground">Đã chấm</p>
              </div>
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.avgScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Điểm TB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tiến độ chấm điểm</span>
              <span className="text-sm text-muted-foreground">
                {assignmentData.submissions.graded}/{assignmentData.submissions.submitted} bài đã chấm
              </span>
            </div>
            <Progress 
              value={(assignmentData.submissions.graded / assignmentData.submissions.submitted) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Assignment Info + Submissions List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Nội dung bài tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownContent content={assignmentData.description} />
                  {assignmentData.attachmentUrl && (
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">File đính kèm</p>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        react-hooks-guide.pdf
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Submissions List */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Danh sách bài nộp</CardTitle>
                      <CardDescription>
                        {filteredSubmissions.length} học sinh
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Tìm học sinh..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-40"
                        />
                      </div>
                      
                      {/* Filter */}
                      <Select value={submissionFilter} onValueChange={setSubmissionFilter}>
                        <SelectTrigger className="w-36">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="pending">Chờ chấm</SelectItem>
                          <SelectItem value="graded">Đã chấm</SelectItem>
                          <SelectItem value="late">Nộp trễ</SelectItem>
                          <SelectItem value="not_submitted">Chưa nộp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          onClick={() => {
                            setSelectedSubmission(submission.id);
                            if (submission.status !== "not_submitted") {
                              setShowGradeModal(true);
                            }
                          }}
                          className={cn(
                            "flex items-center justify-between p-4 cursor-pointer transition-colors",
                            selectedSubmission === submission.id
                              ? "bg-accent"
                              : "hover:bg-muted/50",
                            submission.status === "not_submitted" && "opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {submission.studentName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{submission.studentName}</p>
                              <p className="text-xs text-muted-foreground">
                                {submission.studentId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {submission.submittedAt && (
                              <span className="text-xs text-muted-foreground hidden md:block">
                                {submission.submittedAt}
                              </span>
                            )}
                            {getStatusBadge(submission.status)}
                            {submission.graded && (
                              <span className={cn(
                                "font-bold min-w-[50px] text-right",
                                (submission.score || 0) >= 8 ? "text-success" :
                                (submission.score || 0) >= 6 ? "text-warning" : "text-destructive"
                              )}>
                                {submission.score}/{assignmentData.maxScore}
                              </span>
                            )}
                            {!submission.graded && submission.status !== "not_submitted" && (
                              <Button size="sm" variant="outline">
                                Chấm điểm
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        Không tìm thấy bài nộp nào
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Quick Stats & Recent Comments */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Thống kê
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-success">{stats.highScore}</p>
                      <p className="text-xs text-muted-foreground">Cao nhất</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-primary">{stats.avgScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Trung bình</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-destructive">{stats.lowScore}</p>
                      <p className="text-xs text-muted-foreground">Thấp nhất</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Đã nộp đúng hạn</span>
                      <span className="font-medium">
                        {submissionsList.filter(s => s.status === "submitted").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nộp trễ</span>
                      <span className="font-medium text-warning">
                        {submissionsList.filter(s => s.status === "late").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Chưa nộp</span>
                      <span className="font-medium text-destructive">
                        {submissionsList.filter(s => s.status === "not_submitted").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Comments */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Nhận xét gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Comment list */}
                  <div className="space-y-4 max-h-64 overflow-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className={comment.role === "teacher" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                            {comment.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.author}</span>
                            {comment.role === "teacher" && (
                              <Badge variant="secondary" className="text-xs py-0">
                                Giáo viên
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mt-1 line-clamp-2">{comment.content}</p>
                          <span className="text-xs text-muted-foreground">
                            {comment.createdAt}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Quick comment */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Viết nhận xét chung..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                    <Button 
                      className="w-full" 
                      size="sm"
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Gửi nhận xét
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
