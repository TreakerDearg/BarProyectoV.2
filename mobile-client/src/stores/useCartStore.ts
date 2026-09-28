import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CartLine } from "../types/api";

interface CartState {
  cart: CartLine[];
  addToCart: (item: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (productId: string) => void;
  setLineQty: (productId: string, quantity: number) => void;
  setLineNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: ({ productId, name, price, notes = "", image, quantity = 1 }) => {
        if (!productId || price < 0 || quantity <= 0) return;

        const current = [...get().cart];
        const existingIndex = current.findIndex((item) => item.productId === productId);

        if (existingIndex >= 0) {
          current[existingIndex] = {
            ...current[existingIndex],
            quantity: current[existingIndex].quantity + quantity,
            notes: notes || current[existingIndex].notes,
          };
          set({ cart: current });
        } else {
          set({
            cart: [...current, { productId, name, price, quantity, notes, image }],
          });
        }
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((i) => i.productId !== productId) });
      },

      setLineQty: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cart: get().cart.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        });
      },

      setLineNotes: (productId, notes) => {
        set({
          cart: get().cart.map((i) => (i.productId === productId ? { ...i, notes } : i)),
        });
      },

      clearCart: () => set({ cart: [] }),

      getTotalItems: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "nebula-cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
