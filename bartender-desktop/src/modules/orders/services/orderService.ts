import api from "../../../services/api";
import type { Order } from "../types/order";

/* ==============================
   TYPES
============================== */
export type DiscountType = "PERCENT" | "FLAT";

export interface ApplyDiscountPayload {
  orderId: string;
  type: DiscountType;
  value: number;
  items?: string[];
  reason: string;
  note?: string;
}

/* ==============================
   ERROR HANDLER
============================== */
const extractError = (error: any): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unexpected error"
  );
};

/* ==============================
   GET ORDERS
============================== */
export const getOrders = async (params?: {
  status?: Order["status"];
  table?: string;
  sessionId?: string;
  sessionStatus?: "open" | "closed";
}): Promise<Order[]> => {
  try {
    const { data } = await api.get("/orders", { params });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* ==============================
   GET ORDER BY ID
============================== */
export const getOrderById = async (id: string): Promise<Order> => {
  if (!id) throw new Error("Order ID is required");

  try {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* ==============================
   CREATE ORDER (SNAPSHOT SAFE)
============================== */
export const createOrder = async (order: {
  table: string;
  sessionId: string;
  items: {
    product: string; // 👈 FIX: volver a "product"
    quantity: number;
  }[];
  notes?: string;
}): Promise<Order> => {
  if (!order.table) throw new Error("Table is required");
  if (!order.sessionId) throw new Error("SessionId is required");

  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw new Error("Order must have items");
  }

  const cleanItems = order.items
    .filter(i => i.product && i.quantity > 0)
    .map(i => ({
      product: String(i.product), // 👈 IMPORTANTE
      quantity: Number(i.quantity),
    }));

  if (cleanItems.length === 0) {
    throw new Error("Invalid items");
  }

  const payload = {
    table: String(order.table),
    sessionId: String(order.sessionId),
    items: cleanItems,
    notes: order.notes?.trim() ?? "",
  };

  console.log("🧾 CREATE ORDER PAYLOAD =>", payload);

  const { data } = await api.post("/orders", payload);
  return data;
};
/* ==============================
   UPDATE ORDER STATUS
============================== */
export const updateOrderStatus = async (
  id: string,
  status: Order["status"]
): Promise<Order> => {
  if (!id) throw new Error("Order ID is required");

  try {
    const { data } = await api.patch(`/orders/${id}/status`, {
      status,
    });

    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* ==============================
   UPDATE ITEM STATUS
============================== */
export const updateOrderItemStatus = async (
  orderId: string,
  itemId: string,
  status: "pending" | "preparing" | "ready" | "served"
): Promise<Order> => {

  if (!orderId || !itemId) {
    throw new Error("orderId and itemId are required");
  }

  try {
    const { data } = await api.patch(
      `/orders/${orderId}/item/${itemId}/status`,
      { status }
    );

    return data;

  } catch (error) {
    throw new Error(extractError(error));
  }
};

/* ==============================
   APPLY DISCOUNT
============================== */
export const applyDiscount = async (
  payload: ApplyDiscountPayload
): Promise<Order> => {

  const { orderId, ...body } = payload;

  if (!orderId) throw new Error("orderId is required");
  if (!body.value || body.value <= 0) {
    throw new Error("Invalid discount value");
  }

  try {
    const { data } = await api.post(
      `/orders/${orderId}/discount`,
      body
    );

    return data;

  } catch (error: any) {
    throw new Error(extractError(error));
  }
};

/* ==============================
   DELETE ORDER
============================== */
export const deleteOrder = async (id: string): Promise<void> => {
  if (!id) throw new Error("Order ID is required");

  try {
    await api.delete(`/orders/${id}`);
  } catch (error) {
    throw new Error(extractError(error));
  }
};