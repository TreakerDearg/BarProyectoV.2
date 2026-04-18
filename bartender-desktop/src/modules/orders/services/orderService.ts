import api from "../../../services/api";
import type { Order } from "../types/order";

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await api.get("/orders");
  return data;
};

export const createOrder = async (order: Order): Promise<Order> => {
  const { data } = await api.post("/orders", order);
  return data;
};

export const updateOrder = async (
  id: string,
  order: Partial<Order>
): Promise<Order> => {
  const { data } = await api.put(`/orders/${id}`, order);
  return data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};