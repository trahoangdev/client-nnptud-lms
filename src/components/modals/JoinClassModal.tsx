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
import { Button } from "@/components/ui/button";
import { Users, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  classCode: z
    .string()
    .min(5, "Mã lớp không hợp lệ")
    .max(10, "Mã lớp không hợp lệ")
    .toUpperCase(),
});

type FormValues = z.infer<typeof formSchema>;

interface JoinClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (classCode: string) => void;
}

export function JoinClassModal({ open, onOpenChange, onSuccess }: JoinClassModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [joinedClass, setJoinedClass] = useState<{
    name: string;
    teacher: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classCode: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const res = await import("@/api/client").then((m) =>
        m.api.post<{ message: string; classId: number; className: string }>("/classes/join", {
          code: values.classCode.trim().toUpperCase(),
        })
      );
      setJoinedClass({ name: res.className, teacher: "" });
      toast.success("Tham gia lớp thành công!", {
        description: `Bạn đã tham gia lớp ${res.className}`,
      });
      onSuccess?.(values.classCode);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Mã lớp không hợp lệ hoặc đã hết hạn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setJoinedClass(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Tham gia lớp học</DialogTitle>
              <DialogDescription>
                Nhập mã lớp do giáo viên cung cấp để tham gia
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!joinedClass ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                  <FormField
                    control={form.control}
                    name="classCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã lớp học *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="VD: WEB2025A" 
                            className="text-center font-mono text-lg tracking-widest uppercase"
                            maxLength={10}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormDescription>
                          Mã lớp gồm 7 ký tự, không phân biệt hoa thường
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Tham gia
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Tham gia thành công!
                </h3>
                <p className="text-muted-foreground mb-1">
                  Bạn đã tham gia lớp
                </p>
                <p className="font-medium text-foreground mb-4">
                  {joinedClass.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Giáo viên: {joinedClass.teacher}
                </p>
              </div>

              <div className="flex justify-center mt-6">
                <Button onClick={handleClose}>
                  Đóng
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
