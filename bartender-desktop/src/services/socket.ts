/**
 * Socket.IO Client Service
 * Maneja la conexión en tiempo real con el backend para eventos de dashboard
 */

import { io, Socket } from "socket.io-client";

// Tipos de eventos que esperamos del servidor
export interface SocketEventMap {
  // Actividad
  "activity:new": { type: string; message: string; timestamp: string; data?: any };
  "activity:updated": { type: string; message: string; timestamp: string; data?: any };
  
  // KPIs
  "kpi:update": { userId?: string; kpis: any; timestamp: string };
  "kpi:ranking": { rankings: any[]; timestamp: string };
  
  // Alertas
  "alert:create": { type: string; message: string; severity: "low" | "medium" | "high"; timestamp: string };
  "alert:resolve": { alertId: string; timestamp: string };
  
  // Descuentos (nuevo)
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
  
  // Turnos
  "shift:created": { shiftId: string; shiftType: string; timestamp: string };
  "shift:updated": { shiftId: string; shiftType: string; timestamp: string };
  "shift:deleted": { shiftId: string; timestamp: string };
  
  // Métricas
  "metrics:update": { metrics: any; timestamp: string };
  
  // Sistema
  "system:notification": { message: string; type: "info" | "warning" | "error"; timestamp: string };
  
  // Menús
  "menu:created": { menuId: string; name?: string; timestamp: string };
  "menu:updated": { menuId: string; name?: string; timestamp: string };
  "menu:deleted": { menuId: string; timestamp: string };
  
  // Productos
  "product:created": { productId: string; name?: string; timestamp: string };
  "product:updated": { productId: string; name?: string; timestamp: string };
  "product:deleted": { productId: string; timestamp: string };
  "product:availability_changed": { productId: string; available: boolean; timestamp: string };
  
  // Recetas
  "recipe:created": { recipeId: string; name?: string; timestamp: string };
  "recipe:updated": { recipeId: string; name?: string; timestamp: string };
  "recipe:deleted": { recipeId: string; timestamp: string };
}

// Tipos de datos para eventos
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

/** Socket raíz: mesas, reservas, pedidos */
let mainSocket: Socket | null = null;
let mainConnectAttempts = 0;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Conectar al servidor Socket.IO
   */
  connect(token?: string): void {
    if (this.socket?.connected) {
      console.log("[Socket] Ya conectado");
      return;
    }

    // Determinar URL del servidor (desarrollo vs producción)
    const socketUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    console.log(`[Socket] Conectando a ${socketUrl}/tracking...`);

    this.socket = io(`${socketUrl}/tracking`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
  }

  /**
   * Configurar handlers de conexión y eventos generales
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[Socket]  Conectado al servidor");
      this.reconnectAttempts = 0;
      
      // Unirse a rooms por defecto
      this.joinRoom("activity");
      this.joinRoom("kpis");
      this.joinRoom("alerts");
      this.joinRoom("metrics");
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`[Socket] ❌ Desconectado: ${reason}`);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Socket] Error de conexión:", error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[Socket] Máximo de reintentos alcanzado");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`[Socket]  Reconectado después de ${attemptNumber} intentos`);
    });
  }

  /**
   * Unirse a una room específica
   */
  joinRoom(room: string, additionalParam?: string): void {
    if (!this.socket?.connected) {
      console.warn("[Socket] No conectado, no se puede unir a room:", room);
      return;
    }

    const roomName = additionalParam ? `${room}:${additionalParam}` : room;
    this.socket.emit(`join:${room}`, additionalParam, (_response: any) => {
      console.log(`[Socket] Unido a room: ${roomName}`);
    });
  }

  /**
   * Salir de una room
   */
  leaveRoom(room: string, additionalParam?: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit(`leave:${room}`, additionalParam, (_response: any) => {
      console.log(`[Socket] Salió de room: ${room}`);
    });
  }

  /**
   * Escuchar un evento específico
   */
  on<K extends keyof SocketEventMap>(
    event: K,
    callback: (data: SocketEventMap[K]) => void
  ): void {
    if (!this.socket) {
      console.warn("[Socket] Socket no inicializado, listener no agregado:", event);
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);
    this.socket.on(event, callback as any);
  }

  /**
   * Dejar de escuchar un evento
   */
  off<K extends keyof SocketEventMap>(
    event: K,
    callback?: (data: SocketEventMap[K]) => void
  ): void {
    if (!this.socket) return;

    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket.off(event, callback as any);
    } else {
      // Remover todos los listeners para este evento
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.forEach(cb => this.socket?.off(event, cb as any));
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Enviar un evento al servidor
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn("[Socket] No conectado, evento no enviado:", event);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    if (!this.socket) return;

    // Limpiar todos los listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(cb => this.socket?.off(event, cb as any));
    });
    this.listeners.clear();

    this.socket.disconnect();
    this.socket = null;
    console.log("[Socket] Desconectado manualmente");
  }

  /**
   * Verificar estado de conexión
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtener instancia de socket (para uso directo si necesario)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Exportar instancia singleton
export const socketService = new SocketService();

function getSocketUrl(): string {
  return import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
}

/**
 * Conecta al namespace raíz (mesas, reservas, pedidos).
 */
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

/** Tracking (dashboard) + raíz (salón) */
export function connectSalonSockets(token?: string): void {
  socketService.connect(token);
  connectMainSocket(token);
}

// Funciones de compatibilidad — salón usa socket raíz
export const getSocket = (): Socket | null => {
  const main = getMainSocket();
  if (main) return main;
  return socketService.getSocket();
};

export const disconnectSocket = (): void => {
  socketService.disconnect();
};

// Event handlers para menús
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

// Event handlers para productos
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

// Event handlers para recetas
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

// Export por defecto para compatibilidad
export default socketService;
