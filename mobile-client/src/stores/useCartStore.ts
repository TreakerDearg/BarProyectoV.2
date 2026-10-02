import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CartLine, AppliedCoupon } from "../types/api";

interface CartState {
  cart: CartLine[];
  appliedCoupon: AppliedCoupon | null;
  tipPercent: number;
  addToCart: (item: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (productId: string) => void;
  setLineQty: (productId: string, quantity: number) => void;
  setLineNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  setTipPercent: (percent: number) => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTipAmount: () => number;
  getTotalWithTipAndDiscount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      appliedCoupon: null,
      tipPercent: 10,

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

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      removeCoupon: () => set({ appliedCoupon: null }),

      setTipPercent: (percent) => set({ tipPercent: percent }),

      getSubtotal: () => get().cart.reduce((s, i) => s + i.price * i.quantity, 0),

      getDiscountAmount: () => {
        const { appliedCoupon, getSubtotal } = get();
        if (!appliedCoupon) return 0;
        const subtotal = getSubtotal();
        if (appliedCoupon.type === 'PERCENT') return Math.round(subtotal * appliedCoupon.value / 100);
        if (appliedCoupon.type === 'FLAT') return Math.min(appliedCoupon.value, subtotal);
        return 0;
      },

      getTipAmount: () => {
        const base = get().getSubtotal() - get().getDiscountAmount();
        return Math.round(base * get().tipPercent / 100);
      },

      getTotalWithTipAndDiscount: () =>
        get().getSubtotal() - get().getDiscountAmount() + get().getTipAmount(),
    }),
    {
      name: "nebula-cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
