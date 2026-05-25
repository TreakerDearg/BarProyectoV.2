import api from "../../../services/api";
import type { Table } from "../types/table";
import { getSocket } from "../../../services/socket";

/* ==============================
   SAFE WRAPPER
============================== */
const safeRequest = async <T>(promise: Promise<any>): Promise<T> => {
  try {
    const { data } = await promise;
    return data as T;
  } catch (error: any) {
    const msg =
      error?.response?.data?.error ||
      error?.message ||
      "Unexpected error";

    throw new Error(msg);
  }
};

/* ==============================
   TABLES (REST)
============================== */
export const getTables = async (): Promise<Table[]> => {
  return safeRequest<Table[]>(api.get("/tables"));
};

export const getTableById = async (id: string): Promise<Table> => {
  return safeRequest<Table>(api.get(`/tables/${id}`));
};

export const createTable = async (
  table: Partial<Table>
): Promise<Table> => {
  return safeRequest<Table>(
    api.post("/tables", {
      number: table.number,
      capacity: table.capacity,
      location: table.location ?? "indoor",
      notes: table.notes,
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      shape: table.shape ?? "square",
    })
  );
};

export const updateTable = async (
  id: string,
  table: Partial<Table>
): Promise<Table> => {
  return safeRequest<Table>(api.put(`/tables/${id}`, table));
};

export const deleteTable = async (id: string): Promise<void> => {
  await safeRequest(api.delete(`/tables/${id}`));
};

export const updateTableLayout = async (
  id: string,
  layout: { x: number; y: number; width?: number; height?: number }
): Promise<Table> => {
  return safeRequest<Table>(api.put(`/tables/${id}`, layout));
};

export const openTable = async (id: string): Promise<Table> => {
  const result = await safeRequest<any>(api.post(`/tables/${id}/open`));
  return result.table ? result.table : result;
};

export const closeTable = async (
  id: string,
  options?: { goToMaintenance?: boolean; maintenanceMinutes?: number }
): Promise<Table> => {
  return safeRequest<Table>(
    api.post(`/tables/${id}/close`, options || {})
  );
};

/* ==============================
   TAGS
============================== */
export const addTableTag = async (
  tableId: string,
  tag: {
    label: string;
    type?: "allergy" | "diet" | "preference" | "warning" | "other";
    priority?: "low" | "medium" | "high";
  }
): Promise<Table> => {
  return safeRequest<Table>(
    api.post(`/tables/${tableId}/tags`, tag)
  );
};

export const removeTableTag = async (
  tableId: string,
  label: string
): Promise<Table> => {
  return safeRequest<Table>(
    api.delete(`/tables/${tableId}/tags/${label}`)
  );
};

export const clearTableTags = async (
  tableId: string
): Promise<Table> => {
  return safeRequest<Table>(
    api.delete(`/tables/${tableId}/tags`)
  );
};

/* ==============================
   PAYMENTS (Integración con Payment)
============================== */
export const getTablePayments = async (
  tableId: string,
  sessionId?: string
): Promise<any[]> => {
  const url = sessionId
    ? `/payments/table/${tableId}?sessionId=${sessionId}`
    : `/payments/table/${tableId}`;
  return safeRequest<any[]>(api.get(url));
};

export const getTableSessionHistory = async (
  tableId: string
): Promise<any> => {
  return safeRequest<any>(api.get(`/tables/${tableId}/history`));
};

export const generateReceipt = async (
  paymentId: string
): Promise<any> => {
  return safeRequest<any>(api.get(`/payments/payment/${paymentId}/receipt`));
};

/* ==============================
   NEW PAYMENT METHODS
============================== */
export const getAvailablePaymentMethods = async (): Promise<any[]> => {
  return safeRequest<any[]>(api.get("/payments/methods/available"));
};

export const createSplitPayment = async (data: {
  tableId: string;
  orderId: string;
  totalSplits: number;
  method: string;
  amounts?: number[];
}): Promise<any> => {
  return safeRequest<any>(api.post("/payments/split", data));
};

export const createPartialPayment = async (data: {
  tableId: string;
  orderId: string;
  amount: number;
  method: string;
  amountPaid?: number;
}): Promise<any> => {
  return safeRequest<any>(api.post("/payments/partial", data));
};

export const createCardPayment = async (data: {
  tableId: string;
  orderId: string;
  cardDetails: {
    lastFour: string;
    cardType?: string;
    authorizationCode?: string;
    terminalId?: string;
  };
  amount?: number;
}): Promise<any> => {
  return safeRequest<any>(api.post("/payments/card", data));
};

export const createStandardPayment = async (data: {
  tableId: string;
  orderId: string;
  method: "cash" | "transfer";
  amountPaid: number;
  notes?: string;
}): Promise<any> => {
  return safeRequest<any>(api.post("/payments", data));
};

/* ==============================
   ANALYTICS
============================== */
export const getTableAnalytics = async (params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  return safeRequest<any>(api.get("/tables/analytics", { params }));
};

export const getTableAnalyticsById = async (
  tableId: string,
  params?: { period?: string; limit?: number }
): Promise<any> => {
  return safeRequest<any>(api.get(`/tables/${tableId}/analytics`, { params }));
};

export const generateTableAnalytics = async (
  tableId: string,
  data: { date: string; period?: string }
): Promise<any> => {
  return safeRequest<any>(api.post(`/tables/${tableId}/analytics/generate`, data));
};

export const getTablePerformanceRanking = async (params?: {
  period?: string;
  limit?: number;
}): Promise<any> => {
  return safeRequest<any>(api.get("/tables/analytics/ranking", { params }));
};

/* ==============================
   REAL-TIME (SOCKET LAYER)
============================== */

/**
 * Escuchar cambios de una mesa específica
 */
export const joinTableRoom = (tableId: string) => {
  const socket = getSocket();
  if (socket) socket.emit("join:table", tableId);
};

export const leaveTableRoom = (tableId: string) => {
  const socket = getSocket();
  if (socket) socket.emit("leave:table", tableId);
};

/**
 * STREAM GLOBAL DE MESAS
 */
export const subscribeTables = (
  callback: (table: Table) => void
) => {
  const socket = getSocket();
  const handler = (table: Table) => callback(table);

  if (socket) socket.on("table:update", handler);

  return () => {
    if (socket) socket.off("table:update", handler);
  };
};

/**
 * STREAM DE UNA MESA ESPECÍFICA (ROOM READY)
 */
export const subscribeTableRoom = (
  tableId: string,
  callback: (table: Table) => void
) => {
  joinTableRoom(tableId);

  const socket = getSocket();
  const handler = (table: Table) => {
    if (table._id === tableId) {
      callback(table);
    }
  };

  if (socket) socket.on("table:update", handler);

  return () => {
    if (socket) socket.off("table:update", handler);
    leaveTableRoom(tableId);
  };
};

/**
 * CLEANUP GLOBAL (opcional)
 */
export const disconnectTableSocket = () => {
  const socket = getSocket();
  if (socket) socket.off("table:update");
};
