import { create } from "zustand";
import { useInventoryStore } from "./useInventoryStore";
import { useRecipeStore } from "./useRecipeStore";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered";
};

type Store = {
  orders: Order[];

  createOrder: (items: OrderItem[]) => string;
  updateStatus: (id: string, status: Order["status"]) => void;
};

export const useOrderStore = create<Store>((set) => ({
  orders: [],

  createOrder: (items) => {
    const inventoryStore = useInventoryStore.getState();
    const recipeStore = useRecipeStore.getState();

    //  calcular total
    const total = items.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );

    // =========================
    //  VALIDACIÓN DE STOCK
    // =========================
    for (const item of items) {
      const recipe = recipeStore.recipes.find(
        (r) => r.name === item.name
      );

      if (!recipe) continue;

      for (const ing of recipe.ingredients) {
        const product = inventoryStore.products.find(
          (p) => p.id === ing.productId
        );

        if (!product) continue;

        const required = ing.quantity * item.quantity;

        if (product.stock < required) {
          throw new Error(
            `Stock insuficiente: ${product.name}`
          );
        }
      }
    }

    // ========================
    // DESCONTAR STOCK
    // ========================
    items.forEach((item) => {
      const recipe = recipeStore.recipes.find(
        (r) => r.name === item.name
      );

      if (!recipe) return;

      recipe.ingredients.forEach((ing) => {
        const product = inventoryStore.products.find(
          (p) => p.id === ing.productId
        );

        if (!product) return;

        inventoryStore.update(ing.productId, {
          stock:
            product.stock - ing.quantity * item.quantity,
        });
      });
    });

    // =========================
    //  CREAR PEDIDO
    // =========================
    const newOrder: Order = {
      id: "ORD-" + Math.floor(Math.random() * 10000),
      items,
      total,
      status: "pending",
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
    }));

    return newOrder.id;
  },

  updateStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    })),
}));