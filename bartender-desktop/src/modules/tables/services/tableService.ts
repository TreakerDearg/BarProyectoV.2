import api from "../../../services/api";
import type { Table } from "../types/table";
import { getSocket } from "../../../services/socket";

/* =========================================================
   TYPES DEFINITION
========================================================= */
export interface OrderItem {
  product?: string;
  menu?: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Payment {
  _id: string;
  table: string;
  order: string;
  sessionId: string;
  method: "cash" | "transfer" | "card" | "split" | "partial";
  amount: number;
  amountPaid: number;
  change: number;
  discount: number;
  notes: string;
  status: "pending" | "completed" | "refunded";
  items: OrderItem[];
  receipt?: {
    receiptNumber?: string;
    issuedAt?: string;
    items?: OrderItem[];
  };
  cardDetails?: {
    lastFour: string;
    cardType: string;
    authorizationCode?: string;
    terminalId?: string;
  };
  isSplit?: boolean;
  splitIndex?: number;
  splitTotal?: number;
  isPartial?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresAmount: boolean;
  disabled?: boolean;
}

/* =========================================================
   ENHANCED ERROR CLASS & HELPERS
========================================================= */
export class PaymentServiceError extends Error {
  statusCode: number;
  errorCode: string;
  originalError?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = "UNKNOWN_ERROR",
    originalError?: any
  ) {
    super(message);
    this.name = "PaymentServiceError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.originalError = originalError;
  }
}

export const getPaymentErrorMessage = (error: any): string => {
  if (error instanceof PaymentServiceError) {
    switch (error.errorCode) {
      case "INSUFFICIENT_FUNDS":
        return "Fondos insuficientes para completar la transacción.";
      case "CARD_DECLINED":
        return "La tarjeta fue rechazada por el banco emisor.";
      case "EXPIRED_CARD":
        return "La tarjeta ha caducado. Pruebe con otra.";
      case "INCORRECT_PIN":
        return "El PIN ingresado es incorrecto.";
      case "NETWORK_ERROR":
        return "Error de comunicación con el procesador de pagos.";
      case "TERMINAL_OFFLINE":
        return "La terminal de pago no responde o está fuera de línea.";
      case "UNAUTHORIZED":
        return "No autorizado para procesar el pago.";
      default:
        return error.message || "Error al procesar el pago.";
    }
  }
  return error?.message || "Ocurrió un error inesperado al procesar el pago.";
};

export const isNetworkError = (error: any): boolean => {
  if (error instanceof PaymentServiceError) {
    return error.errorCode === "NETWORK_ERROR" || error.errorCode === "TERMINAL_OFFLINE";
  }
  return error?.message?.toLowerCase().includes("network") || false;
};

/* =========================================================
   SAFE WRAPPER (Soporte Inteligente para Estructura de Respuestas)
========================================================= */
const safeRequest = async <T>(promise: Promise<any>): Promise<T> => {
  try {
    const response = await promise;
    // Si la respuesta es de Axios interceptada, response representa response.data
    // Si tiene un campo 'data' interno (estándar de response.js), lo devolvemos directo
    if (response && typeof response === "object" && "data" in response) {
      return response.data as T;
    }
    return response as T;
  } catch (error: any) {
    // Extraer detalles de error normalizado por Axios / Interceptor
    const msg = error?.message || "Error inesperado";
    const statusCode = error?.status || error?.response?.status || 500;
    const errorCode = error?.errorCode || error?.response?.data?.code || "UNKNOWN_ERROR";

    console.error("[Payment Service Error]:", {
      message: msg,
      statusCode,
      errorCode,
      fullError: error,
    });

    throw new PaymentServiceError(msg, statusCode, errorCode, error);
  }
};

/* =========================================================
   TABLES CORE REST OPERATIONS
========================================================= */
export const getTables = async (): Promise<Table[]> => {
  return safeRequest<Table[]>(api.get("/tables"));
};

export const getTableById = async (id: string): Promise<Table> => {
  return safeRequest<Table>(api.get(`/tables/${id}`));
};

