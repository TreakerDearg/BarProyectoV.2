/**
 * Socket.IO Client Service
 * Maneja la conexión en tiempo real con el backend para eventos de dashboard
 */

import { io, Socket } from "socket.io-client";
import { resolveBackendBaseUrl, resolveTrackingSocketUrl } from "./socketConfig";

export interface SocketEventMap {
  "activity:new": { type: string; message: string; timestamp: string; data?: any };
  "activity:updated": { type: string; message: string; timestamp: string; data?: any };
  "kpi:update": { userId?: string; kpis: any; timestamp: string };
  "kpi:ranking": { rankings: any[]; timestamp: string };
  "alert:create": { type: string; message: string; severity: "low" | "medium" | "high"; timestamp: string };
  "alert:resolve": { alertId: string; timestamp: string };
  "discount:applied": {
    orderId: string;
    discountId?: string;
    amount: number;
    reason: string;
    type: "PERCENT" | "FLAT";
    timestamp: string;
    table?: string;
    appliedBy?: string;
  };
  "shift:created": { shiftId: string; shiftType: string; timestamp: string };
  "shift:updated": { shiftId: string; shiftType: string; timestamp: string };
  "shift:deleted": { shiftId: string; timestamp: string };
  "metrics:update": { metrics: any; timestamp: string };
  "system:notification": { message: string; type: "info" | "warning" | "error"; timestamp: string };
  "menu:created": { menuId: string; name?: string; timestamp: string };
  "menu:updated": { menuId: string; name?: string; timestamp: string };
  "menu:deleted": { menuId: string; timestamp: string };
  "product:created": { productId: string; name?: string; timestamp: string };
  "product:updated": { productId: string; name?: string; timestamp: string };
  "product:deleted": { productId: string; timestamp: string };
  "product:availability_changed": { productId: string; available: boolean; timestamp: string };
  "recipe:created": { recipeId: string; name?: string; timestamp: string };
  "recipe:updated": { recipeId: string; name?: string; timestamp: string };
  "recipe:deleted": { recipeId: string; timestamp: string };
  "inventory:created": { itemId: string; name: string; timestamp: string };
  "inventory:updated": { itemId: string; name: string; timestamp: string };
  "inventory:stock_changed": { itemId: string; name: string; stock: number; timestamp: string };
}

export interface MenuEventData {
  menuId: string;
  name?: string;
  timestamp: string;
}

export interface ProductEventData {
  productId: string;
  name?: string;
  available?: boolean;
  timestamp: string;
  product?: any;
  id?: string;
}

export interface RecipeEventData {
  recipeId: string;
  name?: string;
  timestamp: string;
}

export interface InventoryEventData {
  itemId: string;
  name: string;
  stock?: number;
  timestamp: string;
}

let mainSocket: Socket | null = null;
let mainConnectAttempts = 0;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();
  private listenersBound = false;

  connect(token?: string): void {
    if (this.socket?.connected) return;

    const socketUrl = resolveBackendBaseUrl();
    console.log(`[Socket] Conectando a ${socketUrl}/tracking...`);

    this.socket = io(resolveTrackingSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
    this.bindPendingListeners();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
      this.joinRoom("activity");
      this.joinRoom("kpis");
      this.joinRoom("alerts");
      this.joinRoom("metrics");
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Socket] Error de conexión:", error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[Socket] Máximo de reintentos alcanzado");
      }
    });
  }

  private bindPendingListeners(): void {
    if (!this.socket || this.listenersBound) return;

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => this.socket?.on(event, cb as any));
    });

    this.listenersBound = true;
  }

  joinRoom(room: string, additionalParam?: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit(`join:${room}`, additionalParam, () => {});
  }

  leaveRoom(room: string, additionalParam?: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit(`leave:${room}`, additionalParam, () => {});
  }

  on<K extends keyof SocketEventMap>(event: K, callback: (data: SocketEventMap[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const callbacks = this.listeners.get(event)!;
    if (callbacks.has(callback)) return;
    callbacks.add(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
      this.listenersBound = true;
    }
  }

  off<K extends keyof SocketEventMap>(event: K, callback?: (data: SocketEventMap[K]) => void): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback as any);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    callbacks.forEach((cb) => this.socket?.off(event, cb as any));
    this.listeners.delete(event);
  }

  emit(event: string, data?: any): void {
    if (!this.socket?.connected) return;
    this.socket.emit(event, data);
  }

  disconnect(): void {
    if (!this.socket) return;

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => this.socket?.off(event, cb as any));
    });
    this.listeners.clear();

    this.socket.disconnect();
    this.socket = null;
    this.listenersBound = false;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();

