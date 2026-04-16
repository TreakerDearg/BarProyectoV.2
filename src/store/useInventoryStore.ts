import { create } from "zustand";

type Ingredient = {
  id: string;
  name: string;
  stock: number;
  unit: string; // ml, g, unidades
};

type Store = {
  ingredients: Ingredient[];

  add: (item: Omit<Ingredient, "id">) => void;
  update: (id: string, data: Partial<Ingredient>) => void;
  remove: (id: string) => void;
};

export const useInventoryStore = create<Store>((set) => ({
  ingredients: [
    { id: "ron", name: "Ron", stock: 5000, unit: "ml" },
    { id: "menta", name: "Menta", stock: 200, unit: "g" },
  ],

  add: (item) =>
    set((s) => ({
      ingredients: [
        ...s.ingredients,
        { ...item, id: crypto.randomUUID() },
      ],
    })),

  update: (id, data) =>
    set((s) => ({
      ingredients: s.ingredients.map((i) =>
        i.id === id ? { ...i, ...data } : i
      ),
    })),

  remove: (id) =>
    set((s) => ({
      ingredients: s.ingredients.filter((i) => i.id !== id),
    })),
}));