import { useState, useEffect } from "react";
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
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ClassDetailItem, ClassItem } from "@/api";

const formSchema = z.object({
  name: z.string().min(3, "Tên lớp phải có ít nhất 3 ký tự").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: (ClassDetailItem | ClassItem) | null;
  onSuccess?: () => void;
}

export function EditClassModal({ open, onOpenChange, classItem, onSuccess }: EditClassModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (open && classItem) {
      form.reset({
        name: classItem.name,
        description: classItem.description ?? "",
        status: (classItem.status as "ACTIVE" | "ARCHIVED") ?? "ACTIVE",
      });
    }
  }, [open, classItem, form]);

  const onSubmit = async (values: FormValues) => {
    if (!classItem) return;
    setIsLoading(true);
    try {
      await import("@/api/client").then((m) =>
        m.api.patch(`/classes/${classItem.id}`, {
          name: values.name,
          description: values.description || undefined,
          status: values.status,
        })
      );
      toast.success("Cập nhật lớp học thành công!");
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật lớp thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  if (!classItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
              <DialogDescription>
                Mã lớp: {classItem.code} (không đổi)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên lớp học *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Lập trình Web - KTPM01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn về lớp học..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value as "ACTIVE" | "ARCHIVED")}
                    >
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="ARCHIVED">Lưu trữ</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
