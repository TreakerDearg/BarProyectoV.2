"use client";

import { useEffect, useState, useCallback } from "react";
import ui from "./pedido-ui.module.css";

import {
  getTables,
  getProducts,
  openTableSession,
  createOrder,
} from "@/lib/api/bartender";

import type { TableRow, ProductBrief } from "@/lib/types/api";
import { useClienteStore } from "@/stores/useClienteStore";

import { PedidoHeader } from "./components/PedidoHeader";
import { PedidoMesa } from "./components/PedidoMesa";
import { PedidoProductos } from "./components/PedidoProductos";
import { PedidoCarrito } from "./components/PedidoCarrito";
import { PedidoStatus } from "./components/PedidoStatus";
import { CartDrawer } from "@/components/cliente/CartDrawer";

export default function PedidoPage() {
  /* =========================
     STATE
  ========================= */
  const [tables, setTables] = useState<TableRow[]>([]);
  const [products, setProducts] = useState<ProductBrief[]>([]);
  
  // Usar Zustand store para carrito (persistencia global)
  const cart = useClienteStore((state) => state.cart);
  const addToCart = useClienteStore((state) => state.addToCart);
  const removeFromCart = useClienteStore((state) => state.removeFromCart);
  const setLineQty = useClienteStore((state) => state.setLineQty);
  const clearCart = useClienteStore((state) => state.clearCart);

  const [pickTable, setPickTable] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [skipTable, setSkipTable] = useState(false); // Opción de saltar selección de mesa

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
     CART (usando Zustand store)
  ========================= */
  function handleAddToCart(product: ProductBrief) {
    addToCart({
      productId: product._id,
      name: product.name,
      quantity: 1,
      notes: "",
    });
  }

  /* =========================
     ORDER
  ========================= */
  async function handleSubmit() {
    if (!skipTable && !sessionId) {
      setMsg("Primero activá la mesa o saltá este paso");
      return;
    }

    if (!cart.length) {
      setMsg("Carrito vacío");
      return;
    }

    try {
      setSubmitting(true);

      await createOrder({
        table: skipTable ? "" : pickTable,
        sessionId: skipTable ? "" : sessionId || "",
        items: cart.map((c) => ({
          product: c.productId,
          quantity: c.quantity,
        })),
      });

      clearCart();
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
      <div className={ui.headerWithCart}>
        <PedidoHeader />
        <CartDrawer />
      </div>

      <PedidoMesa
        tables={tables}
        pickTable={pickTable}
        setPickTable={setPickTable}
        handleOpenSession={handleOpenSession}
        loading={opening || loadingTables}
        skipTable={skipTable}
        setSkipTable={setSkipTable}
      />

      <PedidoProductos
        products={products}
        addToCart={handleAddToCart}
        priceOf={priceOf}
        loading={loadingProducts}
      />

      <PedidoCarrito
        cart={cart}
        setLineQty={setLineQty}
        removeFromCart={removeFromCart}
        handleSubmitOrder={handleSubmit}
        submitting={submitting}
      />

      <PedidoStatus msg={msg} />
    </div>
  );
}
