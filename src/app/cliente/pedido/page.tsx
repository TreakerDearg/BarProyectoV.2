"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  ShoppingCart, CheckCircle2, AlertCircle, Loader2, Send,
  Minus, Plus, Trash2, GlassWater, ChefHat,
} from "lucide-react";

import {
  getProducts, createOrder,
} from "@/lib/api/bartender";

import type { ProductBrief } from "@/lib/types/api";
import { useClienteStore }    from "@/stores/useClienteStore";
import { useOrdersStore }     from "@/stores/useOrdersStore";
import { initSocket, joinUserRoom, onOrderStatus } from "@/lib/realtime/socket";
import { useSocketReconnection } from "@/hooks/useSocketReconnection";
import type { OrderStatus }   from "@/lib/realtime/types";
import { OrderStatusOverlay } from "@/components/cliente/OrderStatusOverlay/OrderStatusOverlay";
import { TableCodeGate }      from "../carta/components/TableCodeGate";
import ui from "./pedido-ui.module.css";

// ── Tipos ─────────────────────────────────────────────────────────

type OrderStatusStr = "pending" | "in-progress" | "completed" | "cancelled";
const STATUS_STEPS: OrderStatusStr[] = ["pending", "in-progress", "completed"];

function fmtPrice(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  });
}

// ── Componente ────────────────────────────────────────────────────

