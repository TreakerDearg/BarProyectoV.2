/**
 * Socket.IO Client for Web Client
 * Handles connection, authentication, and events
 * Based on REALTIME_CONTRACT.md
 */

import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth/tokenStorage";
import type { SocketConfig } from "./types";
import { handleOrderStatusEvent, handleOrderCreatedEvent } from "./events";

let socketInstance: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let isPollingActive = false;

/**
 * Initialize Socket.IO connection
 */
export function initSocket(): Socket {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const socketUrl = apiUrl.replace("/api", "");

  const config: SocketConfig = {
    url: socketUrl,
    options: {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    },
  };

  const token = getAccessToken();

  socketInstance = io(config.url, {
    ...config.options,
    auth: token ? { token } : undefined,
  });

  setupSocketListeners(socketInstance);

  return socketInstance;
}

/**
 * Get existing socket instance or initialize
 */
export function getSocket(): Socket | null {
  if (socketInstance?.connected) {
    return socketInstance;
  }
  return initSocket();
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    reconnectAttempts = 0;
  }
}

/**
 * Setup socket event listeners
 */
function setupSocketListeners(socket: Socket): void {
  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
    reconnectAttempts = 0;
    isPollingActive = false;
    
    // Emit custom event for reconnection handling
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("socket:reconnected"));
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
    if (reason === "io server disconnect") {
      // Server disconnected us, reconnect
      socket.connect();
    } else {
      // Start polling as fallback
      if (!isPollingActive) {
        isPollingActive = true;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("socket:disconnect"));
        }
      }
    }
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error);
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn("[Socket] Max reconnection attempts reached, switching to polling");
      isPollingActive = true;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("socket:fallback"));
      }
    }
  });

  // Order events (backend emits order:update, not order:status)
  socket.on("order:update", handleOrderStatusEvent);
  socket.on("order:created", handleOrderCreatedEvent);
}

/**
 * Join user-specific room for real-time order updates.
 * Clients use this instead of orders:global (which is staff-only).
 */
export function joinUserRoom(userId: string): void {
  const socket = getSocket();
  if (socket) {
    socket.emit("join", { rooms: [`user:${userId}`] });
  }
}

/**
 * Join orders:global — only authorized for staff roles.
 * Clients should use joinUserRoom() instead.
 */
export function joinOrdersGlobal(): void {
  const socket = getSocket();
  if (socket) {
    socket.emit("join", { rooms: ["orders:global"] });
  }
}

/**
 * Leave user-specific room
 */
export function leaveUserRoom(userId: string): void {
  const socket = getSocket();
  if (socket) {
    socket.emit("leave", {
      rooms: [`user:${userId}`]
    });
  }
}

/**
 * Check if socket is currently connected
 */
export function isConnected(): boolean {
  return socketInstance?.connected ?? false;
}

/**
 * Check if currently polling (fallback mode)
 */
export function isPolling(): boolean {
  return isPollingActive;
}

/**
 * Subscribe to order status events
 * Returns unsubscribe function
 */
export function onOrderStatus(callback: (data: { event: string; order: any }) => void): () => void {
  const socket = getSocket();
  if (!socket) {
    return () => {};
  }

  socket.on("order:update", callback);
  
  return () => {
    socket.off("order:update", callback);
  };
}