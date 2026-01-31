import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AppLayout } from "@/components/layout";
import {
  ConversationList,
  ChatHeader,
  MessageList,
  MembersPanel,
  MessageInput,
  Conversation,
  Message,
} from "@/components/conversations";

// Mock data for teacher
const conversations: Conversation[] = [
  {
    id: "1",
    name: "Nhóm 1 - Lập trình Web",
    type: "group",
    classId: "1",
    className: "Lập trình Web - KTPM01",
    members: [
      { id: "t1", name: "Nguyễn Văn A", role: "teacher", avatar: "" },
      { id: "s1", name: "Trần Thị B", role: "student", avatar: "" },
      { id: "s2", name: "Lê Văn C", role: "student", avatar: "" },
      { id: "s3", name: "Phạm Thị D", role: "student", avatar: "" },
    ],
    lastMessage: {
      content: "Dạ em đã hoàn thành bài tập rồi ạ",
      sender: "Trần Thị B",
      time: "11:00",
      isRead: true,
    },
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Nhóm 2 - Lập trình Web",
    type: "group",
    classId: "1",
    className: "Lập trình Web - KTPM01",
    members: [
      { id: "t1", name: "Nguyễn Văn A", role: "teacher", avatar: "" },
      { id: "s4", name: "Nguyễn Văn E", role: "student", avatar: "" },
      { id: "s5", name: "Hoàng Văn F", role: "student", avatar: "" },
    ],
    lastMessage: {
      content: "Thầy ơi nhóm em có thắc mắc về project ạ",
      sender: "Nguyễn Văn E",
      time: "10:45",
      isRead: false,
    },
    unreadCount: 5,
  },
  {
    id: "3",
    name: "Thảo luận chung - Web",
    type: "class",
    classId: "1",
    className: "Lập trình Web - KTPM01",
    members: [
      { id: "t1", name: "Nguyễn Văn A", role: "teacher", avatar: "" },
      { id: "s1", name: "Trần Thị B", role: "student", avatar: "" },
      { id: "s2", name: "Lê Văn C", role: "student", avatar: "" },
      { id: "s3", name: "Phạm Thị D", role: "student", avatar: "" },
      { id: "s4", name: "Nguyễn Văn E", role: "student", avatar: "" },
      { id: "s5", name: "Hoàng Văn F", role: "student", avatar: "" },
    ],
    lastMessage: {
      content: "Thầy ơi, bài tập nộp ở đâu ạ?",
      sender: "Hoàng Văn F",
      time: "09:15",
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: "4",
    name: "Thảo luận chung - CSDL",
    type: "class",
    classId: "2",
    className: "Cơ sở dữ liệu - KTPM02",
    members: [
      { id: "t1", name: "Nguyễn Văn A", role: "teacher", avatar: "" },
      { id: "s6", name: "Trần Văn G", role: "student", avatar: "" },
      { id: "s7", name: "Lê Thị H", role: "student", avatar: "" },
    ],
    lastMessage: {
      content: "Tuần sau chúng ta sẽ thi giữa kỳ nhé các bạn",
      sender: "Nguyễn Văn A",
      time: "Hôm qua",
      isRead: true,
    },
    unreadCount: 0,
  },
];

const messages: Message[] = [
  {
    id: "1",
    senderId: "t1",
    senderName: "Nguyễn Văn A",
    senderRole: "teacher",
    content: "Chào các bạn, tuần này chúng ta sẽ làm project React nhé!",
    time: "09:00",
    date: "Hôm nay",
    isOwn: true,
    status: "read",
  },
  {
    id: "2",
    senderId: "s1",
    senderName: "Trần Thị B",
    senderRole: "student",
    content: "Dạ thầy, đề tài project có giới hạn không ạ?",
    time: "09:15",
    date: "Hôm nay",
    isOwn: false,
    status: "read",
  },
  {
    id: "3",
    senderId: "t1",
    senderName: "Nguyễn Văn A",
    senderRole: "teacher",
    content:
      "Các bạn có thể tự chọn đề tài, miễn sao sử dụng React và có ít nhất 5 components nhé!",
    time: "09:20",
    date: "Hôm nay",
    isOwn: true,
    status: "read",
  },
  {
    id: "4",
    senderId: "s2",
    senderName: "Lê Văn C",
    senderRole: "student",
    content: "Dạ thầy, em có thể làm về Todo App được không ạ?",
    time: "09:30",
    date: "Hôm nay",
    isOwn: false,
    status: "read",
  },
  {
    id: "5",
    senderId: "t1",
    senderName: "Nguyễn Văn A",
    senderRole: "teacher",
    content: "Được chứ! Todo App là một project tốt để thực hành React.",
    time: "09:35",
    date: "Hôm nay",
    isOwn: true,
    status: "read",
  },
  {
    id: "6",
    senderId: "s1",
    senderName: "Trần Thị B",
    senderRole: "student",
    content: "Dạ em đã hoàn thành bài tập rồi ạ",
    time: "11:00",
    date: "Hôm nay",
    isOwn: false,
    status: "delivered",
  },
];

export default function TeacherConversationsPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>(conversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMembers, setShowMembers] = useState(true);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    console.log("Send:", messageInput);
    setMessageInput("");
  };

  return (
    <AppLayout userRole="teacher">
      <div className="h-[calc(100vh-120px)] flex gap-3">
        {/* Conversation List */}
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectConversation={setSelectedConversation}
        />

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <Card className="h-full border-0 shadow-md flex flex-col">
            <ChatHeader
              conversation={selectedConversation}
              showMembers={showMembers}
              onToggleMembers={() => setShowMembers(!showMembers)}
            />
            <MessageList messages={messages} />
            <MessageInput
              value={messageInput}
              onChange={setMessageInput}
              onSend={handleSendMessage}
            />
          </Card>
        </motion.div>

        {/* Members Panel */}
        <MembersPanel
          members={selectedConversation?.members || []}
          show={showMembers}
          onClose={() => setShowMembers(false)}
        />
      </div>
    </AppLayout>
  );
}