export default function PedidoPage() {
  // ── Store ─────────────────────────────────────────────────────
  const cart            = useClienteStore((s) => s.cart);
  const addToCart       = useClienteStore((s) => s.addToCart);
  const removeFromCart  = useClienteStore((s) => s.removeFromCart);
  const setLineQty      = useClienteStore((s) => s.setLineQty);
  const clearCart       = useClienteStore((s) => s.clearCart);
  const user            = useClienteStore((s) => s.user);
  const storeTableId    = useClienteStore((s) => s.tableId);
  const storeSessionId  = useClienteStore((s) => s.sessionId);
  const storeTableCode  = useClienteStore((s) => s.tableCode);
  const setTableSession = useClienteStore((s) => s.setTableSession);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const orders          = useOrdersStore((s) => s.orders);

  // ── Datos ─────────────────────────────────────────────────────
  const [products, setProducts]   = useState<ProductBrief[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ── Flujo de mesa ─────────────────────────────────────────────
  // Si ya hay tableCode en el store, la mesa está conectada.
  // Si no, se muestra el TableCodeGate antes de los pasos.
  const [pickTable,   setPickTable]  = useState(storeTableId    ?? "");
  const [sessionId,   setSessionId]  = useState(storeSessionId  ?? "");
  const [gateSkipped, setGateSkipped] = useState(false);

  // Gate: pedir el código si no tiene tableCode y no ha skipeado
  const isLoggedIn   = !!user;
  const hasSession   = !!storeSessionId || !!sessionId;
  const showGate     = isLoggedIn && !storeTableCode && !gateSkipped && !hasSession;

  // ── Loading / feedback ────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err" | "info"; msg: string } | null>(null);

  // ── Orden activa ──────────────────────────────────────────────
  const [currentOrderId,     setCurrentOrderId]     = useState<string | null>(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<OrderStatusStr | null>(null);

  // Overlay de animación — qué fase se muestra actualmente
  const [overlayPhase, setOverlayPhase] = useState<"pending" | "in-progress" | "completed" | null>(null);
  // Fase que ya mostramos (evitar repetir la misma)
  const shownPhasesRef = useRef<Set<string>>(new Set());

  useSocketReconnection();

  const currentOrderIdRef = useRef(currentOrderId);
  currentOrderIdRef.current = currentOrderId;

  // ── Notify ────────────────────────────────────────────────────
  const notify = useCallback(
    (type: "ok" | "err" | "info", msg: string, ms = 4000) => {
      setToast({ type, msg });
      setTimeout(() => setToast(null), ms);
    },
    [],
  );

  // ── Productos ─────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      setProducts(await getProducts({ available: true }));
    } catch (e: any) {
      notify("err", e.message);
    } finally {
      setLoadingProducts(false);
    }
  }, [notify]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Socket.IO ─────────────────────────────────────────────────
  useEffect(() => {
    initSocket();
    if (user?._id) joinUserRoom(user._id);

    const unsub = onOrderStatus((data) => {
      const order = data.order;
      if (!order) return;
      updateOrderStatus(order._id, order.status as OrderStatus, order.updatedAt ?? new Date().toISOString());

      if (order._id !== currentOrderIdRef.current) return;

      const newStatus = order.status as OrderStatusStr;
      setCurrentOrderStatus(newStatus);

      // Mostrar overlay solo si es una fase nueva (pending/in-progress/completed)
      const overlayStatuses = ["pending", "in-progress", "completed"];
      const key = `${order._id}-${newStatus}`;
      if (overlayStatuses.includes(newStatus) && !shownPhasesRef.current.has(key)) {
        shownPhasesRef.current.add(key);
        setOverlayPhase(newStatus as "pending" | "in-progress" | "completed");
      }
    });

    return () => { unsub(); };
  }, [user, updateOrderStatus]);

  // Estado en tiempo real del store
  const realtimeStatus = currentOrderId
    ? (orders.get(currentOrderId)?.status as OrderStatusStr | undefined) ?? currentOrderStatus
    : null;

  // Sync el overlay cuando el status cambia (p.ej. refresh de página)
  useEffect(() => {
    if (!realtimeStatus || !currentOrderId) return;
    const key = `${currentOrderId}-${realtimeStatus}`;
    if (!shownPhasesRef.current.has(key) &&
        ["pending", "in-progress", "completed"].includes(realtimeStatus)) {
      shownPhasesRef.current.add(key);
      setOverlayPhase(realtimeStatus as "pending" | "in-progress" | "completed");
    }
  }, [realtimeStatus, currentOrderId]);

  // ── Carrito ───────────────────────────────────────────────────
  function handleAdd(p: ProductBrief) {
    addToCart({
      productId: p._id,
      name:      p.name,
      quantity:  1,
      notes:     "",
      price:     p.dynamicPrice ?? p.price ?? 0,
    });
    notify("info", `${p.name} agregado`, 1600);
  }

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  // ── Enviar pedido ─────────────────────────────────────────────
  async function handleSubmit() {
    const sid = storeSessionId || sessionId;
    if (!sid && !gateSkipped) return notify("err", "Primero conectá la mesa");
    if (!cart.length) return notify("err", "El carrito está vacío");

    try {
      setSubmitting(true);
      const order = await createOrder({
        table:     storeTableId || pickTable || "",
        sessionId: sid || "",
        items:     cart.map((c) => ({ product: c.productId, quantity: c.quantity })),
      });

      if (order?._id) {
        setCurrentOrderId(order._id);
        setCurrentOrderStatus("pending");
        // Mostrar overlay de "Su orden fue tomada"
        const key = `${order._id}-pending`;
        shownPhasesRef.current.add(key);
        setOverlayPhase("pending");
      }
      clearCart();
    } catch (e: any) {
      notify("err", e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Gate de código ────────────────────────────────────────────
  if (showGate) {
    return (
      <TableCodeGate
        onUnlocked={() => {
          // tableCode ya fue guardado en el store por TableCodeGate
          // Sincronizar sessionId local con el store
          setSessionId(useClienteStore.getState().sessionId ?? "");
          setPickTable(useClienteStore.getState().tableId ?? "");
        }}
        onSkip={() => setGateSkipped(true)}
      />
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className={ui.container}>

      {/* Animación de estado full-screen */}
      <OrderStatusOverlay
        phase={overlayPhase}
        orderId={currentOrderId ?? undefined}
        onDismiss={() => setOverlayPhase(null)}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`${ui.toast} ${
            toast.type === "ok"  ? ui.toastOk  :
            toast.type === "err" ? ui.toastErr  : ui.toastInfo
          }`}
          role="alert"
          aria-live="assertive"
        >
          {toast.type === "ok"  ? <CheckCircle2 size={16} /> :
           toast.type === "err" ? <AlertCircle  size={16} /> :
                                   <ShoppingCart size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── ESTADO DEL PEDIDO EN CURSO ─────────────────────────── */}
      {currentOrderId && realtimeStatus && (
        <section
          className={`${ui.orderStatusCard} ${
            realtimeStatus === "in-progress" ? ui.orderStatusCardPrep :
            realtimeStatus === "completed"   ? ui.orderStatusCardDone : ""
          }`}
          aria-live="polite"
          role="status"
        >
          {/* Barra de progreso */}
          <div className={ui.orderProgressTrack}>
            <div className={`${ui.orderProgressFill} ${
              realtimeStatus === "pending"     ? ui.progressPending :
              realtimeStatus === "in-progress" ? ui.progressPrep    :
              realtimeStatus === "completed"   ? ui.progressDone    : ""
            }`} />
          </div>

          <div className={ui.orderStatusBody}>
            {/* Pasos */}
            <div className={ui.orderSteps} aria-label="Progreso del pedido">
              {STATUS_STEPS.map((step) => {
                const idx    = STATUS_STEPS.indexOf(step);
                const curr   = STATUS_STEPS.indexOf(realtimeStatus as OrderStatusStr);
                const done   = idx < curr;
                const active = idx === curr;
                return (
                  <div
                    key={step}
                    className={`${ui.orderStep} ${
                      active ? ui.orderStepActive :
                      done   ? ui.orderStepDone   : ""
                    }`}
                  >
                    <span className={ui.orderStepDot} aria-hidden="true" />
                    <span className={ui.orderStepLabel}>
                      {step === "pending"       ? "Enviado"
                       : step === "in-progress" ? "Preparando"
                       : "Listo"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={ui.orderStatusText}>
              <p className={ui.orderStatusTitle}>
                {realtimeStatus === "pending"      ? "Pedido recibido"
                 : realtimeStatus === "in-progress" ? "En preparación…"
                 : realtimeStatus === "completed"   ? "Lista para servir"
                 : "Pedido cancelado"}
              </p>
              <p className={ui.orderStatusSub}>
                #{currentOrderId.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          {realtimeStatus === "completed" && (
            <button
              type="button"
              className={ui.orderNewBtn}
              onClick={() => {
                setCurrentOrderId(null);
                setCurrentOrderStatus(null);
                shownPhasesRef.current.clear();
              }}
            >
              Hacer otro pedido
            </button>
          )}
        </section>
      )}

      {/* ── PRODUCTOS ─────────────────────────────────────────── */}
      {!currentOrderId && (
        <section className={ui.card}>
          <div className={ui.cardInner}>
            <h2 className={ui.cardTitle}>
              {hasSession ? "Elegí tus productos" : "Carta"}
            </h2>

            {/* Indicador de sesión activa */}
            {hasSession && storeTableCode && (
              <div className={ui.sessionBadge}>
                <span className={ui.sessionDot} aria-hidden="true" />
                Mesa conectada · código {storeTableCode}
              </div>
            )}

            {loadingProducts ? (
              <div className={ui.productsLoading}>
                <Loader2 className="animate-spin" size={22} />
                <span>Cargando carta…</span>
              </div>
            ) : (
              <div className={ui.productsGrid}>
                {products.map((p) => {
                  const lineQty = cart.find((c) => c.productId === p._id)?.quantity ?? 0;
                  const price   = p.dynamicPrice ?? p.price ?? 0;
                  return (
                    <div key={p._id} className={ui.productCard}>
                      {p.image ? (
                        <div className={ui.productImageWrap}>
                          <img src={p.image} alt={p.name} className={ui.productImage} />
                        </div>
                      ) : (
                        <div className={`${ui.productImageWrap} ${ui.productImagePlaceholder}`}>
                          {p.type === "drink"
                            ? <GlassWater size={24} className="text-muted opacity-40" />
                            : <ChefHat   size={24} className="text-muted opacity-40" />}
                        </div>
                      )}
                      <div className={ui.productBody}>
                        <p className={ui.productName}>{p.name}</p>
                        <p className={ui.productPrice}>{fmtPrice(price)}</p>
                      </div>
                      <div className={ui.productActions}>
                        {lineQty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAdd(p)}
                            className={ui.btnAddProduct}
                            disabled={!p.available}
                            aria-label={`Agregar ${p.name}`}
                          >
                            <Plus size={15} /> Agregar
                          </button>
                        ) : (
                          <div className={ui.qtyRow}>
                            <button type="button" onClick={() => setLineQty(p._id, lineQty - 1)} className={ui.qtyBtn} aria-label="Reducir">
                              <Minus size={12} />
                            </button>
                            <span className={ui.qtyVal}>{lineQty}</span>
                            <button type="button" onClick={() => setLineQty(p._id, lineQty + 1)} className={ui.qtyBtn} aria-label="Aumentar">
                              <Plus size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── RESUMEN + ENVÍO ───────────────────────────────────── */}
      {!currentOrderId && cart.length > 0 && (
        <section className={ui.card}>
          <div className={ui.cardInner}>
            <div className={ui.cartHeader}>
              <ShoppingCart size={18} className={ui.cartIcon} />
              <h2 className={ui.cardTitle}>Tu pedido</h2>
              <span className={ui.cartBadge}>{cartCount}</span>
            </div>

            <ul className={ui.cartList}>
              {cart.map((item) => (
                <li key={item.productId} className={ui.cartItem}>
                  <div className={ui.cartInfo}>
                    <span className={ui.cartName}>{item.name}</span>
                    <span className={ui.cartItemPrice}>{fmtPrice(item.price)} c/u</span>
                  </div>
                  <div className={ui.cartControls}>
                    <button type="button" onClick={() => setLineQty(item.productId, item.quantity - 1)} className={ui.cartQtyBtn} aria-label="Reducir">
                      <Minus size={11} />
                    </button>
                    <span className={ui.qtyInput}>{item.quantity}</span>
                    <button type="button" onClick={() => setLineQty(item.productId, item.quantity + 1)} className={ui.cartQtyBtn} aria-label="Aumentar">
                      <Plus size={11} />
                    </button>
                    <button type="button" onClick={() => removeFromCart(item.productId)} className={ui.removeBtn} aria-label={`Quitar ${item.name}`}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className={ui.cartTotalRow}>
              <span className={ui.cartTotalLabel}>Total</span>
              <span className={ui.cartTotalValue}>{fmtPrice(cartTotal)}</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={ui.btnSend}
            >
              {submitting
                ? <><Loader2 className="animate-spin" size={18} /> Enviando…</>
                : <><Send size={16} /> Enviar pedido</>}
            </button>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!currentOrderId && cart.length === 0 && !loadingProducts && (
        <div className={ui.emptyState}>
          <ShoppingCart size={40} className={ui.emptyIcon} />
          <p className={ui.empty}>Elegí productos de la carta para armar tu pedido</p>
        </div>
      )}
    </div>
  );
}
