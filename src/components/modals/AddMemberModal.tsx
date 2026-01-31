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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Loader2, 
  Mail, 
  Users, 
  X, 
  Copy,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const singleEmailSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
});

const bulkEmailSchema = z.object({
  emails: z.string().min(1, "Vui lòng nhập ít nhất 1 email"),
});

type SingleFormValues = z.infer<typeof singleEmailSchema>;
type BulkFormValues = z.infer<typeof bulkEmailSchema>;

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  classCode: string;
  onSuccess?: (emails: string[]) => void;
}

export function AddMemberModal({
  open,
  onOpenChange,
  classId,
  className,
  classCode,
  onSuccess,
}: AddMemberModalProps) {
  const [activeTab, setActiveTab] = useState("single");
  const [isLoading, setIsLoading] = useState(false);
  const [addedEmails, setAddedEmails] = useState<string[]>([]);
  const [failedEmails, setFailedEmails] = useState<string[]>([]);

  const singleForm = useForm<SingleFormValues>({
    resolver: zodResolver(singleEmailSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const bulkForm = useForm<BulkFormValues>({
    resolver: zodResolver(bulkEmailSchema),
    defaultValues: {
      emails: "",
    },
  });

  const copyClassCode = () => {
    navigator.clipboard.writeText(classCode);
    toast.success("Đã sao chép mã lớp!");
  };

  const parseEmails = (text: string): string[] => {
    // Parse emails from various formats: comma-separated, line-separated, or mixed
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? [...new Set(matches)] : [];
  };

  const onSubmitSingle = async (values: SingleFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Đã gửi lời mời!", {
      description: `Lời mời đã được gửi đến ${values.email}`,
    });
    
    onSuccess?.([values.email]);
    singleForm.reset();
    setIsLoading(false);
  };

  const onSubmitBulk = async (values: BulkFormValues) => {
    const emails = parseEmails(values.emails);
    
    if (emails.length === 0) {
      bulkForm.setError("emails", { 
        message: "Không tìm thấy email hợp lệ" 
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call with some failures
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Simulate some successes and failures
    const successEmails = emails.slice(0, Math.ceil(emails.length * 0.8));
    const failEmails = emails.slice(Math.ceil(emails.length * 0.8));
    
    setAddedEmails(successEmails);
    setFailedEmails(failEmails);
    
    if (successEmails.length > 0) {
      toast.success(`Đã gửi ${successEmails.length} lời mời!`);
      onSuccess?.(successEmails);
    }
    
    if (failEmails.length > 0) {
      toast.error(`${failEmails.length} email không hợp lệ hoặc đã tồn tại`);
    }
    
    setIsLoading(false);
  };

  const resetResults = () => {
    setAddedEmails([]);
    setFailedEmails([]);
    bulkForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Thêm học sinh</DialogTitle>
              <DialogDescription>
                Thêm học sinh vào lớp {className}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Class Code Section */}
        <div className="p-4 bg-muted/50 rounded-xl space-y-2">
          <p className="text-sm text-muted-foreground">
            Hoặc chia sẻ mã lớp để học sinh tự tham gia:
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2 bg-background rounded-lg border">
              <span className="font-mono text-lg font-bold">{classCode}</span>
            </div>
            <Button variant="outline" onClick={copyClassCode}>
              <Copy className="w-4 h-4 mr-2" />
              Sao chép
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <Mail className="w-4 h-4" />
              Thêm từng người
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-2">
              <Users className="w-4 h-4" />
              Thêm nhiều người
            </TabsTrigger>
          </TabsList>

          {/* Single Email Tab */}
          <TabsContent value="single" className="mt-4">
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(onSubmitSingle)} className="space-y-4">
                <FormField
                  control={singleForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email học sinh *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="hocsinh@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={singleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên học sinh (tùy chọn)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nguyễn Văn A"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Nếu để trống, học sinh sẽ tự cập nhật khi nhận lời mời
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Gửi lời mời
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Bulk Email Tab */}
          <TabsContent value="bulk" className="mt-4">
            {addedEmails.length > 0 || failedEmails.length > 0 ? (
              <div className="space-y-4">
                {/* Results */}
                {addedEmails.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Đã gửi lời mời ({addedEmails.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {addedEmails.map((email) => (
                        <Badge key={email} variant="secondary" className="text-xs">
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {failedEmails.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Không thành công ({failedEmails.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {failedEmails.map((email) => (
                        <Badge key={email} variant="outline" className="text-xs text-destructive">
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={resetResults}
                >
                  Thêm học sinh khác
                </Button>
              </div>
            ) : (
              <Form {...bulkForm}>
                <form onSubmit={bulkForm.handleSubmit(onSubmitBulk)} className="space-y-4">
                  <FormField
                    control={bulkForm.control}
                    name="emails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh sách email *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập danh sách email, mỗi email một dòng hoặc phân cách bằng dấu phẩy:&#10;&#10;student1@email.com&#10;student2@email.com&#10;student3@email.com"
                            className="resize-none font-mono text-sm"
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {parseEmails(field.value).length > 0 
                            ? `Đã nhận dạng ${parseEmails(field.value).length} email`
                            : "Hỗ trợ copy/paste từ Excel hoặc danh sách email"
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Gửi lời mời ({parseEmails(bulkForm.watch("emails")).length} email)
                  </Button>
                </form>
              </Form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
