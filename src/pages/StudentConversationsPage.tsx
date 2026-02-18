import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, LogIn } from "lucide-react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ConversationList,
  ChatHeader,
  MessageList,
  MessageInput,
  MembersPanel,
} from "@/components/conversations";
import { useConversations } from "@/hooks/useConversations";
import { useIsMobile } from "@/hooks/use-mobile";
import { JoinConversationModal } from "@/components/modals/JoinConversationModal";

export default function StudentConversationsPage() {
  const {
    conversations,
    selectedConversation,
    searchQuery,
    messageInput,
    messages,
    showMembers,
    typingUsers,
    loadingConversations,
    loadingMessages,
    setSearchQuery,
    setShowMembers,
    handleSelectConversation,
    handleSend,
    handleInputChange,
    refetchConversations,
  } = useConversations();

  const isMobile = useIsMobile();
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleSelectConv = (conv: any) => {
    handleSelectConversation(conv);
    if (isMobile) setMobileShowChat(true);
  };

  const handleBack = () => {
    setMobileShowChat(false);
  };

  const showList = !isMobile || !mobileShowChat;
  const showChat = !isMobile || mobileShowChat;

  return (
    <AppLayout userRole="student">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[calc(100vh-120px)]"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Hội thoại
          </h1>
          <Button size="sm" variant="outline" onClick={() => setShowJoinModal(true)}>
            <LogIn className="w-4 h-4 mr-1" />
            Tham gia
          </Button>
        </div>

        <div className="flex gap-0 md:gap-4 h-[calc(100%-48px)]">
          {/* Sidebar / Conversation list */}
          {showList && (
            <>
              {loadingConversations ? (
                <div className="w-full md:w-72 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectConversation={handleSelectConv}
                />
              )}
            </>
          )}

          {/* Main chat area */}
          {showChat && (
            <>
              {selectedConversation ? (
                <>
                  <Card className="flex-1 border-0 shadow-md flex flex-col overflow-hidden">
                    <ChatHeader
                      conversation={selectedConversation}
                      showMembers={showMembers}
                      onToggleMembers={() => setShowMembers(!showMembers)}
                      onBack={isMobile ? handleBack : undefined}
                    />
                    {loadingMessages ? (
                      <CardContent className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </CardContent>
                    ) : (
                      <MessageList messages={messages} />
                    )}
                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="px-4 pb-1 text-xs text-muted-foreground italic">
                        {typingUsers.map((t) => t.userName).join(", ")} đang nhập...
                      </div>
                    )}
                    <MessageInput
                      value={messageInput}
                      onChange={handleInputChange}
                      onSend={handleSend}
                    />
                  </Card>

                  <MembersPanel
                    members={selectedConversation.members}
                    show={showMembers}
                    onClose={() => setShowMembers(false)}
                  />
                </>
              ) : (
                !isMobile && (
                  <Card className="flex-1 border-0 shadow-md flex items-center justify-center">
                    <CardContent className="text-center space-y-3 py-12">
                      <div className="rounded-full bg-muted p-4 mx-auto w-fit">
                        <MessageSquare className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Chọn một cuộc hội thoại để bắt đầu nhắn tin
                      </p>
                    </CardContent>
                  </Card>
                )
              )}
            </>
          )}
        </div>
      </motion.div>

      <JoinConversationModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        onJoined={() => refetchConversations()}
      />
    </AppLayout>
  );
}
