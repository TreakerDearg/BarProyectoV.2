import { create } from "zustand";

type Product = {
  id: string;
  name: string;
  price: number;
  category?: string;
};

type Store = {
  products: Product[];

  add: (data: Omit<Product, "id">) => void;
  update: (id: string, data: Partial<Product>) => void;
  remove: (id: string) => void;
};

export const useProductStore = create<Store>((set) => ({
  products: [
    { id: "mojito", name: "Mojito", price: 2500, category: "Cocktail" },
    { id: "fernet", name: "Fernet", price: 2000, category: "Clásico" },
  ],

  add: (data) =>
    set((s) => ({
      products: [
        ...s.products,
        { ...data, id: crypto.randomUUID() },
      ],
    })),

  update: (id, data) =>
    set((s) => ({
      products: s.products.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),

  remove: (id) =>
    set((s) => ({
      products: s.products.filter((p) => p.id !== id),
    })),
}));