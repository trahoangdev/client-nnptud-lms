export interface ConversationMember {
  id: string;
  name: string;
  role: "teacher" | "student" | "admin";
  avatar: string;
}

export interface LastMessage {
  content: string;
  sender: string;
  time: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  type: "group" | "class" | "direct";
  classId: string | null;
  className: string;
  roomCode: string | null;
  members: ConversationMember[];
  lastMessage: LastMessage;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "teacher" | "student" | "admin";
  content: string;
  time: string;
  date: string;
  isOwn: boolean;
  status: "read" | "delivered" | "sent";
  conversationId?: string;
  isRecalled?: boolean;
}
