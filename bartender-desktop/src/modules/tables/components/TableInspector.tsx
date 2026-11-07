"use client";

/**
 * TableInspector — Panel lateral de detalle de mesa.
 * REDISEÑO v3.0 — Slate Elegante
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Wrench, Pencil, Trash2, ClipboardList,
  Users, MapPin, Info, DollarSign, Clock, CreditCard,
  Receipt, Calendar, TrendingUp, Wallet, Tag,
  Percent, Megaphone, CheckCircle2, ChevronDown,
  ChevronRight, AlertTriangle, Maximize, Shield,
} from "lucide-react";

import TableForm from "./TableForm";
import type { Table } from "../types/table";

/* ── Helpers ───────────────────────────────────────────────── */
const fmtCurrency = (v: number) => `$${(v ?? 0).toFixed(2)}`;
const fmtTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "—";

/* ── Status config ─────────────────────────────────────────── */
const STATUS: Record<string, {
  label: string; dotColor: string;
  badgeBg: string; badgeBorder: string; badgeColor: string;
}> = {
  available:   { label: "LIBRE",         dotColor: "#F0B429", badgeBg: "rgba(240,180,41,0.10)", badgeBorder: "rgba(240,180,41,0.25)", badgeColor: "#F0B429"  },
  occupied:    { label: "OCUPADA",       dotColor: "#FF7B54", badgeBg: "rgba(255,123,84,0.10)", badgeBorder: "rgba(255,123,84,0.25)", badgeColor: "#FF9A7A"  },
  reserved:    { label: "RESERVADA",     dotColor: "#388BFD", badgeBg: "rgba(56,139,253,0.10)", badgeBorder: "rgba(56,139,253,0.25)", badgeColor: "#79C0FF"  },
  maintenance: { label: "MANTENIMIENTO", dotColor: "#F85149", badgeBg: "rgba(248,81,73,0.10)",  badgeBorder: "rgba(248,81,73,0.25)",  badgeColor: "#FF6B63"  },
};

/* ── TableCodeBadge ────────────────────────────────────────── */
function TableCodeBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div
      className="rounded-xl p-4 flex flex-col items-center gap-2"
      style={{ background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.25)" }}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "rgba(240,180,41,0.50)" }}>
        Código de mesa
      </p>
      <p className="text-5xl font-black tracking-[0.22em] leading-none" style={{ color: "#F0B429" }}>
        {code}
      </p>
      <p className="text-[9px] text-center leading-relaxed max-w-[160px]" style={{ color: "#566270" }}>
        El cliente ingresa este código en su dispositivo
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-0.5 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
        style={{ border: "1px solid rgba(240,180,41,0.25)", color: "#F0B429", background: "transparent" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,180,41,0.10)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        {copied ? "Copiado ✓" : "Copiar"}
      </button>
    </div>
  );
}

/* ── Section ───────────────────────────────────────────────── */
function Section({
  icon: Icon, title, children, collapsible = false, defaultOpen = true,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode;
  collapsible?: boolean; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={!collapsible}
        onClick={() => collapsible && setOpen((p) => !p)}
        className={`w-full flex items-center gap-2 ${collapsible ? "cursor-pointer" : "cursor-default"}`}
      >
        <Icon size={10} style={{ color: "#566270", flexShrink: 0 }} />
        <span className="text-[9px] font-black uppercase tracking-[0.22em] flex-1 text-left" style={{ color: "#566270" }}>
          {title}
        </span>
        {collapsible && (
          open
            ? <ChevronDown  size={10} style={{ color: "#3D444D" }} />
            : <ChevronRight size={10} style={{ color: "#3D444D" }} />
        )}
      </button>
      {open && children}
    </div>
  );
}

