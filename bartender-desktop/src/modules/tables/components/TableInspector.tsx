"use client";

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

/* ── Tiny helpers ─────────────────────────────────────────────── */
const fmtCurrency = (v: number) => `$${(v ?? 0).toFixed(2)}`;
const fmtTime     = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "—";

/* ── Status config ────────────────────────────────────────────── */
const STATUS: Record<string, { label: string; dot: string; badge: string }> = {
  available:   { label: "LIBRE",          dot: "bg-gold",        badge: "bg-gold/10    border-gold/25    text-gold"        },
  occupied:    { label: "OCUPADA",        dot: "bg-amber-400",   badge: "bg-amber-400/10 border-amber-400/25 text-amber-300" },
  reserved:    { label: "RESERVADA",      dot: "bg-blue-400",    badge: "bg-blue-400/10 border-blue-400/25 text-blue-300"  },
  maintenance: { label: "MANTENIMIENTO",  dot: "bg-red-400",     badge: "bg-red-500/10 border-red-500/25 text-red-300"    },
};

/* ── Código de mesa ───────────────────────────────────────────── */
function TableCodeBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div className="rounded-2xl border border-gold/25 bg-gold/6 p-4 flex flex-col items-center gap-2">
      <p className="text-[9px] font-black text-gold/50 uppercase tracking-[0.3em]">Código de mesa</p>
      <p className="text-5xl font-black text-gold tracking-[0.22em] leading-none">{code}</p>
      <p className="text-[9px] text-muted/50 text-center leading-relaxed max-w-[160px]">
        El cliente ingresa este código en su dispositivo
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-0.5 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gold/20 text-gold hover:bg-gold/10 active:scale-95 transition-all"
      >
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

