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
import { useOrdersStore } from "@/stores/useOrdersStore";
import { initSocket, joinUserRoom, joinOrdersGlobal, onOrderStatus } from "@/lib/realtime/socket";
import { useSocketReconnection } from "@/hooks/useSocketReconnection";
import type { OrderStatus } from "@/lib/realtime/types";

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
  
  // Usar Zustand store para carrito (persistencia global)
  const cart = useClienteStore((state) => state.cart);
  const addToCart = useClienteStore((state) => state.addToCart);
  const removeFromCart = useClienteStore((state) => state.removeFromCart);
  const setLineQty = useClienteStore((state) => state.setLineQty);
  const clearCart = useClienteStore((state) => state.clearCart);
  const user = useClienteStore((state) => state.user);

  // Socket.IO for realtime order updates
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus);
  
  // Socket reconnection handling
  const { triggerStateSync } = useSocketReconnection();

  const [pickTable, setPickTable] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [skipTable, setSkipTable] = useState(false); // Opción de saltar selección de mesa

  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [opening, setOpening] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

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
     SOCKET.IO REALTIME
  ========================= */
  useEffect(() => {
    // Initialize socket connection
    const socket = initSocket();

    // Join orders global room for order updates
    // Backend emits to orders:global for all order updates
    joinOrdersGlobal();

    // Join user-specific room if authenticated
    if (user?._id) {
      joinUserRoom(user._id);
    }

    // Listen for order status updates
    const unsubscribe = onOrderStatus((data) => {
      console.log("[PedidoPage] Order status update received:", data);
      
      // Backend emits { event: "order:update", order }
      const order = data.order;
      if (!order) return;
      
      // Update local store with new status
      updateOrderStatus(order._id, order.status as OrderStatus, order.updatedAt || new Date().toISOString());
      
      // Update message if this is the current order
      if (order._id === currentOrderId) {
        const statusMessages: Record<string, string> = {
          "pending": "Tu pedido está pendiente",
          "in-progress": "Tu pedido está en preparación",
          "completed": "¡Tu pedido está listo!",
          "cancelled": "Tu pedido fue cancelado"
        };
        setMsg(statusMessages[order.status] || `Estado actualizado: ${order.status}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, currentOrderId, updateOrderStatus, joinOrdersGlobal]);

  /* =========================
     STATE SYNCHRONIZATION ON RECONNECTION
  ========================= */
  useEffect(() => {
    const handleStateSync = () => {
      console.log("[PedidoPage] Syncing state after reconnection");
      // Rejoin orders global room
      joinOrdersGlobal();
      // Reload tables and products to ensure fresh data
      loadTables();
      loadProducts();
    };

    window.addEventListener("socket:state-sync", handleStateSync);

    return () => {
      window.removeEventListener("socket:state-sync", handleStateSync);
    };
  }, [loadTables, loadProducts, joinOrdersGlobal]);

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
    const price = product.dynamicPrice ?? product.price ?? 0;
    addToCart({
      productId: product._id,
      name: product.name,
      quantity: 1,
      notes: "",
      price,
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

      const orderResponse = await createOrder({
        table: skipTable ? "" : pickTable,
        sessionId: skipTable ? "" : sessionId || "",
        items: cart.map((c) => ({
          product: c.productId,
          quantity: c.quantity,
        })),
      });

      // Store order ID for realtime tracking
      if (orderResponse?._id) {
        setCurrentOrderId(orderResponse._id);
      }

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
      <PedidoHeader />

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
