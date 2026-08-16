"use client";

import { create } from "zustand";
import type { OrderStatus } from "@/lib/realtime/types";

interface OrderRealtimeState {
  orders: Map<string, { status: OrderStatus; updatedAt: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus, updatedAt: string) => void;
  removeOrder: (orderId: string) => void;
  clearOrders: () => void;
}

export const useOrdersStore = create<OrderRealtimeState>((set) => ({
  orders: new Map(),

  updateOrderStatus: (orderId, status, updatedAt) =>
    set((state) => {
      const newOrders = new Map(state.orders);
      newOrders.set(orderId, { status, updatedAt });
      return { orders: newOrders };
    }),

  removeOrder: (orderId) =>
    set((state) => {
      const newOrders = new Map(state.orders);
      newOrders.delete(orderId);
      return { orders: newOrders };
    }),

  clearOrders: () => set({ orders: new Map() }),
}));