/* ── Section wrapper ──────────────────────────────────────────── */
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
        className={`w-full flex items-center gap-2 ${collapsible ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
      >
        <Icon size={11} className="text-muted/40 flex-shrink-0" />
        <span className="text-[9px] font-black text-muted/40 uppercase tracking-[0.22em] flex-1 text-left">{title}</span>
        {collapsible && (
          open
            ? <ChevronDown size={11} className="text-muted/30" />
            : <ChevronRight size={11} className="text-muted/30" />
        )}
      </button>
      {open && children}
    </div>
  );
}

/* ── Row ──────────────────────────────────────────────────────── */
function Row({
  label, value, valueColor = "text-ivory/70",
}: {
  label: string; value: React.ReactNode; valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{label}</span>
      <span className={`text-[11px] font-bold ${valueColor} text-right`}>{value}</span>
    </div>
  );
}

/* ── Props ────────────────────────────────────────────────────── */
interface Props {
  table: Table | null;
  tables: Table[];
  onOpen: (id: string) => void;
  onClose: (id: string) => void;
  onSave: (table: Table) => void;
  onDelete: (id: string) => void;
  onOrder: () => void;
  onViewPaymentHistory?: () => void;
  onViewAnalytics?: () => void;
  onPaymentSelector?: () => void;
  onSeatReservation?: () => void;
  onViewReservation?: () => void;
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Info size={22} className="text-muted" />
      </div>
      <h3 className="text-sm font-bold text-muted">Sin mesa seleccionada</h3>
      <p className="text-[10px] text-muted/50 mt-1.5">Hacé clic en una mesa del plano</p>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function TableInspector({
  table, tables, onOpen, onClose, onSave, onDelete,
  onOrder, onViewPaymentHistory, onViewAnalytics,
  onPaymentSelector, onSeatReservation, onViewReservation,
}: Props) {
  const [editing, setEditing] = useState(false);

  if (!table) return (
    <div className="h-full rounded-3xl glass border border-white/5 overflow-hidden">
      <EmptyState />
    </div>
  );

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

  /* Financials */
  const totalAmount  = table.totalAmount  ?? (table.orders?.reduce((s, o) => s + (o.total ?? 0), 0) ?? 0);
  const totalPaid    = table.totalPaid    ?? table.totalPayments ?? 0;
  const balanceDue   = table.balanceDue   ?? Math.max(0, totalAmount - totalPaid);

  /* Orders */
  const openOrders            = table.orders?.filter((o) => o.sessionStatus === "open") ?? [];
  const hasPendingOrInProgress = openOrders.some((o) => o.status === "pending" || o.status === "in-progress");

  /* Discounts */
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
      className="h-full flex flex-col glass rounded-3xl border border-white/[0.06] overflow-hidden shadow-2xl"
    >
      {/* ── HEADER ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-white/[0.05]">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[9px] font-black text-muted/40 uppercase tracking-[0.25em] mb-1">Mesa</p>
            <h2 className="text-4xl font-extrabold text-ivory tracking-tight leading-none">
              #{table.number}
            </h2>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05]">
            <Users size={14} className="text-gold flex-shrink-0" />
            <div>
              <p className="text-[8px] text-muted uppercase tracking-wider leading-none mb-0.5">Capacidad</p>
              <p className="text-sm font-bold text-ivory">{table.capacity} <span className="text-[9px] text-muted/50">pax</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05]">
            <DollarSign size={14} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-[8px] text-muted uppercase tracking-wider leading-none mb-0.5">Cuenta</p>
              <p className="text-sm font-bold text-emerald-300">{fmtCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">

        {/* Código de mesa (occupied) */}
        {table.status === "occupied" && table.tableCode && (
          <TableCodeBadge code={table.tableCode} />
        )}

        {/* Especificaciones */}
        <Section icon={Info} title="Especificaciones">
          <div className="space-y-1.5">
            <Row label="Ubicación"     value={<span className="flex items-center gap-1"><MapPin size={10} className="text-gold" />{table.location}</span>} />
            <Row label="Último cierre" value={fmtTime(table.closedAt)} />
            {table.notes && (
              <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[10px] text-muted/60 italic leading-relaxed">"{table.notes}"</p>
              </div>
            )}
          </div>
        </Section>

        {/* Notas de servicio */}
        {!table.notes && (
          <Section icon={Shield} title="Notas de servicio">
            <div className="px-3 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
              <p className="text-[10px] text-muted/30 italic">Sin notas de servicio</p>
            </div>
          </Section>
        )}

        {/* Reserva actual */}
        {table.status === "reserved" && table.currentReservation && (
          <Section icon={Calendar} title="Reserva actual">
            <div className="rounded-xl border border-blue-400/20 bg-blue-400/6 p-3 space-y-2">
              <Row label="Estado"    value="Confirmada"    valueColor="text-blue-300" />
              <Row label="ID"        value={table.currentReservation.toString().slice(-8).toUpperCase()} />
              <div className="flex flex-col gap-1.5 pt-1">
                {onViewReservation && (
                  <button type="button" onClick={onViewReservation}
                    className="w-full py-2 rounded-lg text-[10px] font-bold text-violet-300 border border-violet-400/20 hover:bg-violet-500/10 transition-colors uppercase tracking-wide">
                    Ver en Reservas
                  </button>
                )}
                {onSeatReservation && (
                  <button type="button" onClick={onSeatReservation}
                    className="w-full py-2.5 rounded-lg nebula-btn-primary text-[10px] font-bold uppercase tracking-wide">
                    Sentar clientes
                  </button>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Resumen de pedidos (occupied) */}
        {table.status === "occupied" && (
          <Section icon={ClipboardList} title="Pedidos">
            {(totalAmount > 0) ? (
              <div className="space-y-1.5">
                <Row label="Total pedidos"  value={fmtCurrency(totalAmount)} valueColor="text-emerald-300" />
                {(table.totalItems ?? 0) > 0 && (
                  <Row label="Ítems" value={String(table.totalItems)} valueColor="text-cyan-300" />
                )}
                {table.itemCounts && Object.keys(table.itemCounts).length > 0 && (
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] divide-y divide-white/[0.04]">
                    {Object.entries(table.itemCounts).map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center px-3 py-2 text-[10px]">
                        <span className="text-muted/70 truncate">{name}</span>
                        <span className="font-bold text-ivory flex-shrink-0 ml-2">{count as number}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-3 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <p className="text-[10px] text-muted/30 uppercase tracking-wider">Sin pedidos</p>
              </div>
            )}
          </Section>
        )}

        {/* Descuentos & Promociones (occupied) */}
        {table.status === "occupied" && (
          <Section icon={Tag} title="Descuentos y Promociones" collapsible defaultOpen={totalDiscount > 0}>
            {totalDiscount > 0 ? (
              <div className="space-y-2">
                {/* Banner ahorro */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gold/6 border border-gold/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gold/12 border border-gold/20 flex items-center justify-center">
                      <Percent size={12} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gold/50 uppercase tracking-widest font-black">Ahorro total</p>
                      <p className="text-base font-extrabold text-gold leading-none">−{fmtCurrency(totalDiscount)}</p>
                    </div>
                  </div>
                  <CheckCircle2 size={15} className="text-gold/40" />
                </div>
                {/* Detalle */}
                {ordersWithDiscount.map((o) => (
                  <div key={o._id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {o.promotionName
                          ? <Megaphone size={10} className="text-violet-400 flex-shrink-0" />
                          : <Percent   size={10} className="text-gold/60  flex-shrink-0" />
                        }
                        <span className="text-[10px] font-semibold text-ivory truncate">
                          {o.promotionName ?? (o.discountType === "PERCENT" ? `Descuento ${o.discountAmount ?? 0}%` : "Descuento fijo")}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-gold flex-shrink-0">
                        −{fmtCurrency(o.discountAmount ?? 0)}
                      </span>
                    </div>
                    {o.discountReason && (
                      <p className="text-[9px] text-muted/40 italic pl-4">Motivo: {o.discountReason}</p>
                    )}
                    {o.originalTotal != null && (
                      <div className="flex items-center gap-2 pl-4">
                        <span className="text-[9px] text-muted/30 line-through">{fmtCurrency(o.originalTotal)}</span>
                        <span className="text-[9px] text-emerald-400 font-bold">{fmtCurrency(o.total)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <Tag size={13} className="text-muted/25" />
                <p className="text-[10px] text-muted/35 uppercase tracking-wider font-semibold">Sin descuentos aplicados</p>
              </div>
            )}
          </Section>
        )}

        {/* Pagos */}
        <Section icon={CreditCard} title="Pagos de sesión">
          {totalAmount > 0 ? (
            <div className="space-y-1.5">
              {totalDiscount > 0 && (
                <Row label="Subtotal" value={fmtCurrency(totalAmount + totalDiscount)} valueColor="text-muted/60" />
              )}
              {totalDiscount > 0 && (
                <Row label="Descuentos" value={`−${fmtCurrency(totalDiscount)}`} valueColor="text-gold" />
              )}
              <Row label="Total cuenta" value={fmtCurrency(totalAmount)} />
              <Row label="Total pagado" value={fmtCurrency(totalPaid)} valueColor="text-blue-300" />
              <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border ${
                balanceDue > 0
                  ? "bg-amber-500/8 border-amber-500/20"
                  : "bg-emerald-500/8 border-emerald-500/20"
              }`}>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Saldo pendiente</span>
                <span className={`text-base font-extrabold ${balanceDue > 0 ? "text-amber-300" : "text-emerald-300"}`}>
                  {fmtCurrency(balanceDue)}
                </span>
              </div>
              {table.lastPaymentAt && (
                <Row label="Último pago" value={new Date(table.lastPaymentAt).toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })} />
              )}
            </div>
          ) : (
            <div className="px-3 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
              <p className="text-[10px] text-muted/30 uppercase tracking-wider">Sin pagos registrados</p>
            </div>
          )}

          {onViewPaymentHistory && (
            <button type="button" onClick={onViewPaymentHistory}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[10px] font-bold text-muted hover:text-ivory hover:bg-white/[0.07] transition-all uppercase tracking-wider">
              <Receipt size={12} />
              Ver historial
            </button>
          )}
        </Section>

        {/* Dimensiones del plano */}
        <Section icon={Maximize} title="Dimensiones" collapsible defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {(["width", "height"] as const).map((dim) => (
              <div key={dim} className="flex flex-col gap-1.5 p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                <span className="text-[8px] font-black text-muted uppercase tracking-wider">
                  {dim === "width" ? "Ancho" : "Alto"} ({table[dim] ?? 120}px)
                </span>
                <div className="flex gap-1">
                  <button type="button"
                    onClick={() => onSave({ ...table, [dim]: Math.max(60, (table[dim] ?? 120) - 10) })}
                    className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-muted hover:text-ivory border border-white/5 transition-all">
                    −10
                  </button>
                  <button type="button"
                    onClick={() => onSave({ ...table, [dim]: Math.min(250, (table[dim] ?? 120) + 10) })}
                    className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-muted hover:text-ivory border border-white/5 transition-all">
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
            <button type="button" onClick={onViewAnalytics}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gold/6 border border-gold/15 text-gold text-[10px] font-bold uppercase tracking-wider hover:bg-gold/12 transition-all">
              <TrendingUp size={14} />
              Ver analytics de mesa
            </button>
          </Section>
        )}
      </div>

      {/* ── FOOTER ACTIONS ────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-white/[0.05] p-4 space-y-2 bg-[#09090E]/60 backdrop-blur-sm">
        {table.status === "available" && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onOpen(table._id!)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gold text-bg font-bold text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(212,163,64,0.25)] hover:brightness-110 transition-all"
          >
            <Play size={15} fill="currentColor" />
            Abrir mesa
          </motion.button>
        )}

        {table.status === "occupied" && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onOrder}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-ivory font-bold text-xs uppercase tracking-wider hover:bg-white/8 transition-all"
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
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${
                hasPendingOrInProgress
                  ? "bg-white/4 border border-white/5 text-muted cursor-not-allowed"
                  : "bg-gold text-bg shadow-[0_4px_16px_rgba(212,163,64,0.22)] hover:brightness-110"
              }`}
            >
              <Wallet size={14} />
              Procesar pago
            </motion.button>

            {hasPendingOrInProgress && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/8 border border-amber-500/15">
                <AlertTriangle size={11} className="text-amber-400 flex-shrink-0" />
                <p className="text-[9px] text-amber-300 font-semibold">Hay pedidos en preparación — esperá para cobrar</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onClose(table._id!)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-red-500/8 border border-red-500/15 text-red-300 font-bold text-xs uppercase tracking-wider hover:bg-red-500/14 transition-all"
            >
              <Wrench size={13} />
              Cerrar mesa
            </motion.button>
          </>
        )}

        {table.status === "reserved" && onSeatReservation && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onSeatReservation}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl nebula-btn-primary font-bold text-xs uppercase tracking-wider"
          >
            <Users size={14} />
            Sentar clientes
          </motion.button>
        )}

        {table.status === "maintenance" && (
          <div className="text-center py-2">
            <p className="text-[10px] text-muted/40 uppercase tracking-widest font-bold">En mantenimiento</p>
          </div>
        )}

        {/* Admin actions */}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={() => setEditing(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/4 hover:bg-white/7 border border-white/6 text-muted hover:text-ivory text-[10px] font-bold uppercase tracking-wider transition-all">
            <Pencil size={12} />
            Editar
          </button>
          <button type="button" onClick={() => onDelete(table._id!)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500/50 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider transition-all">
            <Trash2 size={12} />
            Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
