import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onUpload?: (file: File) => Promise<void>;
  onRemove?: () => void;
  uploadedFile?: {
    name: string;
    size: number;
    uploadedAt?: string;
  } | null;
  disabled?: boolean;
  className?: string;
}

type UploadStatus = "idle" | "selected" | "uploading" | "success" | "error";

export function FileUpload({
  accept = ".zip,.pdf,.docx",
  maxSize = 100,
  onUpload,
  onRemove,
  uploadedFile,
  disabled = false,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error("File quá lớn", {
        description: `Kích thước file tối đa là ${maxSize}MB`,
      });
      return false;
    }

    // Check file type
    const allowedExtensions = accept.split(",").map((ext) => ext.trim().toLowerCase());
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast.error("Định dạng không hỗ trợ", {
        description: `Chỉ hỗ trợ các định dạng: ${accept}`,
      });
      return false;
    }

    return true;
  };

  const simulateUpload = async (file: File) => {
    setUploadStatus("uploading");
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      setUploadProgress(i);
    }

    try {
      await onUpload?.(file);
      setUploadStatus("success");
      toast.success("Tải lên thành công!");
    } catch (error) {
      setUploadStatus("error");
      toast.error("Tải lên thất bại", {
        description: "Vui lòng thử lại sau",
      });
    }
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;
    setCurrentFile(file);
    setUploadStatus("selected");
  };

  const handleConfirmUpload = async () => {
    if (!currentFile) return;
    await simulateUpload(currentFile);
  };

  const handleCancelSelection = () => {
    setShowCancelWarning(false);
    setCurrentFile(null);
    setUploadStatus("idle");
  };

  const handleCancelClick = () => {
    setShowCancelWarning(true);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setShowRemoveWarning(false);
    setCurrentFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    onRemove?.();
  };

  const handleRemoveClick = () => {
    setShowRemoveWarning(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const displayFile = uploadedFile || (currentFile && uploadStatus === "success" ? {
    name: currentFile.name,
    size: currentFile.size,
  } : null);

  return (
    <>
      <AlertDialog open={showCancelWarning} onOpenChange={setShowCancelWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Xác nhận hủy
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy? File đã chọn "{currentFile?.name}" sẽ bị xóa và bạn sẽ phải chọn lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSelection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRemoveWarning} onOpenChange={setShowRemoveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Xác nhận xóa bài nộp
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài đã nộp? Bạn sẽ cần chọn và nộp lại file mới.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className={cn("w-full", className)}>
        <AnimatePresence mode="wait">
        {displayFile ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 border-2 border-success/30 bg-success/5 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <File className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{displayFile.name}</p>
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(displayFile.size)}
                  {displayFile.uploadedAt && ` • Đã nộp lúc ${displayFile.uploadedAt}`}
                </p>
              </div>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveClick}
                  className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        ) : uploadStatus === "selected" ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 border-2 border-primary/30 bg-primary/5 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <File className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentFile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentFile && formatFileSize(currentFile.size)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelClick}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-1" />
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmUpload}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Nộp bài
                </Button>
              </div>
            </div>
          </motion.div>
        ) : uploadStatus === "uploading" ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 border-2 border-primary/30 bg-primary/5 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="flex-1">
                <p className="font-medium mb-2">{currentFile?.name}</p>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  Đang tải lên... {uploadProgress}%
                </p>
              </div>
            </div>
          </motion.div>
        ) : uploadStatus === "error" ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 border-2 border-destructive/30 bg-destructive/5 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Tải lên thất bại</p>
                <p className="text-sm text-muted-foreground">
                  {currentFile?.name}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => currentFile && handleFile(currentFile)}
              >
                Thử lại
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
              dragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                  dragActive ? "bg-primary/10" : "bg-muted"
                )}
              >
                <Upload
                  className={cn(
                    "w-7 h-7 transition-colors",
                    dragActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <p className="text-base font-medium mb-1">
                {dragActive ? "Thả file vào đây" : "Kéo thả file hoặc nhấn để chọn"}
              </p>
              <p className="text-sm text-muted-foreground">
                {accept.replace(/\./g, "").toUpperCase().split(",").join(", ")} (tối đa {maxSize}MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleChange}
              disabled={disabled}
            />
          </motion.label>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
