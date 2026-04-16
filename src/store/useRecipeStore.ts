import { create } from "zustand";

type Ingredient = {
  productId: string; 
  quantity: number;
};

type Recipe = {
  id: string;
  productId: string; 
  ingredients: Ingredient[];
};

type Store = {
  recipes: Recipe[];

  addRecipe: (data: Omit<Recipe, "id">) => void;
};

export const useRecipeStore = create<Store>((set) => ({
  recipes: [],

  addRecipe: (data) =>
    set((s) => ({
      recipes: [
        ...s.recipes,
        {
          ...data,
          id: crypto.randomUUID(),
        },
      ],
    })),
}));