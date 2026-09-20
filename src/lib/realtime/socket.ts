/**
 * Socket.IO Client for Web Client
 * Singleton: una sola conexión, listeners registrados una vez.
 */

import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth/tokenStorage";
import { resolveSocketBaseUrl } from "@/lib/api/network";
import type { SocketConfig } from "./types";
import { handleOrderStatusEvent, handleOrderCreatedEvent } from "./events";
import type { OrderPublicDTO, ReservationPublicDTO, DietaryRestriction } from "@/lib/types/api";

let socketInstance: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let isPollingActive = false;
let hadDisconnect = false;

type OrderUpdatePayload = { event?: string; order: OrderPublicDTO };
const orderStatusSubscribers = new Set<(data: OrderUpdatePayload) => void>();
const orderCreatedSubscribers = new Set<(data: OrderUpdatePayload) => void>();
const reservationSubscribers = new Set<(data: { event?: string; reservation: ReservationPublicDTO }) => void>();

type ProductAvailabilityPayload = {
  productId?: string;
  id?: string;
  available: boolean;
  product?: { _id?: string; id?: string; available?: boolean };
};
const productAvailabilitySubscribers = new Set<(data: ProductAvailabilityPayload) => void>();
const tableUpdateSubscribers = new Set<(data: { _id?: string; id?: string; status?: string }) => void>();

type TableRestrictionsPayload = {
  tableId: string;
  tableNumber: number;
  guestDietaryRestrictions: Array<{ guestName: string; restrictions: DietaryRestriction[]; notes?: string }>;
  timestamp: number;
};
const tableRestrictionsSubscribers = new Set<(data: TableRestrictionsPayload) => void>();

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

  const notifyOrderStatus = (data: OrderUpdatePayload) => {
    handleOrderStatusEvent({
      event: "order:status",
      orderId: data.order.id ?? "",
      previousStatus: data.order.status as import("./types").OrderStatus,
      newStatus: data.order.status as import("./types").OrderStatus,
      updatedBy: "system",
      timestamp: data.order.updatedAt ?? new Date().toISOString(),
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("order:updated", { detail: data }));
    }
    orderStatusSubscribers.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error("[Socket] order:update subscriber error:", err);
      }
    });
  };

  socket.on("order:update", notifyOrderStatus);
  socket.on("order:updated", notifyOrderStatus);

  const notifyOrderCreated = (data: OrderUpdatePayload) => {
    handleOrderCreatedEvent({
      event: "order:created",
      order: {
        id: data.order.id ?? "",
        items: data.order.items,
        total: data.order.total,
        status: data.order.status as import("./types").OrderStatus,
        table: data.order.table ?? "",
        sessionId: data.order.sessionId ?? "",
        createdAt: data.order.createdAt ?? new Date().toISOString(),
      },
      createdBy: data.order.userId ?? "system",
      timestamp: data.order.createdAt ?? new Date().toISOString(),
    });
    orderCreatedSubscribers.forEach((cb) => cb(data));
  };
  socket.on("order:created", notifyOrderCreated);

  const notifyReservation = (data: { event?: string; reservation: ReservationPublicDTO }) => {
    reservationSubscribers.forEach((cb) => cb(data));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(data.event === "reservation:created" ? "reservation:created" : "reservation:updated", { detail: data }));
    }
  };
  socket.on("reservation:created", (reservation: ReservationPublicDTO) => notifyReservation({ event: "reservation:created", reservation }));
  socket.on("reservation:update", (reservation: ReservationPublicDTO) => notifyReservation({ event: "reservation:update", reservation }));
  socket.on("reservation:updated", (reservation: ReservationPublicDTO) => notifyReservation({ event: "reservation:updated", reservation }));

  const notifyProductAvailability = (data: ProductAvailabilityPayload) => {
    productAvailabilitySubscribers.forEach((cb) => cb(data));
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("product:availability_changed", { detail: data }));
  };
  socket.on("product:availability_changed", notifyProductAvailability);

  const notifyTableUpdate = (data: { _id?: string; id?: string; status?: string }) => {
    tableUpdateSubscribers.forEach((cb) => cb(data));
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("table:update", { detail: data }));
  };
  socket.on("table:update", notifyTableUpdate);
  socket.on("table:updated", notifyTableUpdate);

  socket.on("table:restrictions", (data: TableRestrictionsPayload) => {
    tableRestrictionsSubscribers.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error("[Socket] table:restrictions subscriber error:", err);
      }
    });
  });
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
  return () => orderStatusSubscribers.delete(callback);
}

export function onOrderCreated(
  callback: (data: OrderUpdatePayload) => void
): () => void {
  orderCreatedSubscribers.add(callback);
  return () => orderCreatedSubscribers.delete(callback);
}

export function onReservation(
  callback: (data: { event?: string; reservation: ReservationPublicDTO }) => void
): () => void {
  reservationSubscribers.add(callback);
  return () => reservationSubscribers.delete(callback);
}

export function onProductAvailability(
  callback: (data: ProductAvailabilityPayload) => void
): () => void {
  productAvailabilitySubscribers.add(callback);
  return () => productAvailabilitySubscribers.delete(callback);
}

export function onTableUpdate(callback: (data: { _id?: string; id?: string; status?: string }) => void): () => void {
  tableUpdateSubscribers.add(callback);
  return () => tableUpdateSubscribers.delete(callback);
}

export function onTableRestrictions(
  callback: (data: TableRestrictionsPayload) => void
): () => void {
  tableRestrictionsSubscribers.add(callback);
  return () => {
    tableRestrictionsSubscribers.delete(callback);
  };
}
