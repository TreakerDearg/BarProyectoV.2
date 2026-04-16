import { create } from "zustand";

type RouletteItem = {
  productId: any; // ahora viene poblado desde backend
  weight: number;
  enabled: boolean;
};

type Store = {
  items: RouletteItem[];
  loading: boolean;

  setItems: (items: RouletteItem[]) => void;
  fetchItems: () => Promise<void>;
  updateLocal: (productId: string, data: Partial<RouletteItem>) => void;
};

export const useRouletteStore = create<Store>((set) => ({
  items: [],
  loading: false,

  setItems: (items) => set({ items }),

  // 🔥 traer desde backend
  fetchItems: async () => {
    set({ loading: true });

    const res = await fetch("http://localhost:5000/api/roulette");
    const data = await res.json();

    set({ items: data, loading: false });
  },

  // ⚡ SOLO UI (no guarda en backend)
  updateLocal: (productId, data) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.productId._id === productId
          ? { ...i, ...data }
          : i
      ),
    })),
}));