export const createTable = async (table: Partial<Table>): Promise<Table> => {
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

export const updateTable = async (id: string, table: Partial<Table>): Promise<Table> => {
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

/* =========================================================
   TAGS MANAGEMENT
========================================================= */
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

export const removeTableTag = async (tableId: string, label: string): Promise<Table> => {
  return safeRequest<Table>(
    api.delete(`/tables/${tableId}/tags/${label}`)
  );
};

export const clearTableTags = async (tableId: string): Promise<Table> => {
  return safeRequest<Table>(
    api.delete(`/tables/${tableId}/tags`)
  );
};

/* =========================================================
   UNIFIED PAYMENTS INTEGRATION
========================================================= */
export const getAvailablePaymentMethods = async (): Promise<PaymentMethod[]> => {
  return safeRequest<PaymentMethod[]>(api.get("/payments/methods/available"));
};

export const getTablePayments = async (
  tableId: string,
  sessionId?: string
): Promise<any[]> => {
  const url = sessionId
    ? `/payments/table/${tableId}?sessionId=${sessionId}`
    : `/payments/table/${tableId}`;
  const response = await safeRequest<any>(api.get(url));
  
  // Extraer el array de pagos de forma segura
  if (Array.isArray(response)) return response;
  return response?.payments || response?.data || [];
};

export const getTableSessionHistory = async (tableId: string): Promise<any> => {
  return safeRequest<any>(api.get(`/tables/${tableId}/history`));
};

export const getSessionPayments = async (sessionId: string): Promise<any[]> => {
  const response = await safeRequest<any>(api.get(`/payments/session/${sessionId}`));
  if (Array.isArray(response)) return response;
  return response?.payments || response?.data || [];
};

export const getPaymentById = async (paymentId: string): Promise<Payment> => {
  return safeRequest<Payment>(api.get(`/payments/payment/${paymentId}`));
};

export const generateReceipt = async (paymentId: string): Promise<any> => {
  const response = await safeRequest<any>(api.get(`/payments/payment/${paymentId}/receipt`));
  return response?.data || response;
};

/* =========================================================
   BILL PAYMENT FLOWS
========================================================= */
export const createStandardPayment = async (data: {
  tableId: string;
  orderId: string;
  method: "cash" | "transfer";
  amountPaid: number;
  notes?: string;
}): Promise<any> => {
  return safeRequest<any>(api.post("/payments", data));
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

export interface SessionCheckoutPayload {
  tableId: string;
  sessionId: string;
  method: "cash" | "transfer" | "card" | "split";
  maintenanceMinutes?: number;
  paymentDetails?: {
    amountPaid?: number;
    notes?: string;
    totalSplits?: number;
    cardDetails?: {
      lastFour: string;
      cardType?: "visa" | "mastercard" | "amex" | "other";
      authorizationCode?: string;
      terminalId?: string;
    };
  };
}

export interface SessionCheckoutResult {
  payment: Payment;
  payments: Payment[];
  table: Table;
  receiptSummary: {
    sessionId: string;
    subtotal: number;
    discountTotal: number;
    total: number;
    method: string;
    amountPaid: number;
    change: number;
    maintenanceUntil: string;
    receiptNumber?: string;
    issuedAt?: string;
  };
  balanceDue: number;
}

export const createSessionCheckout = async (
  data: SessionCheckoutPayload
): Promise<SessionCheckoutResult> => {
  try {
    const result = await safeRequest<SessionCheckoutResult>(api.post("/payments/session-checkout", data));
    return result;
  } catch (error: any) {
    // Enhanced error handling for session checkout
    console.error("[Session Checkout Error]:", {
      error: error?.message,
      statusCode: error?.statusCode,
      errorCode: error?.errorCode,
      payload: data
    });
    
    // Re-throw with more specific error information
    if (error?.statusCode === 500) {
      throw new PaymentServiceError(
        "Error interno del servidor al procesar el pago. Por favor, inténtelo de nuevo.",
        500,
        "SERVER_ERROR",
        error
      );
    }
    
    throw error;
  }
};

/* =========================================================
   ANALYTICS & REPORTING
========================================================= */
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

/* =========================================================
   REAL-TIME (SOCKET LAYER)
========================================================= */
export const joinTableRoom = (tableId: string) => {
  const socket = getSocket();
  if (socket) socket.emit("join:table", tableId);
};

export const leaveTableRoom = (tableId: string) => {
  const socket = getSocket();
  if (socket) socket.emit("leave:table", tableId);
};

export const subscribeTables = (callback: (table: Table) => void) => {
  const socket = getSocket();
  const handler = (table: Table) => callback(table);
  if (socket) socket.on("table:update", handler);
  return () => {
    if (socket) socket.off("table:update", handler);
  };
};

export const subscribeTableRoom = (tableId: string, callback: (table: Table) => void) => {
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

export const disconnectTableSocket = () => {
  const socket = getSocket();
  if (socket) socket.off("table:update");
};

export default {
  // Tables CRUD
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableLayout,
  openTable,
  closeTable,

  // Tags
  addTableTag,
  removeTableTag,
  clearTableTags,

  // Payments & Receipts
  getAvailablePaymentMethods,
  getTablePayments,
  getTableSessionHistory,
  getSessionPayments,
  getPaymentById,
  generateReceipt,
  getPaymentErrorMessage,
  isNetworkError,

  // Cobro Flows
  createStandardPayment,
  createSplitPayment,
  createPartialPayment,
  createCardPayment,
  createSessionCheckout,

  // Analytics
  getTableAnalytics,
  getTableAnalyticsById,
  generateTableAnalytics,
  getTablePerformanceRanking,

  // Socket
  joinTableRoom,
  leaveTableRoom,
  subscribeTables,
  subscribeTableRoom,
  disconnectTableSocket,
};
