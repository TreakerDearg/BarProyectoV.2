"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  ShoppingCart, CheckCircle2, Clock3, ChefHat,
  Hash, AlertCircle, Loader2, Send,
  Minus, Plus, Trash2, PartyPopper,
} from "lucide-react";

import {
  getTables,
  getProducts,
  openTableSession,
  createOrder,
  getTableByCode,
} from "@/lib/api/bartender";

import type { TableRow, ProductBrief } from "@/lib/types/api";
import { useClienteStore } from "@/stores/useClienteStore";
import { useOrdersStore } from "@/stores/useOrdersStore";
import {
  initSocket, joinUserRoom, onOrderStatus,
} from "@/lib/realtime/socket";
import { useSocketReconnection } from "@/hooks/useSocketReconnection";
import type { OrderStatus } from "@/lib/realtime/types";
import ui from "./pedido-ui.module.css";

// ── Helpers ───────────────────────────────────────────────────────

// Union local compatible con el enum OrderStatus del backend
type OrderStatusStr = "pending" | "in-progress" | "completed" | "cancelled";

const STATUS_STEPS: OrderStatusStr[] = ["pending", "in-progress", "completed"];

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending:      { label: "Pedido recibido",   icon: <Clock3   size={18} />, color: "#D4A340" },
  "in-progress":{ label: "En preparación…",  icon: <ChefHat  size={18} />, color: "#E07828" },
  completed:    { label: "Pedido listo",    icon: <PartyPopper size={18} />, color: "#34B964" },
  cancelled:    { label: "Pedido cancelado",  icon: <AlertCircle size={18} />, color: "#C83228" },
};

function fmtPrice(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  });
}

// ── Componente ────────────────────────────────────────────────────

