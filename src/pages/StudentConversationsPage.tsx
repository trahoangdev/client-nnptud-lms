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

// Mock data
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
      content: "Các bạn nhớ hoàn thành bài tập trước deadline nhé!",
      sender: "Nguyễn Văn A",
      time: "10:30",
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: "2",
    name: "Nhóm 2 - CSDL",
    type: "group",
    classId: "2",
    className: "Cơ sở dữ liệu - KTPM02",
    members: [
      { id: "t2", name: "Trần Văn B", role: "teacher", avatar: "" },
      { id: "s1", name: "Trần Thị B", role: "student", avatar: "" },
      { id: "s4", name: "Nguyễn Văn E", role: "student", avatar: "" },
    ],
    lastMessage: {
      content: "Em có thắc mắc về bài ER Diagram ạ",
      sender: "Nguyễn Văn E",
      time: "Hôm qua",
      isRead: false,
    },
    unreadCount: 3,
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
];

const messages: Message[] = [
  {
    id: "1",
    senderId: "t1",
    senderName: "Nguyễn Văn A",
    senderRole: "teacher",
    content: "Chào các bạn, tuần này chúng ta sẽ học về React Hooks nhé!",
    time: "09:00",
    date: "Hôm nay",
    isOwn: false,
    status: "read",
  },
  {
    id: "2",
    senderId: "s2",
    senderName: "Lê Văn C",
    senderRole: "student",
    content:
      "Dạ thầy, em có thắc mắc về useEffect ạ. Khi nào thì nên dùng dependency array rỗng?",
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
      "Câu hỏi hay! Dependency array rỗng [] nghĩa là effect chỉ chạy một lần khi component mount. Dùng khi bạn muốn fetch data ban đầu hoặc setup subscription.",
    time: "09:20",
    date: "Hôm nay",
    isOwn: false,
    status: "read",
  },
  {
    id: "4",
    senderId: "s1",
    senderName: "Trần Thị B",
    senderRole: "student",
    content: "Em hiểu rồi ạ, cảm ơn thầy!",
    time: "09:25",
    date: "Hôm nay",
    isOwn: true,
    status: "read",
  },
  {
    id: "5",
    senderId: "s3",
    senderName: "Phạm Thị D",
    senderRole: "student",
    content: "Thầy ơi, có tài liệu nào về custom hooks không ạ?",
    time: "10:00",
    date: "Hôm nay",
    isOwn: false,
    status: "read",
  },
  {
    id: "6",
    senderId: "t1",
    senderName: "Nguyễn Văn A",
    senderRole: "teacher",
    content: "Các bạn nhớ hoàn thành bài tập trước deadline nhé!",
    time: "10:30",
    date: "Hôm nay",
    isOwn: false,
    status: "delivered",
  },
];

export default function StudentConversationsPage() {
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
    <AppLayout userRole="student">
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
