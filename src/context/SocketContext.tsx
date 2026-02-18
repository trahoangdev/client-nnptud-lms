/**
 * SocketContext — manages Socket.io connection lifecycle.
 * Connects after login, disconnects on logout.
 * Auto-joins user:{id} + teachers room (if Teacher/Admin).
 * Provides useSocket() hook for components.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinRoom,
  leaveRoom,
} from "@/lib/socket";
import { getToken } from "@/api/client";

interface SocketContextValue {
  /** The raw socket instance (null if not connected) */
  socket: Socket | null;
  /** Join additional rooms (class, assignment, submission, conversation) */
  joinClassRoom: (classId: number) => void;
  joinAssignmentRoom: (assignmentId: number) => void;
  joinSubmissionRoom: (submissionId: number) => void;
  joinConversationRoom: (conversationId: number) => void;
  /** Leave specific rooms */
  leaveClassRoom: (classId: number) => void;
  leaveAssignmentRoom: (assignmentId: number) => void;
  leaveSubmissionRoom: (submissionId: number) => void;
  leaveConversationRoom: (conversationId: number) => void;
  /** Typing indicators */
  emitTyping: (conversationId: number) => void;
  emitStopTyping: (conversationId: number) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const connectedRef = useRef(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  // Connect / disconnect based on auth state
  useEffect(() => {
    const token = getToken();
    if (user && token && !connectedRef.current) {
      const sock = connectSocket(token);
      connectedRef.current = true;
      setSocketInstance(sock);

      // Auto-join personal room + role room
      sock.on("connect", () => {
        // Re-set instance on reconnect to trigger consumer re-renders
        setSocketInstance(sock);
        joinRoom({
          userId: user.id,
          role: user.role.toUpperCase(),
        });
      });

      // Also join immediately if already connected
      if (sock.connected) {
        joinRoom({
          userId: user.id,
          role: user.role.toUpperCase(),
        });
      }
    }

    if (!user && connectedRef.current) {
      disconnectSocket();
      connectedRef.current = false;
      setSocketInstance(null);
    }

    return () => {
      // Cleanup on unmount
    };
  }, [user]);

  // Room management helpers
  const joinClassRoom = useCallback(
    (classId: number) => {
      if (!user) return;
      joinRoom({ userId: user.id, role: user.role.toUpperCase(), classId });
    },
    [user]
  );

  const joinAssignmentRoom = useCallback(
    (assignmentId: number) => {
      if (!user) return;
      joinRoom({ userId: user.id, role: user.role.toUpperCase(), assignmentId });
    },
    [user]
  );

  const joinSubmissionRoom = useCallback(
    (submissionId: number) => {
      if (!user) return;
      joinRoom({ userId: user.id, role: user.role.toUpperCase(), submissionId });
    },
    [user]
  );

  const leaveClassRoom = useCallback((classId: number) => {
    leaveRoom(`class:${classId}`);
  }, []);

  const leaveAssignmentRoom = useCallback((assignmentId: number) => {
    leaveRoom(`assignment:${assignmentId}`);
  }, []);

  const leaveSubmissionRoom = useCallback((submissionId: number) => {
    leaveRoom(`submission:${submissionId}`);
  }, []);

  const joinConversationRoom = useCallback((conversationId: number) => {
    const sock = getSocket();
    sock?.emit("join_conversation", { conversationId });
  }, []);

  const leaveConversationRoom = useCallback((conversationId: number) => {
    const sock = getSocket();
    sock?.emit("leave_conversation", { conversationId });
  }, []);

  const emitTyping = useCallback(
    (conversationId: number) => {
      if (!user) return;
      const sock = getSocket();
      sock?.emit("typing", {
        conversationId,
        userId: user.id,
        userName: user.name,
      });
    },
    [user]
  );

  const emitStopTyping = useCallback(
    (conversationId: number) => {
      if (!user) return;
      const sock = getSocket();
      sock?.emit("stop_typing", {
        conversationId,
        userId: user.id,
      });
    },
    [user]
  );

  const value: SocketContextValue = {
    socket: socketInstance,
    joinClassRoom,
    joinAssignmentRoom,
    joinSubmissionRoom,
    joinConversationRoom,
    leaveClassRoom,
    leaveAssignmentRoom,
    leaveSubmissionRoom,
    leaveConversationRoom,
    emitTyping,
    emitStopTyping,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
