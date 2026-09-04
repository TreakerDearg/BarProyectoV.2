/**
 * Socket.IO Client for Web Client
 * Singleton: una sola conexión, listeners registrados una vez.
 */

import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth/tokenStorage";
import { resolveSocketBaseUrl } from "@/lib/api/network";
import type { SocketConfig } from "./types";
import { handleOrderStatusEvent, handleOrderCreatedEvent } from "./events";

let socketInstance: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let isPollingActive = false;
let hadDisconnect = false;

type OrderUpdatePayload = { event?: string; order: any };
const orderStatusSubscribers = new Set<(data: OrderUpdatePayload) => void>();

export function initSocket(): Socket {
  if (socketInstance) {
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  const config: SocketConfig = {
    url: resolveSocketBaseUrl(),
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

export function getSocket(): Socket | null {
  return socketInstance ?? initSocket();
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
    reconnectAttempts = 0;
    hadDisconnect = false;
  }
}

function setupSocketListeners(socket: Socket): void {
  socket.on("connect", () => {
    reconnectAttempts = 0;
    isPollingActive = false;

    // Solo avisar a la UI en reconexión real, no en el primer connect
    // (evita recargar carta/mesas y el titileo de /cliente/pedido).
    if (hadDisconnect && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("socket:reconnected"));
    }
    hadDisconnect = false;
  });

  socket.on("disconnect", (reason) => {
    hadDisconnect = true;
    if (reason === "io server disconnect") {
      socket.connect();
    } else if (!isPollingActive) {
      isPollingActive = true;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("socket:disconnect"));
      }
    }
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error);
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      isPollingActive = true;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("socket:fallback"));
      }
    }
  });

  socket.on("order:update", (data: OrderUpdatePayload) => {
    handleOrderStatusEvent(data as any);
    orderStatusSubscribers.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error("[Socket] order:update subscriber error:", err);
      }
    });
  });

  socket.on("order:created", handleOrderCreatedEvent);
}

export function joinUserRoom(userId: string): void {
  const socket = getSocket();
  if (socket) {
    socket.emit("join", { rooms: [`user:${userId}`] });
  }
}

export function joinOrdersGlobal(): void {
  const socket = getSocket();
  if (socket) {
    socket.emit("join", { rooms: ["orders:global"] });
  }
}

export function leaveUserRoom(userId: string): void {
  const socket = getSocket();
  if (socket) {
    socket.emit("leave", { rooms: [`user:${userId}`] });
  }
}

export function isConnected(): boolean {
  return socketInstance?.connected ?? false;
}

export function isPolling(): boolean {
  return isPollingActive;
}

export function onOrderStatus(
  callback: (data: OrderUpdatePayload) => void
): () => void {
  orderStatusSubscribers.add(callback);
  return () => {
    orderStatusSubscribers.delete(callback);
  };
}
