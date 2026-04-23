import api from "../../../services/api";
import type { Order } from "../types/order";

/* ==============================
   GET ORDERS (POS READY)
============================== */
export const getOrders = async (params?: {
  status?: Order["status"];
  table?: string;
  sessionId?: string;
}): Promise<Order[]> => {
  const { data } = await api.get("/orders", { params });
  return Array.isArray(data) ? data : [];
};

/* ==============================
   GET ORDER BY ID
============================== */
export const getOrderById = async (id: string): Promise<Order> => {
  if (!id) throw new Error("Order ID is required");

  const { data } = await api.get(`/orders/${id}`);
  return data;
};

/* ==============================
   CREATE ORDER (STRICT POS FLOW)
============================== */
export const createOrder = async (order: {
  table: string;
  sessionId: string;
  items: {
    product: string;
    quantity: number;
  }[];
  notes?: string;
}): Promise<Order> => {

  if (!order.table) {
    throw new Error("Table is required for POS orders");
  }

  if (!order.sessionId) {
    throw new Error("SessionId is required for POS orders");
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  const payload = {
    table: order.table,
    sessionId: order.sessionId,

    //  SOLO MANDAS BASICO
    items: order.items.map((i) => ({
      product: i.product,
      quantity: i.quantity,
    })),

    notes: order.notes?.trim() ?? "",
  };

  const { data } = await api.post("/orders", payload);
  return data;
};

/* ==============================
   UPDATE ORDER STATUS (POS FLOW)
============================== */
export const updateOrderStatus = async (
  id: string,
  status: Order["status"]
): Promise<Order> => {
  const { data } = await api.patch(`/orders/${id}/status`, {
    status,
  });

  return data;
};
/* ==============================
   UPDATE ITEM STATUS (KITCHEN / BAR FLOW)
============================== */
export const updateOrderItemStatus = async (
  orderId: string,
  itemId: string,
  status: "pending" | "preparing" | "ready" | "delivered"
): Promise<Order> => {
  if (!orderId || !itemId) {
    throw new Error("orderId and itemId are required");
  }

  const { data } = await api.put(
    `/orders/${orderId}/items/${itemId}`,
    { status }
  );

  return data;
};

/* ==============================
   DELETE ORDER
============================== */
export const deleteOrder = async (id: string): Promise<void> => {
  if (!id) throw new Error("Order ID is required");

  await api.delete(`/orders/${id}`);
};