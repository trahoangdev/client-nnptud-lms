import { useState, useCallback, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Loader2, CalendarIcon, Upload, X, File } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/RichTextEditor";

const formSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự").max(200),
  description: z.string().max(5000).optional(),
  dueDate: z.date({ required_error: "Vui lòng chọn ngày hết hạn" }),
  dueTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Thời gian không hợp lệ"),
  maxScore: z.number().min(1).max(100).default(10),
  allowLate: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface ClassOption {
  id: number;
  name: string;
}

interface CreateAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId?: string;
  className?: string;
  /** Khi mở từ Dashboard (không có classId), truyền danh sách lớp để chọn */
  classes?: ClassOption[];
  onSuccess?: (assignmentData: FormValues) => void;
}

export function CreateAssignmentModal({
  open,
  onOpenChange,
  classId,
  className,
  classes: classesList = [],
  onSuccess,
}: CreateAssignmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>(classId ?? "");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const effectiveClassId = classId ?? selectedClassId;
  const needClassSelect = !classId && classesList.length > 0;

  useEffect(() => {
    if (open) {
      setSelectedClassId(classId ?? "");
    }
  }, [open, classId]);

  /** Chỉ vô hiệu hóa ngày trước hôm nay (không vô hiệu hóa hôm nay) */
  const isDateDisabled = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }, []);

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
    if (!effectiveClassId) {
      toast.error(needClassSelect ? "Vui lòng chọn lớp học" : "Chưa chọn lớp");
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
          classId: Number(effectiveClassId),
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
                {className ? `Giao bài cho lớp ${className}` : needClassSelect ? "Chọn lớp và điền thông tin bài tập" : "Điền thông tin bài tập"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {needClassSelect && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Lớp học *</label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">-- Chọn lớp --</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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

            {/* Description with Rich Text Editor */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả / Yêu cầu</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Mô tả chi tiết yêu cầu bài tập..."
                    />
                  </FormControl>
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
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
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
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                              setDatePickerOpen(false);
                            }
                          }}
                          disabled={isDateDisabled}
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
