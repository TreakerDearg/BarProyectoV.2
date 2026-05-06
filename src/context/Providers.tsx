"use client";

import type { ReactNode } from "react";
import { CartProvider } from "./CartContext";
import { ToastProvider } from "./ToastContext";
import { UIProvider } from "./UIContext";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <UIProvider>
      <CartProvider>
        <ToastProvider>{children}</ToastProvider>
      </CartProvider>
    </UIProvider>
  );
}