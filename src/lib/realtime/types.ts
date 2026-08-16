/**
 * Realtime Types for Socket.IO
 * Based on REALTIME_CONTRACT.md
 */

export enum OrderStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export interface OrderStatusEvent {
  event: "order:status";
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  updatedBy: string;
  timestamp: string;
}

export interface OrderCreatedEvent {
  event: "order:created";
  order: {
    id: string;
    items: any[];
    total: number;
    status: OrderStatus;
    table: string;
    sessionId: string;
    createdAt: string;
  };
  createdBy: string;
  timestamp: string;
}

export interface SocketConfig {
  url: string;
  options: {
    transports: ("websocket" | "polling")[];
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
  };
}