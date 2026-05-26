/**
 * Socket.io Client Service
 * Servicio para manejar conexiones WebSocket en el frontend Desktop
 */

import { io, Socket } from "socket.io-client";
import { resolveTrackingSocketUrl } from "./socketConfig";

// Tipos de eventos
export interface ActivityLog {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  activityType: string;
  description: string;
  metadata?: Record<string, any>;
  shift?: string;
  timestamp: string;
}

export interface KPIData {
  userId: string;
  userName: string;
  productivityScore: number;
  totalSales: number;
  ordersCompleted: number;
  lastUpdated: string;
}

export interface PerformanceAlert {
  _id: string;
  userId: string;
  alertType: string;
  severity: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

export interface ShiftData {
  _id: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// Configuración
const SOCKET_URL = resolveTrackingSocketUrl();

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Conectar al servidor WebSocket
   */
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket?.connected) {
          console.log("[SocketService] Ya conectado");
          resolve();
          return;
        }

        console.log(`[SocketService] Conectando a ${SOCKET_URL}`);

        this.socket = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        this.socket.on("connect", () => {
          console.log(`[SocketService] ✅ Conectado: ${this.socket?.id}`);
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          console.error("[SocketService] ❌ Error de conexión:", error.message);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("[SocketService] Máximo de intentos de reconexión alcanzado");
            reject(error);
          }
        });

        this.socket.on("disconnect", (reason) => {
          console.log(`[SocketService] 🔌 Desconectado: ${reason}`);
        });

        this.socket.on("error", (error) => {
          console.error("[SocketService] Error:", error);
        });

        // Setup default listeners
        this.setupDefaultListeners();
      } catch (error) {
        console.error("[SocketService] Error iniciando conexión:", error);
        reject(error);
      }
    });
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      console.log("[SocketService] Desconectando...");
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Unirse a una room
   */
  joinRoom(room: string, ...args: any[]): void {
    if (!this.socket?.connected) {
      console.warn("[SocketService] No conectado, no se puede unir a room");
      return;
    }

    const eventMap: Record<string, string> = {
      "activity": "join:activity",
      "kpis": "join:kpis",
      "alerts": "join:alerts",
      "shifts": "join:shifts",
      "metrics": "join:metrics",
    };

    const event = eventMap[room] || `join:${room}`;
    this.socket.emit(event, ...args, (response: any) => {
      console.log(`[SocketService] Unido a room ${room}:`, response);
    });
  }

  /**
   * Salir de una room
   */
  leaveRoom(room: string, ...args: any[]): void {
    if (!this.socket?.connected) {
      console.warn("[SocketService] No conectado, no se puede salir de room");
      return;
    }

    const eventMap: Record<string, string> = {
      "activity": "leave:activity",
      "kpis": "leave:kpis",
      "alerts": "leave:alerts",
      "shifts": "leave:shifts",
      "metrics": "leave:metrics",
    };

    const event = eventMap[room] || `leave:${room}`;
    this.socket.emit(event, ...args, (response: any) => {
      console.log(`[SocketService] Salió de room ${room}:`, response);
    });
  }

  /**
   * Escuchar evento
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn("[SocketService] Socket no inicializado");
      return;
    }

    this.socket.on(event, callback);

    // Track listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Dejar de escuchar evento
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  /**
   * Emitir evento
   */
  emit(event: string, ...args: any[]): void {
    if (!this.socket?.connected) {
      console.warn("[SocketService] No conectado, no se puede emitir evento");
      return;
    }

    this.socket.emit(event, ...args);
  }

  /**
   * Setup listeners por defecto para eventos de tracking
   */
  private setupDefaultListeners(): void {
    if (!this.socket) return;

    // Activity events
    this.socket.on("activity:new", (data: ActivityLog) => {
      console.log("[SocketService] Nueva actividad:", data);
    });

    this.socket.on("activity:updated", (data: ActivityLog) => {
      console.log("[SocketService] Actividad actualizada:", data);
    });

    // KPI events
    this.socket.on("kpi:update", (data: KPIData) => {
      console.log("[SocketService] KPI actualizado:", data);
    });

    this.socket.on("kpi:ranking", (data: any[]) => {
      console.log("[SocketService] Ranking actualizado:", data);
    });

    // Alert events
    this.socket.on("alert:create", (data: PerformanceAlert) => {
      console.log("[SocketService] Nueva alerta:", data);
    });

    this.socket.on("alert:resolve", (data: PerformanceAlert) => {
      console.log("[SocketService] Alerta resuelta:", data);
    });

    // Shift events
    this.socket.on("shift:created", (data: ShiftData) => {
      console.log("[SocketService] Turno creado:", data);
    });

    this.socket.on("shift:updated", (data: ShiftData) => {
      console.log("[SocketService] Turno actualizado:", data);
    });

    this.socket.on("shift:deleted", (data: { id: string; shiftType: string }) => {
      console.log("[SocketService] Turno eliminado:", data);
    });

    this.socket.on("shift:assignment", (data: any) => {
      console.log("[SocketService] Nueva asignación de turno:", data);
    });

    this.socket.on("shift:attendance", (data: any) => {
      console.log("[SocketService] Registro de asistencia:", data);
    });

    // Metrics events
    this.socket.on("metrics:update", (data: any) => {
      console.log("[SocketService] Métricas actualizadas:", data);
    });

    this.socket.on("metrics:peak-hours", (data: any) => {
      console.log("[SocketService] Horas pico actualizadas:", data);
    });

    // System notifications
    this.socket.on("system:notification", (data: any) => {
      console.log("[SocketService] Notificación del sistema:", data);
    });
  }

  /**
   * Ping al servidor
   */
  ping(): Promise<{ pong: boolean; timestamp: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("No conectado"));
        return;
      }

      this.socket.emit("ping", (response: any) => {
        resolve(response);
      });
    });
  }

  /**
   * Limpiar todos los listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.listeners.clear();
    }
  }
}

// Exportar instancia singleton
export const socketService = new SocketService();

// Exportar hook de React para usar en componentes
export const useSocket = () => {
  return {
    socket: socketService,
    isConnected: socketService.isConnected(),
    connect: socketService.connect.bind(socketService),
    disconnect: socketService.disconnect.bind(socketService),
    joinRoom: socketService.joinRoom.bind(socketService),
    leaveRoom: socketService.leaveRoom.bind(socketService),
    on: socketService.on.bind(socketService),
    off: socketService.off.bind(socketService),
    emit: socketService.emit.bind(socketService),
    ping: socketService.ping.bind(socketService),
  };
};

export default socketService;
