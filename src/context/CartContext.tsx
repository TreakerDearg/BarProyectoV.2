"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useClienteStore } from "@/stores/useClienteStore";
import type { ProductBrief, CartLine } from "@/lib/types/api";

export type AddToCartParams = {
  product: ProductBrief;
  quantity?: number;
  notes?: string;
};

type CartContextType = {
  cart: CartLine[];
  itemCount: number;
  total: number;
  addItem: (params: AddToCartParams) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  getItemQty: (productId: string) => number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useClienteStore((s) => s.cart);
  const addToCart = useClienteStore((s) => s.addToCart);
  const removeFromCart = useClienteStore((s) => s.removeFromCart);
  const setLineQty = useClienteStore((s) => s.setLineQty);
  const setLineNotes = useClienteStore((s) => s.setLineNotes);
  const clearCartStore = useClienteStore((s) => s.clearCart);
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addItem = useCallback(
    ({ product, quantity = 1, notes = "" }: AddToCartParams) => {
      addToCart({
        productId: product._id,
        name: product.name,
        quantity,
        notes,
      });
      setIsCartOpen(true);
    },
    [addToCart],
  );

  const removeItem = useCallback(
    (productId: string) => {
      removeFromCart(productId);
    },
    [removeFromCart],
  );

  const updateQty = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }
      setLineQty(productId, quantity);
    },
    [setLineQty, removeFromCart],
  );

  const updateNotes = useCallback(
    (productId: string, notes: string) => {
      setLineNotes(productId, notes);
    },
    [setLineNotes],
  );

  const clearCart = useCallback(() => {
    clearCartStore();
  }, [clearCartStore]);

  const getItemQty = useCallback(
    (productId: string): number => {
      const item = cart.find((l) => l.productId === productId);
      return item?.quantity ?? 0;
    },
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      itemCount,
      total,
      addItem,
      removeItem,
      updateQty,
      updateNotes,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      getItemQty,
    }),
    [
      cart,
      itemCount,
      total,
      addItem,
      removeItem,
      updateQty,
      updateNotes,
      clearCart,
      isCartOpen,
      getItemQty,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}