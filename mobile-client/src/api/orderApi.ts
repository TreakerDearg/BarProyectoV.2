import { api } from "./client";
import type { ApiResponse, OrderPublicDTO } from "../types/api";

export interface CreateOrderPayload {
  table: string;
  sessionId: string;
  items: {
    product: string;
    quantity: number;
    notes?: string;
  }[];
  notes?: string;
  priority?: "low" | "normal" | "high";
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderPublicDTO> {
  const res = await api.post<ApiResponse<OrderPublicDTO>>("/orders", payload);
  return res.data.data;
}

export async function getOrderById(id: string): Promise<OrderPublicDTO> {
  const res = await api.get<ApiResponse<OrderPublicDTO>>(`/orders/${id}`);
  return res.data.data;
}
