import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import type { Conversation, Message } from "@/components/conversations/types";

interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor: number | null;
}

export function useConversations() {
  const { user } = useAuth();
  const {
    socket,
    joinConversationRoom,
    leaveConversationRoom,
    emitTyping,
    emitStopTyping,
  } = useSocket();
  const queryClient = useQueryClient();

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [typingUsers, setTypingUsers] = useState<
    { userId: string; userName: string }[]
  >([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConvIdRef = useRef<string | null>(null);

  // Fetch conversations list
  const {
    data: conversations = [],
    isLoading: loadingConversations,
    refetch: refetchConversations,
  } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: () => api.get("/conversations"),
  });

  // Fetch messages for selected conversation
  const {
    data: messagesData,
    isLoading: loadingMessages,
    refetch: refetchMessages,
  } = useQuery<MessagesResponse>({
    queryKey: ["messages", selectedConversation?.id],
    queryFn: () =>
      api.get(`/conversations/${selectedConversation!.id}/messages`),
    enabled: !!selectedConversation,
  });

  const messages: Message[] = (messagesData?.messages || []).map((m) => ({
    ...m,
    isOwn: String(m.senderId) === String(user?.id),
  }));

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/conversations/${selectedConversation!.id}/messages`, {
        content,
      }),
    onSuccess: () => {
      // Don't refetch — socket will push the new message
    },
  });

  // Recall message mutation (soft delete — shows "Tin nhắn đã được thu hồi")
  const recallMessageMutation = useMutation({
    mutationFn: (messageId: string) =>
      api.patch(
        `/conversations/${selectedConversation!.id}/messages/${messageId}/recall`,
        {}
      ),
  });

  // Delete message mutation (hard delete — removes message entirely)
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) =>
      api.delete(
        `/conversations/${selectedConversation!.id}/messages/${messageId}`
      ),
  });

  // Select conversation: join room, leave previous
  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      if (prevConvIdRef.current && prevConvIdRef.current !== conv.id) {
        leaveConversationRoom(Number(prevConvIdRef.current));
      }
      setSelectedConversation(conv);
      prevConvIdRef.current = conv.id;
      joinConversationRoom(Number(conv.id));
      setTypingUsers([]);

      // Mark as read
      api.post(`/conversations/${conv.id}/read`, {}).catch(() => {});
    },
    [joinConversationRoom, leaveConversationRoom]
  );

  // Handle send
  const handleSend = useCallback(() => {
    const content = messageInput.trim();
    if (!content || !selectedConversation) return;
    sendMessageMutation.mutate(content);
    setMessageInput("");
    if (selectedConversation) {
      emitStopTyping(Number(selectedConversation.id));
    }
  }, [messageInput, selectedConversation, sendMessageMutation, emitStopTyping]);

  // Handle typing
  const handleInputChange = useCallback(
    (value: string) => {
      setMessageInput(value);
      if (!selectedConversation) return;

      if (value.trim()) {
        emitTyping(Number(selectedConversation.id));
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          emitStopTyping(Number(selectedConversation.id));
        }, 2000);
      } else {
        emitStopTyping(Number(selectedConversation.id));
      }
    },
    [selectedConversation, emitTyping, emitStopTyping]
  );

  // Socket listeners for new messages and typing
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message & { conversationId: string }) => {
      // Add to current messages if viewing this conversation
      if (
        selectedConversation &&
        String(msg.conversationId) === String(selectedConversation.id)
      ) {
        queryClient.setQueryData<MessagesResponse>(
          ["messages", selectedConversation.id],
          (old) => {
            if (!old) return { messages: [msg], hasMore: false, nextCursor: null };
            // Avoid duplicate
            if (old.messages.some((m) => m.id === msg.id)) return old;
            return {
              ...old,
              messages: [
                ...old.messages,
                { ...msg, isOwn: String(msg.senderId) === String(user?.id) },
              ],
            };
          }
        );
        // Mark as read
        api.post(`/conversations/${selectedConversation.id}/read`, {}).catch(() => {});
      }

      // Refresh conversations list for updated lastMessage / unread
      refetchConversations();
    };

    const handleMessageRecalled = (data: {
      messageId: string;
      conversationId: string;
    }) => {
      if (
        selectedConversation &&
        String(data.conversationId) === String(selectedConversation.id)
      ) {
        queryClient.setQueryData<MessagesResponse>(
          ["messages", selectedConversation.id],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              messages: old.messages.map((m) =>
                m.id === data.messageId
                  ? { ...m, isRecalled: true, content: "Tin nhắn đã được thu hồi" }
                  : m
              ),
            };
          }
        );
      }
      refetchConversations();
    };

    const handleMessageDeleted = (data: {
      messageId: string;
      conversationId: string;
    }) => {
      if (
        selectedConversation &&
        String(data.conversationId) === String(selectedConversation.id)
      ) {
        queryClient.setQueryData<MessagesResponse>(
          ["messages", selectedConversation.id],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              messages: old.messages.filter((m) => m.id !== data.messageId),
            };
          }
        );
      }
      refetchConversations();
    };

    const handleTyping = (data: {
      conversationId: string;
      userId: string;
      userName: string;
    }) => {
      if (
        selectedConversation &&
        String(data.conversationId) === String(selectedConversation.id) &&
        String(data.userId) !== String(user?.id)
      ) {
        setTypingUsers((prev) => {
          if (prev.some((t) => t.userId === data.userId)) return prev;
          return [...prev, { userId: data.userId, userName: data.userName }];
        });
      }
    };

    const handleStopTyping = (data: {
      conversationId: string;
      userId: string;
    }) => {
      if (
        selectedConversation &&
        String(data.conversationId) === String(selectedConversation.id)
      ) {
        setTypingUsers((prev) =>
          prev.filter((t) => t.userId !== data.userId)
        );
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:recalled", handleMessageRecalled);
    socket.on("message:deleted", handleMessageDeleted);
    socket.on("user:typing", handleTyping);
    socket.on("user:stop_typing", handleStopTyping);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:recalled", handleMessageRecalled);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("user:typing", handleTyping);
      socket.off("user:stop_typing", handleStopTyping);
    };
  }, [socket, selectedConversation, user, queryClient, refetchConversations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevConvIdRef.current) {
        leaveConversationRoom(Number(prevConvIdRef.current));
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [leaveConversationRoom]);

  return {
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
  };
}
