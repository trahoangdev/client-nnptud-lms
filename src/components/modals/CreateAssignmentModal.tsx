import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Loader2, CalendarIcon, Upload, X, File, Eye, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/MarkdownContent";
import { MarkdownToolbar } from "@/components/MarkdownToolbar";

const formSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự").max(200),
  description: z.string().max(5000).optional(),
  dueDate: z.date({ required_error: "Vui lòng chọn ngày hết hạn" }),
  dueTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Thời gian không hợp lệ"),
  maxScore: z.number().min(1).max(100).default(10),
  allowLate: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId?: string;
  className?: string;
  onSuccess?: (assignmentData: FormValues) => void;
}

export function CreateAssignmentModal({ 
  open, 
  onOpenChange, 
  classId,
  className,
  onSuccess 
}: CreateAssignmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [descriptionTab, setDescriptionTab] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dueTime: "23:59",
      maxScore: 10,
      allowLate: false,
    },
  });

  const descriptionValue = form.watch("description") || "";

  // Keyboard shortcuts handler for markdown formatting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    
    if (isCtrlOrCmd && e.key === "b") {
      e.preventDefault();
      insertMarkdownFormat("**", "**");
    } else if (isCtrlOrCmd && e.key === "i") {
      e.preventDefault();
      insertMarkdownFormat("*", "*");
    } else if (isCtrlOrCmd && e.key === "k") {
      e.preventDefault();
      insertMarkdownFormat("[", "](url)");
    }
  };

  const insertMarkdownFormat = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = form.getValues("description") || "";
    const selectedText = value.substring(start, end);
    
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    
    const newText = selectedText
      ? `${beforeText}${prefix}${selectedText}${suffix}${afterText}`
      : `${beforeText}${prefix}text${suffix}${afterText}`;
    
    form.setValue("description", newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(end + prefix.length + suffix.length, end + prefix.length + suffix.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + 4); // Select "text"
      }
    }, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File quá lớn", {
          description: "Kích thước file tối đa là 20MB",
        });
        return;
      }
      // Check file type
      const allowedTypes = [".pdf", ".docx", ".pptx", ".zip"];
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!allowedTypes.includes(ext)) {
        toast.error("Định dạng không hỗ trợ", {
          description: "Chỉ hỗ trợ file PDF, DOCX, PPTX, ZIP",
        });
        return;
      }
      setAttachedFile(file);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  const onSubmit = async (values: FormValues) => {
    if (!classId) {
      toast.error("Chưa chọn lớp");
      return;
    }
    setIsLoading(true);
    try {
      let fileUrl: string | undefined;
      if (attachedFile) {
        const { apiUpload } = await import("@/api/client");
        const formData = new FormData();
        formData.append("file", attachedFile);
        const res = await apiUpload("/upload", formData);
        fileUrl = (res as { fileUrl?: string }).fileUrl;
      }
      const dueDateTime = new Date(values.dueDate);
      const [h, m] = values.dueTime.split(":").map(Number);
      dueDateTime.setHours(h, m, 0, 0);

      await import("@/api/client").then((m) =>
        m.api.post("/assignments", {
          classId: Number(classId),
          title: values.title,
          description: values.description || undefined,
          fileUrl,
          dueDate: dueDateTime.toISOString(),
          allowLate: values.allowLate,
          maxScore: values.maxScore,
        })
      );
      toast.success("Tạo bài tập thành công!", {
        description: `Bài tập "${values.title}" đã được giao cho lớp`,
      });
      onSuccess?.(values);
      form.reset();
      setAttachedFile(null);
      setDescriptionTab("edit");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tạo bài tập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Giao bài tập mới</DialogTitle>
              <DialogDescription>
                {className ? `Giao bài cho lớp ${className}` : "Điền thông tin bài tập"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề bài tập *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="VD: Bài tập React Hooks" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description with Markdown Preview */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Mô tả / Yêu cầu</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      Hỗ trợ Markdown
                    </span>
                  </div>
                  <Tabs value={descriptionTab} onValueChange={(v) => setDescriptionTab(v as "edit" | "preview")}>
                    <TabsList className="grid w-full grid-cols-2 h-9">
                      <TabsTrigger value="edit" className="text-xs gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                        Soạn thảo
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="text-xs gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Xem trước
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="mt-2 space-y-2">
                      <MarkdownToolbar
                        textareaRef={textareaRef}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                      <FormControl>
                        <Textarea 
                          ref={(el) => {
                            textareaRef.current = el;
                            // Also pass to react-hook-form ref
                            if (typeof field.ref === 'function') {
                              field.ref(el);
                            }
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder={`Mô tả chi tiết yêu cầu bài tập...

Ví dụ:
## Mục tiêu
Nắm vững cách sử dụng React Hooks

## Yêu cầu
1. Tạo ứng dụng Todo List
2. Sử dụng useState và useEffect

\`\`\`javascript
// Ví dụ code
const [count, setCount] = useState(0);
\`\`\``}
                          className="resize-none font-mono text-sm"
                          rows={8}
                          name={field.name}
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                    </TabsContent>
                    <TabsContent value="preview" className="mt-2">
                      <ScrollArea className="h-[200px] rounded-md border p-4 bg-muted/30">
                        {descriptionValue ? (
                          <MarkdownContent content={descriptionValue} />
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Chưa có nội dung để xem trước...
                          </p>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File attachment */}
            <div className="space-y-2">
              <FormLabel>File đề bài (tùy chọn)</FormLabel>
              {attachedFile ? (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <File className="w-8 h-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Kéo thả hoặc <span className="text-primary font-medium">chọn file</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOCX, PPTX, ZIP (tối đa 20MB)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.docx,.pptx,.zip"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày hết hạn *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: vi })
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ hết hạn *</FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điểm tối đa</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={1}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowLate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Cho phép nộp muộn</FormLabel>
                      <FormDescription className="text-xs">
                        Học sinh có thể nộp sau deadline
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Giao bài tập
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
