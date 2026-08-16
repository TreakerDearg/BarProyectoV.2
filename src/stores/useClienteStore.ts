"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, CartLine } from "@/lib/types/api";

type State = {
  token: string | null;
  user: AuthUser | null;
  tableId: string | null;
  sessionId: string | null;
  cart: CartLine[];
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  setTableSession: (tableId: string, sessionId: string) => void;
  clearTableSession: () => void;
  addToCart: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (productId: string) => void;
  setLineQty: (productId: string, quantity: number) => void;
  setLineNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  updateLinePrice: (productId: string, price: number) => void;
};

export const useClienteStore = create<State>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      tableId: null,
      sessionId: null,
      cart: [],

      setAuth: (token, user) =>
        set({ token, user, tableId: null, sessionId: null, cart: [] }),

      logout: () =>
        set({
          token: null,
          user: null,
          tableId: null,
          sessionId: null,
          cart: [],
        }),

      setTableSession: (tableId, sessionId) => set({ tableId, sessionId }),

      clearTableSession: () => set({ tableId: null, sessionId: null }),

      addToCart: ({ productId, name, quantity = 1, notes = "", price }) => {
        // Validaciones defensivas básicas
        if (!productId || productId.trim() === "") {
          console.warn("[addToCart] productId vacío, ignorando");
          return;
        }
        if (!name || name.trim() === "") {
          console.warn("[addToCart] name vacío, ignorando");
          return;
        }
        if (quantity <= 0) {
          console.warn("[addToCart] quantity inválido, ignorando");
          return;
        }
        if (price < 0) {
          console.warn("[addToCart] price negativo, ignorando");
          return;
        }

        const cart = [...get().cart];
        const i = cart.findIndex((l) => l.productId === productId);
        if (i >= 0) {
          cart[i] = {
            ...cart[i],
            quantity: cart[i].quantity + quantity,
            notes: notes || cart[i].notes,
            price: price, // Actualizar precio
          };
        } else {
          cart.push({ productId, name, quantity, notes, price });
        }
        set({ cart });
      },

      removeFromCart: (productId) =>
        set({ cart: get().cart.filter((l) => l.productId !== productId) }),

      setLineQty: (productId, quantity) => {
        if (quantity < 1) {
          set({ cart: get().cart.filter((l) => l.productId !== productId) });
          return;
        }
        set({
          cart: get().cart.map((l) =>
            l.productId === productId ? { ...l, quantity } : l,
          ),
        });
      },

      setLineNotes: (productId, notes) =>
        set({
          cart: get().cart.map((l) =>
            l.productId === productId ? { ...l, notes } : l,
          ),
        }),

      clearCart: () => set({ cart: [] }),

      updateLinePrice: (productId, price) => {
        if (price < 0) {
          console.warn("[updateLinePrice] price negativo, ignorando");
          return;
        }
        set({
          cart: get().cart.map((l) =>
            l.productId === productId ? { ...l, price } : l,
          ),
        });
      },
    }),
    { name: "bartender-client" },
  ),
);