export default function PedidoPage() {
  // Store
  const cart          = useClienteStore((s) => s.cart);
  const addToCart     = useClienteStore((s) => s.addToCart);
  const removeFromCart= useClienteStore((s) => s.removeFromCart);
  const setLineQty    = useClienteStore((s) => s.setLineQty);
  const clearCart     = useClienteStore((s) => s.clearCart);
  const user          = useClienteStore((s) => s.user);
  const storeTableId  = useClienteStore((s) => s.tableId);
  const storeSessionId= useClienteStore((s) => s.sessionId);
  const setTableSession = useClienteStore((s) => s.setTableSession);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const orders        = useOrdersStore((s) => s.orders);

  // Datos
  const [tables,   setTables]   = useState<TableRow[]>([]);
  const [products, setProducts] = useState<ProductBrief[]>([]);

  // Flujo
  const [pickTable,   setPickTable]   = useState(storeTableId ?? "");
  const [sessionId,   setSessionId]   = useState(storeSessionId ?? "");
  const [tableCode,   setTableCode]   = useState(""); // código 3 dígitos ingresado
  const [useCode,     setUseCode]     = useState(false); // toggle: mesa manual vs código
  const [skipTable,   setSkipTable]   = useState(false);

  // Loading / feedback
  const [loadingTables,   setLoadingTables]   = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [opening,   setOpening]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast,     setToast]     = useState<{ type: "ok" | "err" | "info"; msg: string } | null>(null);

  // Orden actual
  const [currentOrderId,   setCurrentOrderId]   = useState<string | null>(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<string | null>(null);

  useSocketReconnection();

  const currentOrderIdRef = useRef(currentOrderId);
  currentOrderIdRef.current = currentOrderId;
  const userId = user?._id;

  const notify = useCallback(
    (type: "ok" | "err" | "info", msg: string, ms = 4000) => {
      setToast({ type, msg });
      setTimeout(() => setToast(null), ms);
    },
    [],
  );

  const loadTables = useCallback(async () => {
    try {
      setTables(await getTables());
    } catch (e: any) {
      notify("err", e.message);
    } finally {
      setLoadingTables(false);
    }
  }, [notify]);

  const loadProducts = useCallback(async () => {
    try {
      setProducts(await getProducts({ available: true, isActiveForPOS: true }));
    } catch (e: any) {
      notify("err", e.message);
    } finally {
      setLoadingProducts(false);
    }
  }, [notify]);

  useEffect(() => {
    loadTables();
    loadProducts();
  }, [loadTables, loadProducts]);

  useEffect(() => {
    initSocket();
    if (userId) joinUserRoom(userId);

    const unsub = onOrderStatus((data) => {
      const order = data.order;
      if (!order) return;
      updateOrderStatus(
        order._id,
        order.status as OrderStatus,
        order.updatedAt || new Date().toISOString(),
      );
      if (order._id === currentOrderIdRef.current) {
        setCurrentOrderStatus(order.status as string);
      }
    });

    return () => { unsub(); };
  }, [userId, updateOrderStatus]);

  // Estado en tiempo real desde el store
  const realtimeStatus = currentOrderId
    ? orders.get(currentOrderId)?.status ?? currentOrderStatus
    : null;

  // ── Activar mesa ──────────────────────────────────────────────
  async function handleOpenSession() {
    if (!pickTable) return notify("err", "Seleccioná una mesa");
    try {
      setOpening(true);
      const { sessionId: sid, tableCode: code } = await openTableSession(pickTable);
      setSessionId(sid);
      setTableSession(pickTable, sid, code ?? undefined);
      notify("ok", "Mesa activada correctamente");
    } catch (e: any) {
      notify("err", e.message);
    } finally {
      setOpening(false);
    }
  }

  // ── Activar por código de 3 dígitos ──────────────────────────
  async function handleOpenByCode() {
    const code = tableCode.trim();
    if (!/^\d{3}$/.test(code)) return notify("err", "Ingresá un código de 3 dígitos");
    try {
      setOpening(true);
      const data = await getTableByCode(code);
      setPickTable(data.tableId);
      setSessionId(data.sessionId);
      setTableSession(data.tableId, data.sessionId, data.tableCode);
      notify("ok", `Mesa #${data.tableNumber} conectada — código ${code}`);
    } catch (e: any) {
      notify("err", e.message);
    } finally {
      setOpening(false);
    }
  }

  // ── Carrito ───────────────────────────────────────────────────
  function handleAdd(p: ProductBrief) {
    addToCart({
      productId: p._id,
      name:      p.name,
      quantity:  1,
      notes:     "",
      price:     p.dynamicPrice ?? p.price ?? 0,
    });
    notify("info", `${p.name} agregado`, 1800);
  }

  const cartTotal  = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const cartCount  = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  // ── Enviar pedido ─────────────────────────────────────────────
  async function handleSubmit() {
    if (!skipTable && !sessionId) return notify("err", "Primero activá la mesa");
    if (!cart.length) return notify("err", "El carrito está vacío");

    try {
      setSubmitting(true);
      const order = await createOrder({
        table:     skipTable ? "" : pickTable,
        sessionId: skipTable ? "" : sessionId,
        items:     cart.map((c) => ({ product: c.productId, quantity: c.quantity })),
      });
      if (order?._id) {
        setCurrentOrderId(order._id);
        setCurrentOrderStatus("pending");
      }
      clearCart();
      notify("ok", "¡Pedido enviado! Estamos preparando todo.");
    } catch (e: any) {
      notify("err", e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className={ui.container}>

      {/* ── Toast ──────────────────────────────────────────────── */}
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

      {/* ── ESTADO DEL PEDIDO EN CURSO ──────────────────────────── */}
      {currentOrderId && realtimeStatus && (
        <section className={`${ui.orderStatusCard} ${
          realtimeStatus === "in-progress" ? ui.orderStatusCardPrep :
          realtimeStatus === "completed"   ? ui.orderStatusCardDone : ""
        }`} aria-live="polite" role="status">

          {/* Línea de progreso */}
          <div className={ui.orderProgressTrack}>
            <div className={`${ui.orderProgressFill} ${
              realtimeStatus === "pending"      ? ui.progressPending :
              realtimeStatus === "in-progress"  ? ui.progressPrep    :
              realtimeStatus === "completed"    ? ui.progressDone    : ""
            }`} />
          </div>

          <div className={ui.orderStatusBody}>
            {/* Icono animado */}
            <div className={`${ui.orderStatusIcon} ${
              realtimeStatus === "in-progress" ? ui.iconAnimPrep :
              realtimeStatus === "completed"   ? ui.iconAnimDone : ""
            }`}>
              {STATUS_META[realtimeStatus]?.icon ?? <Clock3 size={18} />}
            </div>

            <div className={ui.orderStatusText}>
              <p className={ui.orderStatusTitle}>
                {STATUS_META[realtimeStatus]?.label ?? realtimeStatus}
              </p>
              <p className={ui.orderStatusSub}>Pedido #{currentOrderId.slice(-6).toUpperCase()}</p>
            </div>

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
                      {step === "pending"        ? "Enviado"
                       : step === "in-progress"  ? "Preparando"
                       : "Listo"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {realtimeStatus === "completed" && (
            <button
              type="button"
              className={ui.orderNewBtn}
              onClick={() => {
                setCurrentOrderId(null);
                setCurrentOrderStatus(null);
              }}
            >
              Hacer otro pedido
            </button>
          )}
        </section>
      )}

      {/* ── PASO 1: MESA ────────────────────────────────────────── */}
      {!currentOrderId && (
        <section className={ui.card}>
          <div className={ui.cardInner}>

            {/* Tabs: código vs selección */}
            <div className={ui.stepTabRow}>
              <h2 className={ui.cardTitle}>1. Seleccionar mesa</h2>
              <div className={ui.stepTabs}>
                <button
                  type="button"
                  className={`${ui.stepTab} ${!useCode && !skipTable ? ui.stepTabActive : ""}`}
                  onClick={() => { setUseCode(false); setSkipTable(false); }}
                >
                  Lista
                </button>
                <button
                  type="button"
                  className={`${ui.stepTab} ${useCode ? ui.stepTabActive : ""}`}
                  onClick={() => { setUseCode(true); setSkipTable(false); }}
                >
                  <Hash size={13} /> Código
                </button>
                <button
                  type="button"
                  className={`${ui.stepTab} ${skipTable ? ui.stepTabActive : ""}`}
                  onClick={() => setSkipTable(true)}
                >
                  Saltar
                </button>
              </div>
            </div>

            {skipTable ? (
              <p className={ui.skipText}>
                Pedido sin mesa asignada — se enviará directamente al bar.
              </p>
            ) : useCode ? (
              /* ── Código de 3 dígitos ── */
              <div className={ui.codeInputRow}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{3}"
                  maxLength={3}
                  value={tableCode}
                  onChange={(e) => setTableCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder="000"
                  className={ui.codeInput}
                  aria-label="Código de 3 dígitos de la mesa"
                />
                <button
                  type="button"
                  onClick={handleOpenByCode}
                  disabled={opening || tableCode.length !== 3}
                  className={ui.btnPrimary}
                >
                  {opening ? <Loader2 className="animate-spin" size={16} /> : "Conectar"}
                </button>
              </div>
            ) : (
              /* ── Selección de lista ── */
              <>
                <select
                  value={pickTable}
                  onChange={(e) => setPickTable(e.target.value)}
                  className={ui.input}
                  aria-label="Seleccionar mesa"
                >
                  <option value="">Elegir mesa…</option>
                  {loadingTables ? (
                    <option disabled>Cargando…</option>
                  ) : (
                    tables
                      .filter((t) => t.status === "occupied" || t.status === "available")
                      .map((t) => (
                        <option key={t._id} value={t._id}>
                          Mesa #{t.number} · {t.capacity} pers. · {t.status === "occupied" ? "Abierta" : "Disponible"}
                        </option>
                      ))
                  )}
                </select>
                <button
                  type="button"
                  onClick={handleOpenSession}
                  disabled={opening || !pickTable}
                  className={ui.btnPrimary}
                  style={{ marginTop: "0.75rem", width: "100%" }}
                >
                  {opening
                    ? <><Loader2 className="animate-spin" size={16} /> Abriendo…</>
                    : "Activar mesa"}
                </button>
              </>
            )}

            {/* Indicador de sesión activa */}
            {sessionId && (
              <div className={ui.sessionBadge}>
                <span className={ui.sessionDot} aria-hidden="true" />
                Sesión activa
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── PASO 2: PRODUCTOS ───────────────────────────────────── */}
      {!currentOrderId && (
        <section className={ui.card}>
          <div className={ui.cardInner}>
            <h2 className={ui.cardTitle}>2. Elegir productos</h2>

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
                      {p.image && (
                        <div className={ui.productImageWrap}>
                          <img src={p.image} alt={p.name} className={ui.productImage} />
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
                            <button
                              type="button"
                              onClick={() => setLineQty(p._id, lineQty - 1)}
                              className={ui.qtyBtn}
                              aria-label="Reducir cantidad"
                            >
                              <Minus size={12} />
                            </button>
                            <span className={ui.qtyVal}>{lineQty}</span>
                            <button
                              type="button"
                              onClick={() => setLineQty(p._id, lineQty + 1)}
                              className={ui.qtyBtn}
                              aria-label="Aumentar cantidad"
                            >
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

      {/* ── PASO 3: RESUMEN + ENVÍO ──────────────────────────────── */}
      {!currentOrderId && cart.length > 0 && (
        <section className={ui.card}>
          <div className={ui.cardInner}>
            <div className={ui.cartHeader}>
              <ShoppingCart size={18} className={ui.cartIcon} />
              <h2 className={ui.cardTitle}>3. Tu pedido</h2>
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
                    <button
                      type="button"
                      onClick={() => setLineQty(item.productId, item.quantity - 1)}
                      className={ui.cartQtyBtn}
                      aria-label="Reducir"
                    >
                      <Minus size={11} />
                    </button>
                    <span className={ui.qtyInput}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setLineQty(item.productId, item.quantity + 1)}
                      className={ui.cartQtyBtn}
                      aria-label="Aumentar"
                    >
                      <Plus size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className={ui.removeBtn}
                      aria-label={`Quitar ${item.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Total */}
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

      {/* ── Empty state ──────────────────────────────────────────── */}
      {!currentOrderId && cart.length === 0 && !loadingProducts && (
        <div className={ui.emptyState}>
          <ShoppingCart size={40} className={ui.emptyIcon} />
          <p className={ui.empty}>Elegí productos arriba para armar tu pedido</p>
        </div>
      )}
    </div>
  );
}
