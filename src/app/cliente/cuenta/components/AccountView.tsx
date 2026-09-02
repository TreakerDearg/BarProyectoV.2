"use client";

import Link from "next/link";
import { memo, useEffect, useState, useCallback } from "react";
import {
  ChefHat, ShoppingBag, CalendarDays, Sparkles,
  ClipboardList, ChevronRight, CheckCircle2,
  Pencil, X, Save, Loader2, Lock, Heart,
  AlertTriangle, Eye, EyeOff, Phone,
} from "lucide-react";
import { roleLabel } from "@/lib/auth/roles";
import type { AuthUser } from "@/lib/types/api";
import { useClienteStore } from "@/stores/useClienteStore";
import { useOrdersStore }   from "@/stores/useOrdersStore";
import {
  initSocket, joinUserRoom, onOrderStatus,
} from "@/lib/realtime/socket";
import {
  updateMyProfile, changeMyPassword,
  getMyOrderHistory, getMyReservations,
} from "@/lib/api/bartender";
import { clearTokens, getRefreshToken } from "@/lib/auth/tokenStorage";
import { api } from "@/lib/api/client";
import styles from "./AccountView.module.css";

// ── Tipos ─────────────────────────────────────────────────────────

interface OrderHistoryItem {
  _id: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
  tableNumber: number | null;
}

interface UpcomingReservation {
  _id: string;
  status: string;
  startTime: string;
  guests: number;
  tableNumber?: number;
}

interface Props {
  user: AuthUser;
  onLogout: () => void;
}

// ── Config ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; dotCls: string; statusCls: string }> = {
  pending:       { label: "Pendiente",      dotCls: styles.dotPending,   statusCls: styles.statusPending   },
  "in-progress": { label: "Preparando",     dotCls: styles.dotPrep,      statusCls: styles.statusPrep      },
  completed:     { label: "Completado",     dotCls: styles.dotDone,      statusCls: styles.statusDone      },
  cancelled:     { label: "Cancelado",      dotCls: styles.dotCancelled, statusCls: styles.statusCancelled },
};

const RESERVATION_STATUS: Record<string, string> = {
  pending:   "Pendiente",
  confirmed: "Confirmada",
  seated:    "En mesa",
  completed: "Completada",
  cancelled: "Cancelada",
  "no-show": "No asistió",
};

interface QuickAction {
  href: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { href: "/cliente/carta",    label: "Ver carta",   sub: "Menú completo",  icon: <ChefHat    size={26} />, accent: "gold"  },
  { href: "/cliente/pedido",   label: "Pedir",       sub: "Haz tu pedido",  icon: <ShoppingBag size={26} />, accent: "green" },
  { href: "/cliente/reservas", label: "Reservas",    sub: "Mis reservas",   icon: <CalendarDays size={26}/>, accent: "blue"  },
  { href: "/cliente/ruleta",   label: "Ruleta",      sub: "Sorpresa de bar",icon: <Sparkles   size={26} />, accent: "amber" },
];

