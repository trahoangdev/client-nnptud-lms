import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/layout";
import { MessageSquare, Construction } from "lucide-react";

export default function TeacherConversationsPage() {
  return (
    <AppLayout userRole="teacher">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-[calc(100vh-200px)]"
      >
        <Card className="max-w-md w-full border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <Construction className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-2 justify-center">
                <MessageSquare className="w-5 h-5" />
                Hội thoại
              </h2>
              <p className="text-muted-foreground">
                Tính năng tin nhắn đang được phát triển. Bạn sẽ có thể trao đổi trực tiếp 
                với học sinh và đồng nghiệp trong thời gian tới.
              </p>
            </div>
            <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
              Sắp ra mắt
            </span>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
