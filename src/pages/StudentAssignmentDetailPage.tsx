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
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLayout } from "@/components/layout";
import { FileUpload } from "@/components/FileUpload";
import { MarkdownContent } from "@/components/MarkdownContent";
import { toast } from "sonner";

// Mock data
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
  teacher: "Nguyễn Văn A",
  dueDate: "2025-01-30",
  dueTime: "23:59",
  maxScore: 10,
  allowLate: true,
  attachmentUrl: "/files/react-hooks-guide.pdf",
  attachmentName: "react-hooks-guide.pdf",
  createdAt: "2025-01-20",
};

const mySubmission = {
  id: "1",
  fileName: "",
  fileSize: "",
  submittedAt: "",
  status: "not_submitted", // not_submitted, submitted, graded, late
  score: null as number | null,
  gradedAt: "",
};

const comments = [
  {
    id: "1",
    author: "Nguyễn Văn A",
    role: "teacher",
    content: "Bài làm rất tốt! Code clean và có comment đầy đủ. Tuy nhiên cần optimize lại phần useEffect để tránh re-render không cần thiết.",
    createdAt: "2025-01-29 15:30",
  },
  {
    id: "2",
    author: "Trần Thị B",
    role: "student",
    content: "Em cảm ơn thầy ạ. Em sẽ xem lại phần useEffect và cập nhật lại code.",
    createdAt: "2025-01-29 16:00",
  },
];

export default function StudentAssignmentDetailPage() {
  const { id } = useParams();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysLeft = 2; // Calculate from dueDate
  const isOverdue = daysLeft < 0;
  const hasSubmission = mySubmission.status !== "not_submitted";
  const isGraded = mySubmission.status === "graded";

  const handleSubmit = async (file: File) => {
    setIsSubmitting(true);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Nộp bài thành công!", {
      description: `File ${file.name} đã được upload`,
    });
    setIsSubmitting(false);
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    toast.success("Đã gửi bình luận");
    setNewComment("");
  };

  return (
    <AppLayout userRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            to={`/student/classes/${assignmentData.classId}`}
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
                    <BookOpen className="w-4 h-4" />
                    {assignmentData.class}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Hạn nộp: {assignmentData.dueDate} {assignmentData.dueTime}
                  </span>
                  {assignmentData.allowLate && (
                    <Badge variant="outline" className="text-xs">
                      Cho phép nộp trễ
                    </Badge>
                  )}
                </div>
                {!isOverdue && (
                  <div className={`mt-2 text-sm font-medium ${daysLeft <= 1 ? "text-destructive" : daysLeft <= 3 ? "text-warning" : "text-muted-foreground"}`}>
                    {daysLeft <= 1 && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                    Còn {daysLeft} ngày để nộp bài
                  </div>
                )}
                {isOverdue && !hasSubmission && (
                  <div className="mt-2 text-sm font-medium text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Đã quá hạn {Math.abs(daysLeft)} ngày
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Assignment Info + Submission */}
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
                        {assignmentData.attachmentName}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Submission Area */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {hasSubmission ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        Bài đã nộp
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-warning" />
                        Nộp bài
                      </>
                    )}
                  </CardTitle>
                  {hasSubmission && (
                    <CardDescription>
                      Đã nộp lúc {mySubmission.submittedAt}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {hasSubmission ? (
                    <div className="space-y-4">
                      {/* Current submission */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-success/5 border border-success/20">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{mySubmission.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {mySubmission.fileSize} • Nộp lúc {mySubmission.submittedAt}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Tải xuống
                        </Button>
                      </div>

                      {/* Resubmit option */}
                      {!isGraded && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium mb-3">Nộp lại bài (thay thế bài cũ)</p>
                          <FileUpload
                            accept=".zip,.pdf,.docx"
                            maxSize={100}
                            onUpload={handleSubmit}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <FileUpload
                      accept=".zip,.pdf,.docx"
                      maxSize={100}
                      onUpload={handleSubmit}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Score & Comments */}
          <div className="space-y-6">
            {/* Score Display */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Kết quả</CardTitle>
                </CardHeader>
                <CardContent>
                  {isGraded ? (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success/10 mb-4">
                        <span className="text-3xl font-bold text-success">
                          {mySubmission.score}/{assignmentData.maxScore}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Đã chấm lúc {mySubmission.gradedAt}
                      </p>
                    </div>
                  ) : hasSubmission ? (
                    <div className="text-center py-6">
                      <Clock className="w-12 h-12 text-info mx-auto mb-3" />
                      <p className="font-medium">Đang chờ chấm điểm</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Giáo viên sẽ chấm điểm sớm nhất có thể
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-3" />
                      <p className="font-medium">Chưa nộp bài</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Hãy nộp bài để được chấm điểm
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Comments */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Nhận xét
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Comment list */}
                  {comments.length > 0 ? (
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
                            <p className="text-sm mt-1">{comment.content}</p>
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Chưa có nhận xét nào
                    </p>
                  )}

                  <Separator />

                  {/* New comment */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Viết bình luận..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Gửi
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
