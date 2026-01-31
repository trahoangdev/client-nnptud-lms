import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileText,
  MessageSquare,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  score: z.number().min(0, "Điểm không thể âm"),
  feedback: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Submission {
  id: string;
  studentName: string;
  studentId: string;
  studentEmail?: string;
  submittedAt: string | null;
  status: "submitted" | "late" | "not_submitted";
  fileUrl: string | null;
  fileName?: string;
  fileSize?: string;
  score: number | null;
  graded: boolean;
  feedback?: string;
}

interface Comment {
  id: string;
  author: string;
  role: "teacher" | "student";
  content: string;
  createdAt: string;
}

interface GradeSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission | null;
  assignmentTitle: string;
  maxScore: number;
  comments?: Comment[];
  onSuccess?: (data: { submissionId: string; score: number; feedback?: string }) => void;
}

export function GradeSubmissionModal({
  open,
  onOpenChange,
  submission,
  assignmentTitle,
  maxScore,
  comments = [],
  onSuccess,
}: GradeSubmissionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema.refine((data) => data.score <= maxScore, {
      message: `Điểm không thể vượt quá ${maxScore}`,
      path: ["score"],
    })),
    defaultValues: {
      score: submission?.score ?? 0,
      feedback: submission?.feedback ?? "",
    },
  });

  // Reset form when submission changes
  if (submission && form.getValues("score") !== (submission.score ?? 0)) {
    form.reset({
      score: submission.score ?? 0,
      feedback: submission.feedback ?? "",
    });
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-success/10 text-success border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Đã nộp đúng hạn
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-warning/10 text-warning border-0">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Nộp trễ
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Chưa nộp
          </Badge>
        );
    }
  };

  const getScoreColor = (score: number) => {
    const percent = (score / maxScore) * 100;
    if (percent >= 80) return "text-success";
    if (percent >= 60) return "text-warning";
    return "text-destructive";
  };

  const onSubmit = async (values: FormValues) => {
    if (!submission) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Chấm điểm thành công!", {
      description: `${submission.studentName}: ${values.score}/${maxScore}`,
    });
    
    onSuccess?.({
      submissionId: submission.id,
      score: values.score,
      feedback: values.feedback,
    });
    
    setIsLoading(false);
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    
    toast.success("Đã gửi nhận xét");
    setNewComment("");
  };

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle>Chấm điểm bài nộp</DialogTitle>
              <DialogDescription>{assignmentTitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-200px)] pr-4">
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {submission.studentName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{submission.studentName}</p>
                    <p className="text-sm text-muted-foreground">{submission.studentId}</p>
                    {submission.studentEmail && (
                      <p className="text-xs text-muted-foreground">{submission.studentEmail}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(submission.status)}
                  {submission.submittedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {submission.submittedAt}
                    </p>
                  )}
                </div>
              </div>

              {/* Submission File */}
              {submission.fileUrl && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">File bài nộp</h4>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {submission.fileName || `${submission.studentName.replace(/\s/g, '')}_${submission.studentId}.zip`}
                      </p>
                      {submission.fileSize && (
                        <p className="text-xs text-muted-foreground">{submission.fileSize}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Tải về
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              {/* Grading Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Điểm số</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              min={0}
                              max={maxScore}
                              step={0.5}
                              className={cn(
                                "w-24 h-12 text-center text-2xl font-bold",
                                field.value !== null && getScoreColor(field.value)
                              )}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-xl text-muted-foreground">/ {maxScore}</span>
                            
                            {/* Quick score buttons */}
                            <div className="flex-1 flex gap-1 flex-wrap">
                              {[maxScore, maxScore * 0.8, maxScore * 0.6, maxScore * 0.5, 0].map((score) => (
                                <Button
                                  key={score}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "h-8 px-3",
                                    field.value === score && "bg-primary text-primary-foreground"
                                  )}
                                  onClick={() => field.onChange(score)}
                                >
                                  {score}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nhận xét chung</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Viết nhận xét về bài làm của học sinh..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {submission.graded ? "Cập nhật điểm" : "Lưu điểm"}
                  </Button>
                </form>
              </Form>

              <Separator />

              {/* Comments Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Trao đổi ({comments.length})
                </h4>

                {comments.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback
                            className={cn(
                              "text-xs",
                              comment.role === "teacher"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            {comment.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
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
                )}

                {/* New comment input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Viết nhận xét..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none flex-1"
                    rows={2}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleSendComment}
                    disabled={!newComment.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
