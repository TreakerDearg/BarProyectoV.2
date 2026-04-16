import { create } from "zustand";

type Item = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Store = {
  cart: Item[];
  add: (item: Omit<Item, "quantity">) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<Store>((set) => ({
  cart: [],

  add: (item) =>
    set((state) => {
      const existing = state.cart.find((i) => i.id === item.id);

      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }

      return {
        cart: [...state.cart, { ...item, quantity: 1 }],
      };
    }),

  remove: (id) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.id !== id),
    })),

  clear: () => set({ cart: [] }),
}));