function fmtPrice(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

// ── Panel: Perfil editable ────────────────────────────────────────

function ProfilePanel({ user }: { user: AuthUser }) {
  const storeSetAuth = useClienteStore((s) => s.setAuth);
  const storeToken   = useClienteStore((s) => s.token)!;

  const [editing, setEditing]     = useState(false);
  const [saving,  setSaving]      = useState(false);
  const [error,   setError]       = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [name,    setName]        = useState(user.name);
  const [phone,   setPhone]       = useState(user.phone ?? "");

  const handleSave = async () => {
    const trimName = name.trim();
    if (trimName.length < 2) { setError("El nombre debe tener al menos 2 caracteres"); return; }
    setSaving(true); setError(null);
    try {
      const updated = await updateMyProfile({
        name:  trimName,
        phone: phone.trim() || undefined,
      });
      // Actualizar el store con el nuevo nombre
      storeSetAuth(storeToken, { ...user, name: updated.name, phone: updated.phone ?? null });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setEditing(false); }, 1500);
    } catch (e: any) {
      setError(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setName(user.name);
    setPhone(user.phone ?? "");
    setError(null);
  };

  return (
    <section className={styles.profileCard} aria-label="Tu perfil">
      <div className={styles.profileCardHeader}>
        <p className={styles.sectionLabel}>Perfil</p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={styles.editBtn}
            aria-label="Editar perfil"
          >
            <Pencil size={14} />
            Editar
          </button>
        )}
      </div>

      {!editing ? (
        /* Modo lectura */
        <>
          <div className={styles.profileField}>
            <span className={styles.profileFieldLabel}>Nombre</span>
            <span className={styles.profileFieldValue}>{user.name}</span>
          </div>
          <div className={styles.profileDivider} />
          <div className={styles.profileField}>
            <span className={styles.profileFieldLabel}>Email</span>
            <span className={styles.profileFieldValue}>{user.email}</span>
          </div>
          {user.phone && (
            <>
              <div className={styles.profileDivider} />
              <div className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Teléfono</span>
                <span className={styles.profileFieldValue}>{user.phone}</span>
              </div>
            </>
          )}
        </>
      ) : (
        /* Modo edición */
        <div className={styles.profileEditForm}>
          <div>
            <label className={styles.profileInputLabel}>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className={styles.profileInput}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className={styles.profileInputLabel}>
              <Phone size={12} className="inline mr-1" />
              Teléfono <span style={{ color: "var(--text-disabled)" }}>(opcional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={30}
              className={styles.profileInput}
              placeholder="+54 9 11 0000-0000"
            />
          </div>

          {error && (
            <p className={styles.profileError}>
              <AlertTriangle size={13} />{error}
            </p>
          )}
          {success && (
            <p className={styles.profileSuccess}>
              <CheckCircle2 size={13} /> Guardado
            </p>
          )}

          <div className={styles.profileEditActions}>
            <button type="button" onClick={handleCancel} className={styles.cancelEditBtn}>
              <X size={14} /> Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={styles.saveEditBtn}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Guardar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Panel: Cambiar contraseña ─────────────────────────────────────

function PasswordPanel({ user }: { user: AuthUser }) {
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurr, setShowCurr] = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [curr,    setCurr]    = useState("");
  const [next,    setNext]    = useState("");

  // Usuarios OAuth no tienen contraseña local
  const isOAuth = !!(user as any).provider && (user as any).provider !== "local";

  const handleSave = async () => {
    if (next.length < 6) { setError("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    setSaving(true); setError(null);
    try {
      await changeMyPassword({ currentPassword: curr, newPassword: next });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setOpen(false); setCurr(""); setNext(""); }, 2000);
    } catch (e: any) {
      setError(e.message ?? "Error al cambiar contraseña");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.securityCard} aria-label="Seguridad">
      <div className={styles.profileCardHeader}>
        <p className={styles.sectionLabel}>
          <Lock size={12} className="inline mr-1" />
          Seguridad
        </p>
      </div>

      {isOAuth ? (
        <p className={styles.oauthNote}>
          Tu cuenta usa Google para iniciar sesión. El cambio de contraseña se gestiona desde Google.
        </p>
      ) : !open ? (
        <button type="button" onClick={() => setOpen(true)} className={styles.changePassBtn}>
          Cambiar contraseña
          <ChevronRight size={15} />
        </button>
      ) : (
        <div className={styles.profileEditForm}>
          <div className={styles.passwordInputWrap}>
            <label className={styles.profileInputLabel}>Contraseña actual</label>
            <div className={styles.inputWithIcon}>
              <input
                type={showCurr ? "text" : "password"}
                value={curr}
                onChange={(e) => setCurr(e.target.value)}
                className={styles.profileInput}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowCurr((v) => !v)} className={styles.eyeBtn}>
                {showCurr ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className={styles.passwordInputWrap}>
            <label className={styles.profileInputLabel}>Nueva contraseña</label>
            <div className={styles.inputWithIcon}>
              <input
                type={showNew ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className={styles.profileInput}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} className={styles.eyeBtn}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error   && <p className={styles.profileError}>  <AlertTriangle size={13}/>{error}</p>}
          {success && <p className={styles.profileSuccess}><CheckCircle2 size={13}/> Contraseña actualizada</p>}

          <div className={styles.profileEditActions}>
            <button type="button" onClick={() => { setOpen(false); setCurr(""); setNext(""); setError(null); }} className={styles.cancelEditBtn}>
              <X size={14} /> Cancelar
            </button>
            <button type="button" onClick={handleSave} disabled={saving || !curr || !next} className={styles.saveEditBtn}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Guardar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Componente principal ──────────────────────────────────────────

export const AccountView = memo(function AccountView({ user, onLogout }: Props) {
  const cart           = useClienteStore((s) => s.cart);
  const tableId        = useClienteStore((s) => s.tableId);
  const sessionId      = useClienteStore((s) => s.sessionId);
  const orders         = useOrdersStore((s) => s.orders);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);

  const [orderHistory,      setOrderHistory]      = useState<OrderHistoryItem[]>([]);
  const [nextReservation,   setNextReservation]   = useState<UpcomingReservation | null>(null);
  const [loadingHistory,    setLoadingHistory]    = useState(false);
  const [activeOrderId,     setActiveOrderId]     = useState<string | null>(null);
  const [activeOrderStatus, setActiveOrderStatus] = useState<string | null>(null);

  // Iniciales del avatar
  const initials = user.name
    .split(" ").slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Carrito
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  // ── Cargar historial real desde /orders/my-history ─────────────
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await getMyOrderHistory({ limit: 8 });
      setOrderHistory(res.data ?? []);
      const active = res.data?.find(
        (o) => o.status === "pending" || o.status === "in-progress"
      );
      if (active) {
        setActiveOrderId(active._id);
        setActiveOrderStatus(active.status);
      }
    } catch {
      // silencioso
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // ── Cargar próxima reserva ─────────────────────────────────────
  const fetchNextReservation = useCallback(async () => {
    try {
      const reservations = await getMyReservations({ upcoming: true, limit: 1 });
      if (reservations.length > 0) {
        setNextReservation(reservations[0] as UpcomingReservation);
      }
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchNextReservation();
  }, [fetchHistory, fetchNextReservation]);

  // ── Socket.IO — tiempo real para órdenes propias ───────────────
  useEffect(() => {
    initSocket();
    if (user._id) joinUserRoom(user._id);

    const unsub = onOrderStatus((data) => {
      const order = data.order;
      if (!order) return;
      updateOrderStatus(order._id, order.status, order.updatedAt ?? new Date().toISOString());
      if (order._id === activeOrderId) setActiveOrderStatus(order.status);
    });

    return () => { unsub(); };
  }, [user._id, activeOrderId, updateOrderStatus]);

  // Estado en tiempo real del pedido activo
  const realtimeStatus = activeOrderId
    ? (orders.get(activeOrderId)?.status ?? activeOrderStatus)
    : null;

  // ── Logout real — invalida el refresh token en el servidor ─────
  const handleLogout = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        // Llama al backend para invalidar la sesión
        await api.post("/auth/logout", { refreshToken }).catch(() => {});
      }
    } finally {
      clearTokens();
      onLogout();
    }
  }, [onLogout]);

  return (
    <div className={styles.wrapper}>

      {/* ── 1. HERO: avatar + nombre + email ────────────────────── */}
      <div className={styles.hero}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
        ) : (
          <div className={styles.avatar} aria-hidden="true">
            <span className={styles.avatarInitials}>{initials}</span>
          </div>
        )}
        <div className={styles.heroText}>
          <p className={styles.greeting}>
            Hola, <span className={styles.greetingName}>{user.name.split(" ")[0]}</span>
          </p>
          <p className={styles.roleLabel}>{roleLabel(user.role)}</p>
          <p className={styles.heroEmail}>{user.email}</p>
        </div>
      </div>

      {/* ── 2. PEDIDO EN CURSO (tiempo real) ────────────────────── */}
      {realtimeStatus && activeOrderId && (
        <div
          className={[
            styles.liveOrderBanner,
            realtimeStatus === "in-progress" ? styles.liveOrderBannerPrep : "",
            realtimeStatus === "completed"   ? styles.liveOrderBannerDone : "",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <span className={styles.liveOrderDot} aria-hidden="true" />
          <div className={styles.liveOrderInfo}>
            <p className={styles.liveOrderLabel}>Pedido en curso</p>
            <p className={styles.liveOrderStatus}>
              {STATUS_CONFIG[realtimeStatus]?.label ?? realtimeStatus}
            </p>
          </div>
          <div className={styles.liveProgressTrack} aria-hidden="true">
            <div className={[
              styles.liveProgressBar,
              realtimeStatus === "pending"      ? styles.liveBarPending :
              realtimeStatus === "in-progress"  ? styles.liveBarPrep    :
              realtimeStatus === "completed"    ? styles.liveBarDone    : "",
            ].join(" ")} />
          </div>
          <div className={styles.liveSteps}>
            {(["pending", "in-progress", "completed"] as const).map((step) => {
              const steps = ["pending", "in-progress", "completed"];
              const curr  = steps.indexOf(realtimeStatus ?? "pending");
              const idx   = steps.indexOf(step);
              return (
                <div key={step} className={[
                  styles.liveStep,
                  idx === curr ? styles.liveStepCurrent : "",
                  idx < curr   ? styles.liveStepDone    : "",
                ].join(" ")}>
                  <span className={styles.liveStepDot} aria-hidden="true" />
                  <span className={styles.liveStepLabel}>
                    {step === "pending" ? "Enviado" : step === "in-progress" ? "Preparando" : "Listo"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. BANNER PRÓXIMA RESERVA ───────────────────────────── */}
      {nextReservation && (
        <Link href="/cliente/reservas" className={styles.reservationBanner}>
          <CalendarDays size={18} className={styles.reservationIcon} />
          <div className={styles.reservationInfo}>
            <p className={styles.reservationLabel}>Próxima reserva</p>
            <p className={styles.reservationDetail}>
              {fmtDate(nextReservation.startTime)} · {fmtTime(nextReservation.startTime)}
              {" · "}{nextReservation.guests} persona{nextReservation.guests !== 1 ? "s" : ""}
            </p>
          </div>
          <span className={[
            styles.reservationBadge,
            nextReservation.status === "confirmed" ? styles.reservBadgeConfirmed : styles.reservBadgePending,
          ].join(" ")}>
            {RESERVATION_STATUS[nextReservation.status] ?? nextReservation.status}
          </span>
        </Link>
      )}

      {/* ── 4. CARRITO RÁPIDO ───────────────────────────────────── */}
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

      {/* ── 5. ACCIONES RÁPIDAS ──────────────────────────────────── */}
      <nav aria-label="Acciones rápidas">
        <p className={styles.sectionLabel}>¿Qué querés hacer?</p>
        <div className={styles.quickGrid}>
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={[styles.quickCard, styles[`quickCard_${a.accent}`]].join(" ")}
            >
              <span className={styles.quickEmoji} aria-hidden="true">{a.icon}</span>
              <span className={styles.quickLabel}>{a.label}</span>
              <span className={styles.quickSub}>{a.sub}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ── 6. HISTORIAL DE PEDIDOS REAL ────────────────────────── */}
      <section>
        <p className={styles.sectionLabel}>
          Historial de pedidos
          {tableId && <span className={styles.sectionMeta}> · Sesión activa</span>}
        </p>

        {loadingHistory ? (
          <div className={styles.ordersLoading}>
            <span className={styles.ordersSpinner} aria-hidden="true" />
            <span className={styles.ordersLoadingText}>Cargando historial…</span>
          </div>
        ) : orderHistory.length === 0 ? (
          <div className={styles.ordersEmpty}>
            <ClipboardList size={28} className="opacity-40" aria-hidden="true" />
            <p>No tenés pedidos registrados todavía.</p>
          </div>
        ) : (
          <ul className={styles.orderList} aria-label="Historial de pedidos">
            {orderHistory.map((order) => {
              const realtimeS = orders.get(order._id)?.status ?? order.status;
              const sc = STATUS_CONFIG[realtimeS] ?? STATUS_CONFIG.pending;
              return (
                <li key={order._id} className={styles.orderRow}>
                  <div className={styles.orderRowLeft}>
                    <span className={[styles.orderDot, sc.dotCls].join(" ")} aria-hidden="true" />
                    <div>
                      <p className={styles.orderRowTitle}>
                        {order.itemCount} ítem{order.itemCount !== 1 ? "s" : ""}
                        {order.tableNumber ? ` · Mesa #${order.tableNumber}` : ""}
                      </p>
                      <p className={styles.orderRowTime}>{fmtDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className={styles.orderRowRight}>
                    <span className={[styles.orderStatus, sc.statusCls].join(" ")}>
                      {sc.label}
                    </span>
                    <span className={styles.orderTotal}>{fmtPrice(order.total)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── 7. PERFIL EDITABLE ───────────────────────────────────── */}
      <ProfilePanel user={user} />

      {/* ── 8. SEGURIDAD — cambio de contraseña ─────────────────── */}
      <PasswordPanel user={user} />

      {/* ── 9. FAVORITOS (link a carta filtrada) ─────────────────── */}
      <Link href="/cliente/carta?filter=favorites" className={styles.favoritesLink}>
        <Heart size={16} />
        Ver mis favoritos
        <ChevronRight size={15} />
      </Link>

      {/* ── 10. LOGOUT ───────────────────────────────────────────── */}
      <div className={styles.logoutWrapper}>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
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
