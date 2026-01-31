import { motion, AnimatePresence } from "framer-motion";
import { Users, PanelRightClose } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ConversationMember } from "./types";

interface MembersPanelProps {
  members: ConversationMember[];
  show: boolean;
  onClose: () => void;
}

export function MembersPanel({ members, show, onClose }: MembersPanelProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 220 }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 overflow-hidden"
        >
          <Card className="h-full border-0 shadow-md w-[220px]">
            <CardHeader className="py-2.5 px-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Thành viên ({members.length})
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onClose}
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="px-2 pb-2 space-y-1">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback
                          className={cn(
                            member.role === "teacher"
                              ? "bg-primary text-primary-foreground text-xs"
                              : "bg-muted text-xs"
                          )}
                        >
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {member.role === "teacher" ? "Giảng viên" : "Sinh viên"}
                        </p>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full bg-success shrink-0"
                        title="Online"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