function getSocketUrl(): string {
  return resolveBackendBaseUrl();
}

export function connectMainSocket(token?: string): Socket {
  if (mainSocket?.connected) return mainSocket;

  const url = getSocketUrl();
  mainSocket = io(url, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  mainSocket.on("connect", () => {
    mainConnectAttempts = 0;
    mainSocket?.emit("join:orders");
  });

  mainSocket.on("connect_error", () => {
    mainConnectAttempts++;
  });

  return mainSocket;
}

export function getMainSocket(): Socket | null {
  return mainSocket;
}

export function disconnectMainSocket(): void {
  mainSocket?.disconnect();
  mainSocket = null;
}

export function connectSalonSockets(token?: string): void {
  socketService.connect(token);
  connectMainSocket(token);
}

export const getSocket = (): Socket | null => {
  const main = getMainSocket();
  if (main) return main;
  return socketService.getSocket();
};

export const disconnectSocket = (): void => {
  socketService.disconnect();
};

export const onMenuCreated = (callback: (data: MenuEventData) => void): (() => void) => {
  socketService.on("menu:created", callback);
  return () => socketService.off("menu:created", callback);
};

export const onMenuUpdated = (callback: (data: MenuEventData) => void): (() => void) => {
  socketService.on("menu:updated", callback);
  return () => socketService.off("menu:updated", callback);
};

export const onMenuDeleted = (callback: (data: MenuEventData) => void): (() => void) => {
  socketService.on("menu:deleted", callback);
  return () => socketService.off("menu:deleted", callback);
};

export const onProductCreated = (callback: (data: ProductEventData) => void): (() => void) => {
  socketService.on("product:created", callback);
  return () => socketService.off("product:created", callback);
};

export const onProductUpdated = (callback: (data: ProductEventData) => void): (() => void) => {
  socketService.on("product:updated", callback);
  return () => socketService.off("product:updated", callback);
};

export const onProductDeleted = (callback: (data: ProductEventData) => void): (() => void) => {
  socketService.on("product:deleted", callback);
  return () => socketService.off("product:deleted", callback);
};

export const onProductAvailabilityChanged = (callback: (data: ProductEventData) => void): (() => void) => {
  socketService.on("product:availability_changed", callback);
  return () => socketService.off("product:availability_changed", callback);
};

export const onRecipeCreated = (callback: (data: RecipeEventData) => void): (() => void) => {
  socketService.on("recipe:created", callback);
  return () => socketService.off("recipe:created", callback);
};

export const onRecipeUpdated = (callback: (data: RecipeEventData) => void): (() => void) => {
  socketService.on("recipe:updated", callback);
  return () => socketService.off("recipe:updated", callback);
};

export const onRecipeDeleted = (callback: (data: RecipeEventData) => void): (() => void) => {
  socketService.on("recipe:deleted", callback);
  return () => socketService.off("recipe:deleted", callback);
};

export const onInventoryCreated = (callback: (data: InventoryEventData) => void): (() => void) => {
  socketService.on("inventory:created", callback);
  return () => socketService.off("inventory:created", callback);
};

export const onInventoryUpdated = (callback: (data: InventoryEventData) => void): (() => void) => {
  socketService.on("inventory:updated", callback);
  return () => socketService.off("inventory:updated", callback);
};

export const onInventoryStockChanged = (callback: (data: InventoryEventData) => void): (() => void) => {
  socketService.on("inventory:stock_changed", callback);
  return () => socketService.off("inventory:stock_changed", callback);
};

export default socketService;

