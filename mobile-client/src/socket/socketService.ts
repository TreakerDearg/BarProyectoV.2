import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";

const DEFAULT_SOCKET_URL = Platform.select({
  android: "https://barproyectov-2.onrender.com",
  ios: "https://barproyectov-2.onrender.com",
  default: "https://barproyectov-2.onrender.com",
});

export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || DEFAULT_SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;
  private currentTableId: string | null = null;
  private currentUserId: string | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Conectado exitosamente:", this.socket?.id);
      // Re-unir a las salas tras reconectar
      if (this.currentTableId) {
        this.joinTable(this.currentTableId);
      }
      if (this.currentUserId) {
        this.joinUser(this.currentUserId);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Desconectado:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.warn("[Socket] Error de conexión:", error.message);
    });
  }

  joinTable(tableId: string) {
    this.currentTableId = tableId;
    if (this.socket?.connected) {
      this.socket.emit("join:table", tableId);
      console.log(`[Socket] Unido a sala table:${tableId}`);
    }
  }

  leaveTable(tableId: string) {
    if (this.socket?.connected) {
      this.socket.emit("leave:table", tableId);
    }
    if (this.currentTableId === tableId) {
      this.currentTableId = null;
    }
  }

  joinUser(userId: string) {
    this.currentUserId = userId;
    if (this.socket?.connected) {
      this.socket.emit("join:user", userId);
    }
  }

  onOrderUpdate(callback: (order: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on("order:update", callback);
    this.socket?.on("order:updated", callback);
    return () => {
      this.socket?.off("order:update", callback);
      this.socket?.off("order:updated", callback);
    };
  }

  onItemReady(callback: (data: { orderId: string; itemId: string; item: any }) => void) {
    if (!this.socket) this.connect();
    this.socket?.on("item:ready", callback);
    return () => {
      this.socket?.off("item:ready", callback);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
