/* =========================================================
   TABLE SERVICE V2 - FAIL-SAFE REBUILD
   Servicio de tablas reconstruido con manejo de errores robusto
   Integración segura con sistema de pagos
========================================================= */

import api from "../../../services/api";

/* =========================================================
   TYPES
========================================================= */
export interface Table {
  _id: string;
  number: number;
  capacity: number;
  location: string;
  status: "available" | "occupied" | "reserved";
  currentSessionId?: string;
  currentOrderId?: string;
  lastPaymentAt?: Date;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  shape?: "rect" | "circle" | "square";
  notes?: string;
}

export interface Order {
  _id: string;
  table: string;
  sessionId: string;
  items: OrderItem[];
  status: string;
  paymentStatus: "pending" | "partial" | "paid";
  sessionStatus: "active" | "closed";
  total: number;
  subtotal: number;
  discount: number;
  finalTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

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
   ENHANCED ERROR CLASS
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

/* =========================================================
   SAFE WRAPPER V2 - Enhanced error handling
========================================================= */
const safeRequestV2 = async <T>(
  promise: Promise<any>,
  context: string = "API Request"
): Promise<T> => {
  try {
    const response = await promise;

    // Check for HTTP errors
    if (!response.data?.success) {
      const message = response.data?.message || "Error en la respuesta del servidor";
      const statusCode = response.status || 500;
      const errorCode = response.data?.code || "API_ERROR";

      console.error(`[${context}] API Error:`, {
        message,
        statusCode,
        errorCode,
        fullResponse: response.data
      });

      throw new PaymentServiceError(message, statusCode, errorCode, response.data);
    }

    return response.data as T;
  } catch (error: any) {
    // Handle Axios errors
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Error HTTP ${error.response.status}`;
      const statusCode = error.response.status;
      const errorCode = error.response.data?.code || "HTTP_ERROR";

      console.error(`[${context}] HTTP Error:`, {
        message,
        statusCode,
        errorCode,
        fullError: error
      });

      throw new PaymentServiceError(message, statusCode, errorCode, error);
    }

    // Handle network errors
    if (error.request) {
      const message = "Error de conexión con el servidor";
      console.error(`[${context}] Network Error:`, {
        message,
        fullError: error
      });

      throw new PaymentServiceError(message, 0, "NETWORK_ERROR", error);
    }

    // Handle other errors
    const message = error.message || "Error inesperado";
    console.error(`[${context}] Unexpected Error:`, {
      message,
      fullError: error
    });

    throw new PaymentServiceError(message, 500, "UNEXPECTED_ERROR", error);
  }
};

/* =========================================================
   TABLES API - V2
========================================================= */
export const getTablesV2 = async (): Promise<{ tables: Table[] }> => {
  return safeRequestV2<{ tables: Table[] }>(
    api.get("/tables"),
    "getTables"
  );
};

export const getTableByIdV2 = async (tableId: string): Promise<{ table: Table }> => {
  return safeRequestV2<{ table: Table }>(
    api.get(`/tables/${tableId}`),
    "getTableById"
  );
};

export const updateTableStatusV2 = async (
  tableId: string,
  status: Table["status"]
): Promise<{ table: Table }> => {
  return safeRequestV2<{ table: Table }>(
    api.patch(`/tables/${tableId}/status`, { status }),
    "updateTableStatus"
  );
};

/* =========================================================
   PAYMENTS API - V2
========================================================= */
export const getAvailablePaymentMethodsV2 = async (): Promise<{
  methods: PaymentMethod[]
}> => {
  return safeRequestV2<{ methods: PaymentMethod[] }>(
    api.get("/payments/methods/available"),
    "getAvailablePaymentMethods"
  );
};

export const createStandardPaymentV2 = async (paymentData: {
  tableId: string;
  orderId: string;
  method: "cash" | "transfer";
  amountPaid?: number;
  notes?: string;
}): Promise<{ payment: Payment }> => {
  return safeRequestV2<{ payment: Payment }>(
    api.post("/payments", paymentData),
    "createStandardPayment"
  );
};

export const createSplitPaymentV2 = async (paymentData: {
  tableId: string;
  orderId: string;
  totalSplits: number;
  method: "cash" | "transfer" | "card";
  amounts?: number[];
}): Promise<{ payments: Payment[] }> => {
  return safeRequestV2<{ payments: Payment[] }>(
    api.post("/payments/split", paymentData),
    "createSplitPayment"
  );
};

export const createPartialPaymentV2 = async (paymentData: {
  tableId: string;
  orderId: string;
  method: "cash" | "transfer" | "card";
  amount: number;
  amountPaid?: number;
}): Promise<{ payment: Payment; order: any }> => {
  return safeRequestV2<{ payment: Payment; order: any }>(
    api.post("/payments/partial", paymentData),
    "createPartialPayment"
  );
};

export const createCardPaymentV2 = async (paymentData: {
  tableId: string;
  orderId: string;
  cardDetails: {
    lastFour: string;
    cardType?: string;
    authorizationCode?: string;
    terminalId?: string;
  };
  amount?: number;
}): Promise<{ payment: Payment }> => {
  return safeRequestV2<{ payment: Payment }>(
    api.post("/payments/card", paymentData),
    "createCardPayment"
  );
};

export const getPaymentByIdV2 = async (paymentId: string): Promise<{
  payment: Payment
}> => {
  return safeRequestV2<{ payment: Payment }>(
    api.get(`/payments/payment/${paymentId}`),
    "getPaymentById"
  );
};

export const getTablePaymentsV2 = async (tableId: string): Promise<{
  payments: Payment[];
  count: number;
}> => {
  return safeRequestV2<{ payments: Payment[]; count: number }>(
    api.get(`/payments/table/${tableId}`),
    "getTablePayments"
  );
};

export const getSessionPaymentsV2 = async (sessionId: string): Promise<{
  payments: Payment[];
  count: number;
}> => {
  return safeRequestV2<{ payments: Payment[]; count: number }>(
    api.get(`/payments/session/${sessionId}`),
    "getSessionPayments"
  );
};

/* =========================================================
   ORDER API - V2
========================================================= */
export const getOrderByIdV2 = async (orderId: string): Promise<{
  order: Order
}> => {
  return safeRequestV2<{ order: Order }>(
    api.get(`/orders/${orderId}`),
    "getOrderById"
  );
};

export const getTableOrdersV2 = async (tableId: string): Promise<{
  orders: Order[]
}> => {
  return safeRequestV2<{ orders: Order[] }>(
    api.get(`/orders/table/${tableId}`),
    "getTableOrders"
  );
};

/* =========================================================
   UTILITY FUNCTIONS
========================================================= */
export const isPaymentServiceError = (error: any): error is PaymentServiceError => {
  return error instanceof PaymentServiceError;
};

export const getPaymentErrorMessage = (error: any): string => {
  if (isPaymentServiceError(error)) {
    return error.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "Error desconocido";
};

export const getPaymentErrorCode = (error: any): string => {
  if (isPaymentServiceError(error)) {
    return error.errorCode;
  }
  return "UNKNOWN_ERROR";
};

export const isNetworkError = (error: any): boolean => {
  return isPaymentServiceError(error) && error.errorCode === "NETWORK_ERROR";
};

export const isValidationError = (error: any): boolean => {
  return isPaymentServiceError(error) && error.errorCode === "VALIDATION_ERROR";
};

export const isNotFoundError = (error: any): boolean => {
  return isPaymentServiceError(error) && error.errorCode === "NOT_FOUND";
};

export default {
  // Tables
  getTablesV2,
  getTableByIdV2,
  updateTableStatusV2,

  // Payments
  getAvailablePaymentMethodsV2,
  createStandardPaymentV2,
  createSplitPaymentV2,
  createPartialPaymentV2,
  createCardPaymentV2,
  getPaymentByIdV2,
  getTablePaymentsV2,
  getSessionPaymentsV2,

  // Orders
  getOrderByIdV2,
  getTableOrdersV2,

  // Utilities
  isPaymentServiceError,
  getPaymentErrorMessage,
  getPaymentErrorCode,
  isNetworkError,
  isValidationError,
  isNotFoundError,
};
