/**
 * useSocketEvent — listen to a Socket.io event and invoke callback.
 * Auto-subscribes and unsubscribes on mount/unmount.
 *
 * Usage:
 *   useSocketEvent("submission:new", (data) => { ... });
 */

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void
) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
}
