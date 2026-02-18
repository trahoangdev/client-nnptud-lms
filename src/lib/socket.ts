/**
 * Socket.io client singleton — connects to server for realtime events.
 * Auto-reconnects, sends auth token.
 */

import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
  });

  socket.on("connect", () => {
    console.log("⚡ Socket connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connect error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(roomData: {
  userId: number;
  role: string;
  classId?: number;
  assignmentId?: number;
  submissionId?: number;
}) {
  socket?.emit("join_room", roomData);
}

export function leaveRoom(room: string) {
  socket?.emit("leave_room", { room });
}
