"use client";

import Link from "next/link";
import { memo, useEffect, useState, useCallback } from "react";
import { roleLabel } from "@/lib/auth/roles";
import type { AuthUser } from "@/lib/types/api";
import { useClienteStore } from "@/stores/useClienteStore";
import { useOrdersStore } from "@/stores/useOrdersStore";
import { initSocket, joinOrdersGlobal, onOrderStatus } from "@/lib/realtime/socket";
import { api } from "@/lib/api/client";
import styles from "./AccountView.module.css";

// ── Tipos locales ─────────────────────────────────────────────────

interface OrderSummary {
  _id: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
  tableNumber?: number;
}

interface AccountViewProps {
  user: AuthUser;
  onLogout: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  pending:     { label: "Pendiente",    cls: styles.statusPending,  dot: styles.dotPending  },
  "in-progress": { label: "En preparación", cls: styles.statusPrep, dot: styles.dotPrep    },
  completed:   { label: "Completado",   cls: styles.statusDone,     dot: styles.dotDone     },
  cancelled:   { label: "Cancelado",    cls: styles.statusCancelled,dot: styles.dotCancelled},
};

function fmtPrice(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Quick-action hub (estilo McDonalds kiosk) ─────────────────────

const QUICK_ACTIONS = [
  {
    href: "/cliente/carta",
    label: "Ver carta",
    sub:   "Menú completo",
    emoji: "🍹",
    accent: "gold",
  },
  {
    href: "/cliente/pedido",
    label: "Pedir",
    sub:   "Haz tu pedido",
    emoji: "🛎",
    accent: "green",
  },
  {
    href: "/cliente/reservas",
    label: "Reservas",
    sub:   "Mis reservas",
    emoji: "📅",
    accent: "blue",
  },
  {
    href: "/cliente/ruleta",
    label: "Ruleta",
    sub:   "Sorpresa de bar",
    emoji: "🎰",
    accent: "amber",
  },
];

// ── Componente principal ──────────────────────────────────────────

export const AccountView = memo(function AccountView({
  user,
  onLogout,
}: AccountViewProps) {
  const cart      = useClienteStore((s) => s.cart);
  const tableId   = useClienteStore((s) => s.tableId);
  const sessionId = useClienteStore((s) => s.sessionId);
  const orders    = useOrdersStore((s) => s.orders);

  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Iniciales del avatar
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Calcular totales del carrito
  const cartCount  = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal  = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  // Fetch órdenes recientes de la sesión activa
  const fetchOrders = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoadingOrders(true);
      const res: any = await api.get(`/orders?sessionId=${sessionId}&limit=10`);
      const list: any[] = res?.data?.data ?? res?.data ?? [];
      setRecentOrders(
        list.map((o: any) => ({
          _id:         o._id,
          status:      o.status,
          total:       o.total ?? o.items?.reduce((s: number, i: any) => s + (i.price ?? 0) * (i.quantity ?? 1), 0) ?? 0,
          itemCount:   o.items?.length ?? 0,
          createdAt:   o.createdAt,
          tableNumber: o.table?.number,
        }))
      );
      // Determinar la orden activa más reciente
      const active = list.find(
        (o: any) => o.status === "pending" || o.status === "in-progress",
      );
      if (active) setActiveOrderId(active._id);
    } catch {
      // silencioso
    } finally {
      setLoadingOrders(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Socket.IO — actualizar estado del pedido activo en tiempo real
  useEffect(() => {
    const socket = initSocket();
    joinOrdersGlobal();

    const unsub = onOrderStatus((data) => {
      const order = data.order;
      if (!order) return;
      // Actualizar la lista local
      setRecentOrders((prev) =>
        prev.map((o) =>
          o._id === order._id ? { ...o, status: order.status } : o,
        ),
      );
      if (order._id === activeOrderId && order.status === "completed") {
        // El pedido está listo — refrescar
        fetchOrders();
      }
    });

    return () => { unsub(); };
  }, [activeOrderId, fetchOrders]);

  // Estado del pedido activo desde el store de tiempo real
  const activeOrderRealtime = activeOrderId
    ? orders.get(activeOrderId)
    : null;
  const activeOrderStatus = activeOrderRealtime?.status
    ?? recentOrders.find((o) => o._id === activeOrderId)?.status
    ?? null;

  return (
    <div className={styles.wrapper}>

      {/* ── 1. HERO: identidad ──────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.avatar} aria-hidden="true">
          <span className={styles.avatarInitials}>{initials}</span>
        </div>
        <div className={styles.heroText}>
          <p className={styles.greeting}>
            Hola, <span className={styles.greetingName}>{user.name.split(" ")[0]}</span>
          </p>
          <p className={styles.roleLabel}>{roleLabel(user.role)}</p>
          <p className={styles.heroEmail}>{user.email}</p>
        </div>
      </div>

      {/* ── 2. PEDIDO EN CURSO (si hay sesión activa) ───────────── */}
      {sessionId && activeOrderId && activeOrderStatus && (
        <div
          className={[
            styles.liveOrderBanner,
            activeOrderStatus === "in-progress" ? styles.liveOrderBannerPrep : "",
            activeOrderStatus === "completed"   ? styles.liveOrderBannerDone : "",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          {/* Punto pulsante */}
          <span className={styles.liveOrderDot} aria-hidden="true" />

          <div className={styles.liveOrderInfo}>
            <p className={styles.liveOrderLabel}>Pedido en curso</p>
            <p className={styles.liveOrderStatus}>
              {STATUS_CONFIG[activeOrderStatus]?.label ?? activeOrderStatus}
            </p>
          </div>

          {/* Barra de progreso */}
          <div className={styles.liveProgressTrack} aria-hidden="true">
            <div
              className={[
                styles.liveProgressBar,
                activeOrderStatus === "pending"     ? styles.liveBarPending  : "",
                activeOrderStatus === "in-progress" ? styles.liveBarPrep     : "",
                activeOrderStatus === "completed"   ? styles.liveBarDone     : "",
              ].join(" ")}
            />
          </div>

          {/* Pasos */}
          <div className={styles.liveSteps} aria-label="Pasos del pedido">
            {(["pending", "in-progress", "completed"] as const).map((step) => {
              const passed =
                activeOrderStatus === "in-progress" && step === "pending" ||
                activeOrderStatus === "completed";
              const current = activeOrderStatus === step;
              return (
                <div
                  key={step}
                  className={[
                    styles.liveStep,
                    current ? styles.liveStepCurrent : "",
                    passed  ? styles.liveStepDone    : "",
                  ].join(" ")}
                >
                  <span className={styles.liveStepDot} aria-hidden="true" />
                  <span className={styles.liveStepLabel}>
                    {step === "pending"      ? "Enviado"
                      : step === "in-progress" ? "Preparando"
                      : "Listo 🎉"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. CARRITO RÁPIDO (si hay ítems) ────────────────────── */}
      {cartCount > 0 && (
        <Link href="/cliente/pedido" className={styles.cartBanner}>
          <div className={styles.cartBannerLeft}>
            <span className={styles.cartBannerBadge}>{cartCount}</span>
            <span className={styles.cartBannerLabel}>
              {cartCount === 1 ? "ítem en el carrito" : "ítems en el carrito"}
            </span>
          </div>
          <span className={styles.cartBannerTotal}>{fmtPrice(cartTotal)}</span>
          <span className={styles.cartBannerArrow} aria-hidden="true">→</span>
        </Link>
      )}

      {/* ── 4. ACCIONES RÁPIDAS (estilo kiosk McDonalds) ────────── */}
      <nav aria-label="Acciones rápidas">
        <p className={styles.sectionLabel}>¿Qué querés hacer?</p>
        <div className={styles.quickGrid}>
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={[styles.quickCard, styles[`quickCard_${a.accent}`]].join(" ")}
            >
              <span className={styles.quickEmoji} aria-hidden="true">{a.emoji}</span>
              <span className={styles.quickLabel}>{a.label}</span>
              <span className={styles.quickSub}>{a.sub}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ── 5. HISTORIAL DE PEDIDOS de la sesión ────────────────── */}
      {sessionId && (
        <section>
          <p className={styles.sectionLabel}>
            Pedidos de esta sesión
            {tableId && <span className={styles.sectionMeta}> · Mesa activa</span>}
          </p>

          {loadingOrders ? (
            <div className={styles.ordersLoading}>
              <span className={styles.ordersSpinner} aria-hidden="true" />
              <span className={styles.ordersLoadingText}>Cargando pedidos…</span>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className={styles.ordersEmpty}>
              <span aria-hidden="true">🧾</span>
              <p>Todavía no hay pedidos en esta sesión.</p>
            </div>
          ) : (
            <ul className={styles.orderList} aria-label="Historial de pedidos">
              {recentOrders.map((order) => {
                const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                // El estado en tiempo real toma prioridad
                const realtimeStatus = orders.get(order._id)?.status ?? order.status;
                const rsc = STATUS_CONFIG[realtimeStatus] ?? sc;
                return (
                  <li key={order._id} className={styles.orderRow}>
                    <div className={styles.orderRowLeft}>
                      <span className={[styles.orderDot, rsc.dot].join(" ")} aria-hidden="true" />
                      <div>
                        <p className={styles.orderRowTitle}>
                          {order.itemCount} ítem{order.itemCount !== 1 ? "s" : ""}
                          {order.tableNumber ? ` · Mesa #${order.tableNumber}` : ""}
                        </p>
                        <p className={styles.orderRowTime}>{fmtTime(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className={styles.orderRowRight}>
                      <span className={[styles.orderStatus, rsc.cls].join(" ")}>
                        {rsc.label}
                      </span>
                      <span className={styles.orderTotal}>{fmtPrice(order.total)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* ── 6. DATOS DEL PERFIL ──────────────────────────────────── */}
      <section className={styles.profileCard} aria-label="Información de tu cuenta">
        <p className={styles.sectionLabel}>Tu cuenta</p>
        <div className={styles.profileField}>
          <span className={styles.profileFieldLabel}>Nombre</span>
          <span className={styles.profileFieldValue}>{user.name}</span>
        </div>
        <div className={styles.profileDivider} aria-hidden="true" />
        <div className={styles.profileField}>
          <span className={styles.profileFieldLabel}>Email</span>
          <span className={styles.profileFieldValue}>{user.email}</span>
        </div>
      </section>

      {/* ── 7. LOGOUT ───────────────────────────────────────────── */}
      <div className={styles.logoutWrapper}>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={onLogout}
          aria-label="Cerrar sesión"
        >
          <svg viewBox="0 0 24 24" fill="none" className={styles.logoutIcon} aria-hidden="true">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
});
