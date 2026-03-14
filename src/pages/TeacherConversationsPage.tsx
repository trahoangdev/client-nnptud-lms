import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
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
import { CreateConversationModal } from "@/components/modals/CreateConversationModal";
import { EditConversationModal } from "@/components/modals/EditConversationModal";
import { DeleteConversationDialog } from "@/components/modals/DeleteConversationDialog";
import type { Conversation } from "@/components/conversations/types";

export default function TeacherConversationsPage() {
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
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
    recallMessageMutation,
    deleteMessageMutation,
    leaveConversationMutation,
  } = useConversations();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isMobile = useIsMobile();
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleSelectConv = (conv: Conversation) => {
    handleSelectConversation(conv);
    if (isMobile) setMobileShowChat(true);
  };

  const handleBack = () => {
    setMobileShowChat(false);
  };

  // On mobile: show list OR chat, not both
  const showList = !isMobile || !mobileShowChat;
  const showChat = !isMobile || mobileShowChat;

  return (
    <AppLayout userRole="teacher">
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
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Tạo hội thoại
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
                  showRoomCode
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
                      onEdit={() => setShowEditModal(true)}
                      onDelete={() => setShowDeleteDialog(true)}
                      onLeave={() => leaveConversationMutation.mutate(selectedConversation.id)}
                    />
                    {loadingMessages ? (
                      <CardContent className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </CardContent>
                    ) : (
                      <MessageList
                        messages={messages}
                        onRecallMessage={(id) => recallMessageMutation.mutate(id)}
                        onDeleteMessage={(id) => deleteMessageMutation.mutate(id)}
                      />
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

      <CreateConversationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreated={() => {
          refetchConversations();
          setShowCreateModal(false);
        }}
      />

      <EditConversationModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        conversation={selectedConversation}
        onUpdated={() => {
          refetchConversations();
        }}
      />

      <DeleteConversationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        conversationId={selectedConversation?.id ?? null}
        conversationName={selectedConversation?.name ?? ""}
        onDeleted={() => {
          setSelectedConversation(null);
          setMobileShowChat(false);
          refetchConversations();
        }}
      />
    </AppLayout>
  );
}