/* ── Row ───────────────────────────────────────────────────── */
function Row({ label, value, valueColor = "#8B949E" }: {
  label: string; value: React.ReactNode; valueColor?: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl"
      style={{ background: "rgba(33,40,58,0.8)", border: "1px solid #30363D" }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "#566270" }}>
        {label}
      </span>
      <span className="text-[11px] font-bold text-right" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

/* ── Props ─────────────────────────────────────────────────── */
interface Props {
  table:                Table | null;
  tables:               Table[];
  onOpen:               (id: string) => void;
  onClose:              (id: string) => void;
  onSave:               (table: Table) => void;
  onDelete:             (id: string) => void;
  onOrder:              () => void;
  onViewPaymentHistory?: () => void;
  onViewAnalytics?:     () => void;
  onPaymentSelector?:   () => void;
  onSeatReservation?:   () => void;
  onViewReservation?:   () => void;
}

/* ── EmptyState ────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8" style={{ opacity: 0.40 }}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "#21283A", border: "1px solid #30363D" }}
      >
        <Info size={22} style={{ color: "#566270" }} />
      </div>
      <h3 className="text-sm font-bold" style={{ color: "#566270" }}>Sin mesa seleccionada</h3>
      <p className="text-[10px] mt-1.5" style={{ color: "#3D444D" }}>Hacé clic en una mesa del plano</p>
    </div>
  );
}

/* ── TableInspector ────────────────────────────────────────── */
export default function TableInspector({
  table, tables, onOpen, onClose, onSave, onDelete,
  onOrder, onViewPaymentHistory, onViewAnalytics,
  onPaymentSelector, onSeatReservation, onViewReservation,
}: Props) {
  const [editing, setEditing] = useState(false);

  if (!table) {
    return (
      <div className="h-full overflow-hidden" style={{ background: "#161B22" }}>
        <EmptyState />
      </div>
    );
  }

  if (editing) {
    return (
      <TableForm
        table={table}
        existingTables={tables}
        onSave={(t) => { onSave(t); setEditing(false); }}
        onClose={() => setEditing(false)}
      />
    );
  }

  const cfg = STATUS[table.status] ?? STATUS.maintenance;

  const totalAmount = table.totalAmount  ?? (table.orders?.reduce((s, o) => s + (o.total ?? 0), 0) ?? 0);
  const totalPaid   = table.totalPaid    ?? table.totalPayments ?? 0;
  const balanceDue  = table.balanceDue   ?? Math.max(0, totalAmount - totalPaid);

  const openOrders             = table.orders?.filter((o) => o.sessionStatus === "open") ?? [];
  const hasPendingOrInProgress = openOrders.some((o) => o.status === "pending" || o.status === "in-progress");

  type OrderWithDiscount = typeof openOrders[number] & {
    discountAmount?: number; discountType?: string;
    discountReason?: string; promotionName?: string; originalTotal?: number;
  };
  const ordersWithDiscount = (openOrders as OrderWithDiscount[]).filter((o) => (o.discountAmount ?? 0) > 0);
  const totalDiscount      = ordersWithDiscount.reduce((s, o) => s + (o.discountAmount ?? 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col overflow-hidden"
      style={{ background: "#161B22" }}
    >

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #30363D" }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-1" style={{ color: "#566270" }}>Mesa</p>
            <h2 className="text-4xl font-extrabold tracking-tight leading-none" style={{ color: "#E6EDF3" }}>
              #{table.number}
            </h2>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest"
            style={{ background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}`, color: cfg.badgeColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.dotColor }} />
            {cfg.label}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div
            className="flex items-center gap-2 p-2.5 rounded-xl"
            style={{ background: "#21283A", border: "1px solid #30363D" }}
          >
            <Users size={13} style={{ color: "#F0B429", flexShrink: 0 }} />
            <div>
              <p className="text-[8px] uppercase tracking-wider leading-none mb-0.5" style={{ color: "#566270" }}>Capacidad</p>
              <p className="text-sm font-bold" style={{ color: "#E6EDF3" }}>
                {table.capacity} <span style={{ fontSize: 9, color: "#566270" }}>pax</span>
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 p-2.5 rounded-xl"
            style={{ background: "#21283A", border: "1px solid #30363D" }}
          >
            <DollarSign size={13} style={{ color: "#3FB950", flexShrink: 0 }} />
            <div>
              <p className="text-[8px] uppercase tracking-wider leading-none mb-0.5" style={{ color: "#566270" }}>Cuenta</p>
              <p className="text-sm font-bold" style={{ color: "#3FB950" }}>{fmtCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body scrollable ────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
      >

        {/* Código de mesa */}
        {table.status === "occupied" && table.tableCode && (
          <TableCodeBadge code={table.tableCode} />
        )}

        {/* Especificaciones */}
        <Section icon={Info} title="Especificaciones">
          <div className="space-y-1.5">
            <Row
              label="Ubicación"
              value={
                <span className="flex items-center gap-1">
                  <MapPin size={10} style={{ color: "#F0B429" }} />
                  {table.location}
                </span>
              }
            />
            <Row label="Último cierre" value={fmtTime(table.closedAt)} />
            {table.notes && (
              <div
                className="px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(33,40,58,0.6)", border: "1px solid #30363D" }}
              >
                <p className="text-[10px] italic leading-relaxed" style={{ color: "#566270" }}>
                  "{table.notes}"
                </p>
              </div>
            )}
          </div>
        </Section>

        {!table.notes && (
          <Section icon={Shield} title="Notas de servicio">
            <div
              className="px-3 py-4 rounded-xl text-center"
              style={{ background: "rgba(22,27,34,0.6)", border: "1px solid #30363D" }}
            >
              <p className="text-[10px] italic" style={{ color: "#3D444D" }}>Sin notas de servicio</p>
            </div>
          </Section>
        )}

        {/* Reserva actual */}
        {table.status === "reserved" && table.currentReservation && (
          <Section icon={Calendar} title="Reserva actual">
            <div
              className="rounded-xl p-3 space-y-2"
              style={{ background: "rgba(56,139,253,0.06)", border: "1px solid rgba(56,139,253,0.20)" }}
            >
              <Row label="Estado" value="Confirmada" valueColor="#79C0FF" />
              <Row label="ID" value={table.currentReservation.toString().slice(-8).toUpperCase()} />
              <div className="flex flex-col gap-1.5 pt-1">
                {onViewReservation && (
                  <button
                    type="button"
                    onClick={onViewReservation}
                    className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors"
                    style={{ border: "1px solid rgba(163,113,247,0.25)", color: "#A371F7", background: "transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(163,113,247,0.10)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    Ver en Reservas
                  </button>
                )}
                {onSeatReservation && (
                  <button
                    type="button"
                    onClick={onSeatReservation}
                    className="w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all"
                    style={{ background: "#F0B429", color: "#0D1117" }}
                  >
                    Sentar clientes
                  </button>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Pedidos */}
        {table.status === "occupied" && (
          <Section icon={ClipboardList} title="Pedidos">
            {totalAmount > 0 ? (
              <div className="space-y-1.5">
                <Row label="Total pedidos" value={fmtCurrency(totalAmount)} valueColor="#3FB950" />
                {(table.totalItems ?? 0) > 0 && (
                  <Row label="Ítems" value={String(table.totalItems)} />
                )}
                {table.itemCounts && Object.keys(table.itemCounts).length > 0 && (
                  <div
                    className="rounded-xl"
                    style={{ border: "1px solid #30363D", background: "rgba(22,27,34,0.6)" }}
                  >
                    {Object.entries(table.itemCounts).map(([name, count], i, arr) => (
                      <div
                        key={name}
                        className="flex justify-between items-center px-3 py-2 text-[10px]"
                        style={{ borderBottom: i < arr.length - 1 ? "1px solid #30363D" : "none" }}
                      >
                        <span className="truncate" style={{ color: "#566270" }}>{name}</span>
                        <span className="font-bold flex-shrink-0 ml-2" style={{ color: "#E6EDF3" }}>
                          {count as number}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="px-3 py-4 rounded-xl text-center"
                style={{ background: "rgba(22,27,34,0.6)", border: "1px solid #30363D" }}
              >
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "#3D444D" }}>Sin pedidos</p>
              </div>
            )}
          </Section>
        )}

        {/* Descuentos */}
        {table.status === "occupied" && (
          <Section icon={Tag} title="Descuentos y Promociones" collapsible defaultOpen={totalDiscount > 0}>
            {totalDiscount > 0 ? (
              <div className="space-y-2">
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.20)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.20)" }}
                    >
                      <Percent size={12} style={{ color: "#F0B429" }} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-black" style={{ color: "rgba(240,180,41,0.50)" }}>
                        Ahorro total
                      </p>
                      <p className="text-base font-extrabold leading-none" style={{ color: "#F0B429" }}>
                        −{fmtCurrency(totalDiscount)}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 size={15} style={{ color: "rgba(240,180,41,0.40)" }} />
                </div>

                {ordersWithDiscount.map((o) => (
                  <div
                    key={o._id}
                    className="p-3 rounded-xl space-y-1"
                    style={{ background: "rgba(22,27,34,0.6)", border: "1px solid #30363D" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {o.promotionName
                          ? <Megaphone size={10} style={{ color: "#A371F7", flexShrink: 0 }} />
                          : <Percent   size={10} style={{ color: "rgba(240,180,41,0.6)", flexShrink: 0 }} />
                        }
                        <span className="text-[10px] font-semibold truncate" style={{ color: "#E6EDF3" }}>
                          {o.promotionName ?? (o.discountType === "PERCENT"
                            ? `Descuento ${o.discountAmount ?? 0}%`
                            : "Descuento fijo")}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold flex-shrink-0" style={{ color: "#F0B429" }}>
                        −{fmtCurrency(o.discountAmount ?? 0)}
                      </span>
                    </div>
                    {o.discountReason && (
                      <p className="text-[9px] italic pl-4" style={{ color: "#3D444D" }}>
                        Motivo: {o.discountReason}
                      </p>
                    )}
                    {o.originalTotal != null && (
                      <div className="flex items-center gap-2 pl-4">
                        <span className="text-[9px] line-through" style={{ color: "#3D444D" }}>
                          {fmtCurrency(o.originalTotal)}
                        </span>
                        <span className="text-[9px] font-bold" style={{ color: "#3FB950" }}>
                          {fmtCurrency(o.total)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl"
                style={{ background: "rgba(22,27,34,0.6)", border: "1px solid #30363D" }}
              >
                <Tag size={13} style={{ color: "#3D444D" }} />
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#3D444D" }}>
                  Sin descuentos aplicados
                </p>
              </div>
            )}
          </Section>
        )}

        {/* Pagos */}
        <Section icon={CreditCard} title="Pagos de sesión">
          {totalAmount > 0 ? (
            <div className="space-y-1.5">
              {totalDiscount > 0 && (
                <Row label="Subtotal" value={fmtCurrency(totalAmount + totalDiscount)} valueColor="#566270" />
              )}
              {totalDiscount > 0 && (
                <Row label="Descuentos" value={`−${fmtCurrency(totalDiscount)}`} valueColor="#F0B429" />
              )}
              <Row label="Total cuenta" value={fmtCurrency(totalAmount)} />
              <Row label="Total pagado"  value={fmtCurrency(totalPaid)}    valueColor="#388BFD" />
              <div
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background:  balanceDue > 0 ? "rgba(240,180,41,0.06)" : "rgba(63,185,80,0.06)",
                  border:      balanceDue > 0 ? "1px solid rgba(240,180,41,0.20)" : "1px solid rgba(63,185,80,0.20)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#566270" }}>
                  Saldo pendiente
                </span>
                <span className="text-base font-extrabold" style={{ color: balanceDue > 0 ? "#F0B429" : "#3FB950" }}>
                  {fmtCurrency(balanceDue)}
                </span>
              </div>
              {table.lastPaymentAt && (
                <Row
                  label="Último pago"
                  value={new Date(table.lastPaymentAt).toLocaleString("es-AR", {
                    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short",
                  })}
                />
              )}
            </div>
          ) : (
            <div
              className="px-3 py-4 rounded-xl text-center"
              style={{ background: "rgba(22,27,34,0.6)", border: "1px solid #30363D" }}
            >
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "#3D444D" }}>
                Sin pagos registrados
              </p>
            </div>
          )}

          {onViewPaymentHistory && (
            <button
              type="button"
              onClick={onViewPaymentHistory}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3";
                (e.currentTarget as HTMLButtonElement).style.background = "#293042";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#8B949E";
                (e.currentTarget as HTMLButtonElement).style.background = "#21283A";
              }}
            >
              <Receipt size={12} />
              Ver historial
            </button>
          )}
        </Section>

        {/* Dimensiones */}
        <Section icon={Maximize} title="Dimensiones" collapsible defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {(["width", "height"] as const).map((dim) => (
              <div
                key={dim}
                className="flex flex-col gap-1.5 p-2.5 rounded-xl"
                style={{ background: "rgba(22,27,34,0.6)", border: "1px solid #30363D" }}
              >
                <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: "#566270" }}>
                  {dim === "width" ? "Ancho" : "Alto"} ({table[dim] ?? 120}px)
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onSave({ ...table, [dim]: Math.max(60, (table[dim] ?? 120) - 10) })}
                    className="flex-1 py-1 rounded-lg text-[10px] font-bold transition-all"
                    style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
                  >
                    −10
                  </button>
                  <button
                    type="button"
                    onClick={() => onSave({ ...table, [dim]: Math.min(250, (table[dim] ?? 120) + 10) })}
                    className="flex-1 py-1 rounded-lg text-[10px] font-bold transition-all"
                    style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
                  >
                    +10
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Analytics */}
        {onViewAnalytics && (
          <Section icon={TrendingUp} title="Analytics">
            <button
              type="button"
              onClick={onViewAnalytics}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{ background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.15)", color: "#F0B429" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,180,41,0.12)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,180,41,0.06)"; }}
            >
              <TrendingUp size={13} />
              Ver analytics de mesa
            </button>
          </Section>
        )}
      </div>

      {/* ── Footer: acciones ───────────────────────────────── */}
      <div
        className="flex-shrink-0 p-4 space-y-2"
        style={{ borderTop: "1px solid #30363D", background: "#0D1117" }}
      >
        {/* Disponible → Abrir */}
        {table.status === "available" && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onOpen(table._id!)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
            style={{ background: "#F0B429", color: "#0D1117", boxShadow: "0 4px 16px rgba(240,180,41,0.25)" }}
          >
            <Play size={15} fill="currentColor" />
            Abrir mesa
          </motion.button>
        )}

        {/* Ocupada → acciones */}
        {table.status === "occupied" && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onOrder}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider"
              style={{ background: "#21283A", border: "1px solid #30363D", color: "#E6EDF3" }}
            >
              <ClipboardList size={14} />
              Nueva orden
            </motion.button>

            <motion.button
              whileHover={hasPendingOrInProgress ? {} : { scale: 1.02 }}
              whileTap={hasPendingOrInProgress ? {} : { scale: 0.98 }}
              type="button"
              onClick={hasPendingOrInProgress ? undefined : onPaymentSelector}
              disabled={hasPendingOrInProgress}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
              style={hasPendingOrInProgress
                ? { background: "#21283A", border: "1px solid #30363D", color: "#566270", cursor: "not-allowed" }
                : { background: "#F0B429", color: "#0D1117", boxShadow: "0 4px 16px rgba(240,180,41,0.22)" }
              }
            >
              <Wallet size={14} />
              Procesar pago
            </motion.button>

            {hasPendingOrInProgress && (
              <div
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{ background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.20)" }}
              >
                <AlertTriangle size={11} style={{ color: "#F0B429", flexShrink: 0 }} />
                <p className="text-[9px] font-semibold" style={{ color: "#FF7B54" }}>
                  Hay pedidos en preparación — esperá para cobrar
                </p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onClose(table._id!)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider"
              style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.20)", color: "#FF6B63" }}
            >
              <Wrench size={13} />
              Cerrar mesa
            </motion.button>
          </>
        )}

        {/* Reservada → Sentar */}
        {table.status === "reserved" && onSeatReservation && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onSeatReservation}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
            style={{ background: "#F0B429", color: "#0D1117", boxShadow: "0 4px 16px rgba(240,180,41,0.25)" }}
          >
            <Users size={14} />
            Sentar clientes
          </motion.button>
        )}

        {/* Mantenimiento */}
        {table.status === "maintenance" && (
          <div className="text-center py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#566270" }}>
              En mantenimiento
            </p>
          </div>
        )}

        {/* Editar + Eliminar */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
            style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
          >
            <Pencil size={11} /> Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(table._id!)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
            style={{ background: "rgba(248,81,73,0.06)", border: "1px solid rgba(248,81,73,0.15)", color: "rgba(248,81,73,0.50)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F85149"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,81,73,0.50)"; }}
          >
            <Trash2 size={11} /> Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
