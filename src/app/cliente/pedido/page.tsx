"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./pedido-ui.module.css";

import {
  getTables,
  getProducts,
  openTableSession,
  createOrder,
} from "@/lib/api/bartender";

import type { TableRow, ProductBrief } from "@/lib/types/api";

import { PedidoHeader } from "./components/PedidoHeader";
import { PedidoMesa } from "./components/PedidoMesa";
import { PedidoProductos } from "./components/PedidoProductos";
import { PedidoCarrito } from "./components/PedidoCarrito";
import { PedidoStatus } from "./components/PedidoStatus";

export default function PedidoPage() {
  /* =========================
     STATE
  ========================= */
  const [tables, setTables] = useState<TableRow[]>([]);
  const [products, setProducts] = useState<ProductBrief[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const [pickTable, setPickTable] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [opening, setOpening] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);

  /* =========================
     LOAD DATA
  ========================= */
  const loadTables = useCallback(async () => {
    try {
      setLoadingTables(true);
      const data = await getTables();
      setTables(data);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts({
        available: true,
        isActiveForPOS: true,
      });
      setProducts(data);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
    loadProducts();
  }, [loadTables, loadProducts]);

  /* =========================
     MESA
  ========================= */
  async function handleOpenSession() {
    if (!pickTable) {
      setMsg("Seleccioná una mesa");
      return;
    }

    try {
      setOpening(true);
      const { sessionId } = await openTableSession(pickTable);
      setSessionId(sessionId);
      setMsg("Mesa activada correctamente");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setOpening(false);
    }
  }

  /* =========================
     CART
  ========================= */
  function addToCart(product: ProductBrief) {
    setCart((prev) => {
      const exists = prev.find((p) => p.productId === product._id);

      if (exists) {
        return prev.map((p) =>
          p.productId === product._id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((p) => p.productId !== id));
  }

  function setLineQty(id: string, qty: number) {
    setCart((prev) =>
      prev.map((p) =>
        p.productId === id ? { ...p, quantity: qty } : p
      )
    );
  }

  /* =========================
     ORDER
  ========================= */
  async function handleSubmit() {
    if (!sessionId) {
      setMsg("Primero activá la mesa");
      return;
    }

    if (!cart.length) {
      setMsg("Carrito vacío");
      return;
    }

    try {
      setSubmitting(true);

      await createOrder({
        table: pickTable,
        sessionId,
        items: cart.map((c) => ({
          product: c.productId,
          quantity: c.quantity,
        })),
      });

      setCart([]);
      setMsg("Pedido enviado correctamente");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================
     PRICE
  ========================= */
  function priceOf(p: ProductBrief) {
    return p.dynamicPrice ?? p.price ?? 0;
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className={ui.container}>
      <PedidoHeader />

      <PedidoMesa
        tables={tables}
        pickTable={pickTable}
        setPickTable={setPickTable}
        handleOpenSession={handleOpenSession}
        loading={opening || loadingTables}
      />

      <PedidoProductos
        products={products}
        addToCart={addToCart}
        priceOf={priceOf}
        loading={loadingProducts}
      />

      <PedidoCarrito
        cart={cart}
        setLineQty={setLineQty}
        removeFromCart={removeFromCart}
        handleSubmit={handleSubmit}
        loading={submitting}
      />

      <PedidoStatus msg={msg} />
    </div>
  );
}