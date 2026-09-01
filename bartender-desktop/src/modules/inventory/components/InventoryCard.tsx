/**
 * InventoryCard — rediseño completo con 3 niveles de información.
 *
 *  basic    — Tarjeta mínima: barra de stock, nombre, categoría, stock actual, ±1 rápido.
 *  standard — Tarjeta completa: imagen, proveedor, costo, barra detallada, ajuste con input.
 *  advanced — Fila horizontal: valor total, recetas vinculadas, forecast, todas las acciones.
 *
 * Correcciones respecto a la versión anterior:
 *  - Bug de template literal en vista advanced (sc.bg/sc.color en className string fijo) → corregido.
 *  - Vista advanced ahora SÍ se renderiza desde la página cuando mode === "advanced".
 *  - Botones ± en vista advanced usan el mismo adjustAmt del estado local (no siempre 1).
 *  - SmartAlerts integrado: badge de forecast si daysUntilEmpty está disponible.
 */

import { useState } from "react";
import {
  Pencil, Trash2, Eye, Plus, Minus, CheckCircle,
  AlertTriangle, XCircle, Package,
  DollarSign, GlassWater, Flame, Layers,
  MapPin, BookOpen, TrendingDown, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { InventoryItem } from "../types/inventory";
import { useInventoryUiStore } from "../store/inventoryUiStore";
import { useAdjustStock } from "../hooks/useInventoryQueries";

// ── Tipos públicos ────────────────────────────────────────────────

export type InventoryViewLevel = "basic" | "standard" | "advanced";

interface Props {
  item:     InventoryItem;
  view?:    InventoryViewLevel;
  onEdit:   (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────

function stockStatus(stock: number, min: number) {
  if (stock <= 0)       return "empty"    as const;
  if (stock <= min)     return "critical" as const;
  if (stock <= min * 2) return "low"      as const;
  return "optimal" as const;
}

type StockStatus = ReturnType<typeof stockStatus>;

const STATUS: Record<StockStatus, {
  label: string;
  textCls: string;
  bgCls: string;
  borderCls: string;
  barCls: string;
  icon: React.ReactNode;
}> = {
  empty: {
    label:     "Sin stock",
    textCls:   "text-red-400",
    bgCls:     "bg-red-500/15",
    borderCls: "border-red-500/30",
    barCls:    "bg-red-500",
    icon:      <XCircle size={11} />,
  },
  critical: {
    label:     "Crítico",
    textCls:   "text-red-400",
    bgCls:     "bg-red-500/10",
    borderCls: "border-red-500/25",
    barCls:    "bg-red-400",
    icon:      <AlertTriangle size={11} />,
  },
  low: {
    label:     "Stock bajo",
    textCls:   "text-amber-400",
    bgCls:     "bg-amber-500/10",
    borderCls: "border-amber-500/25",
    barCls:    "bg-amber-400",
    icon:      <AlertTriangle size={11} />,
  },
  optimal: {
    label:     "Óptimo",
    textCls:   "text-emerald-400",
    bgCls:     "bg-emerald-500/10",
    borderCls: "border-emerald-500/25",
    barCls:    "bg-emerald-400",
    icon:      <CheckCircle size={11} />,
  },
};

const SECTOR_THEME: Record<string, {
  gradient: string;
  cardBorder: string;
  accentText: string;
  barAccent: string;
  icon: React.ReactNode;
}> = {
  bar: {
    gradient:   "from-amber-500/8 to-transparent",
    cardBorder: "border-amber-500/20 hover:border-amber-500/40",
    accentText: "text-amber-400",
    barAccent:  "bg-amber-400",
    icon:       <GlassWater size={18} className="text-amber-400" />,
  },
  kitchen: {
    gradient:   "from-emerald-500/8 to-transparent",
    cardBorder: "border-emerald-500/20 hover:border-emerald-500/40",
    accentText: "text-emerald-400",
    barAccent:  "bg-emerald-400",
    icon:       <Flame size={18} className="text-emerald-400" />,
  },
  general: {
    gradient:   "from-violet-500/8 to-transparent",
    cardBorder: "border-violet-500/20 hover:border-violet-500/40",
    accentText: "text-violet-400",
    barAccent:  "bg-violet-400",
    icon:       <Layers size={18} className="text-violet-400" />,
  },
};

function fmtMoney(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  });
}

// ── Barra de stock reutilizable ───────────────────────────────────

function StockBar({
  pct,
  status,
  mini = false,
}: {
  pct: number;
  status: StockStatus;
  mini?: boolean;
}) {
  const s = STATUS[status];
  return (
    <div className={`${mini ? "h-1" : "h-1.5"} bg-black/30 rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ${s.barCls}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Badge de estado ───────────────────────────────────────────────

function StatusBadge({ status }: { status: StockStatus }) {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.bgCls} ${s.textCls} ${s.borderCls}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

// ── Panel de ajuste de stock (standard + advanced) ────────────────

function AdjustPanel({
  adjustAmt,
  setAdjustAmt,
  adjustReason,
  setAdjustReason,
  onAdd,
  onSubtract,
  onClose,
  pending,
  stock,
}: {
  adjustAmt: number;
  setAdjustAmt: (n: number) => void;
  adjustReason: string;
  setAdjustReason: (s: string) => void;
  onAdd: () => void;
  onSubtract: () => void;
  onClose: () => void;
  pending: boolean;
  stock: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="p-3 rounded-xl bg-black/30 border border-white/8 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={adjustAmt}
            onChange={(e) => setAdjustAmt(Math.max(1, Number(e.target.value)))}
            className="w-16 h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-xs text-ivory text-center focus:outline-none focus:border-violet/40"
          />
          <input
            type="text"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            placeholder="Motivo (opcional)"
            className="flex-1 h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-xs text-ivory focus:outline-none focus:border-violet/40"
          />
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={onAdd}
            disabled={pending}
            className="flex-1 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
          >
            <Plus size={11} /> Entrada
          </button>
          <button
            onClick={onSubtract}
            disabled={pending || stock <= 0}
            className="flex-1 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-500/20 transition-all disabled:opacity-40"
          >
            <Minus size={11} /> Salida
          </button>
          <button
            onClick={onClose}
            className="px-2.5 h-8 rounded-lg border border-white/10 text-muted text-xs hover:text-ivory transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Componente principal ──────────────────────────────────────────

export default function InventoryCard({ item, view = "standard", onEdit, onDelete }: Props) {
  const { openDrawer }      = useInventoryUiStore();
  const adjustMutation      = useAdjustStock();
  const [adjusting, setAdjusting]       = useState(false);
  const [adjustAmt, setAdjustAmt]       = useState(1);
  const [adjustReason, setAdjustReason] = useState("");

  const stock    = Number(item.stock    ?? 0);
  const minStock = Number(item.minStock ?? 0);
  const maxStock = Number(item.maxStock ?? 100) || 100;
  const cost     = Number(item.cost     ?? 0);

  const pct    = Math.min(Math.round((stock / maxStock) * 100), 100);
  const status = stockStatus(stock, minStock);
  const sc     = STATUS[status];
  const theme  = SECTOR_THEME[item.sector ?? "general"] ?? SECTOR_THEME.general;

  const doAdjust = async (type: "add" | "subtract") => {
    if (adjustAmt <= 0) return;
    try {
      await adjustMutation.mutateAsync({
        id:     item._id!,
        amount: adjustAmt,
        type,
        reason: adjustReason.trim() || (type === "add" ? "Entrada manual" : "Salida manual"),
      });
      setAdjusting(false);
      setAdjustAmt(1);
      setAdjustReason("");
    } catch { /* error manejado globalmente */ }
  };

  // ────────────────────────────────────────────────────────────────
  // NIVEL BÁSICO — tarjeta mínima
  // ────────────────────────────────────────────────────────────────
  if (view === "basic") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={`relative rounded-2xl border bg-surface-3/60 ${theme.cardBorder} transition-all duration-300 overflow-hidden`}
      >
        {/* Barra de stock en el top */}
        <StockBar pct={pct} status={status} mini />

        <div className="p-3 space-y-2.5">
          {/* Nombre + badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] text-muted uppercase tracking-widest truncate leading-tight">
                {item.category}
              </p>
              <h3 className="text-sm font-bold text-ivory capitalize truncate mt-0.5 leading-tight">
                {item.name}
              </h3>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Stock + acciones */}
          <div className="flex items-end justify-between">
            <div>
              <p className={`text-xl font-extrabold leading-none ${sc.textCls}`}>
                {stock}
              </p>
              <p className="text-[9px] text-muted mt-0.5">
                {item.unit} · mín {minStock}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); doAdjust("subtract"); }}
                disabled={adjustMutation.isPending || stock <= 0}
                className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/70 hover:bg-red-500/20 flex items-center justify-center transition-all disabled:opacity-30"
                title="Salida"
              >
                <Minus size={11} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); doAdjust("add"); }}
                disabled={adjustMutation.isPending}
                className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/70 hover:bg-emerald-500/20 flex items-center justify-center transition-all disabled:opacity-30"
                title="Entrada"
              >
                <Plus size={11} />
              </button>
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-muted hover:text-ivory transition-all flex items-center justify-center"
                title="Editar"
              >
                <Pencil size={10} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // NIVEL ESTÁNDAR — tarjeta completa
  // ────────────────────────────────────────────────────────────────
  if (view === "standard") {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        className={`group relative rounded-2xl border bg-gradient-to-br ${theme.gradient} bg-surface-3/70 ${theme.cardBorder} transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Barra superior */}
        <StockBar pct={pct} status={status} />

        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Header: imagen + info + badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-white/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  {theme.icon}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[9px] text-muted uppercase tracking-widest truncate">
                  {item.category}
                </p>
                <h3 className="text-sm font-bold text-ivory capitalize truncate leading-tight">
                  {item.name}
                </h3>
                {item.supplier && (
                  <p className="text-[9px] text-muted/60 truncate mt-0.5 flex items-center gap-1">
                    <MapPin size={8} />
                    {item.supplier}
                  </p>
                )}
              </div>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/20 rounded-xl p-2.5 text-center border border-white/5">
              <p className="text-[8px] text-muted uppercase tracking-wider mb-0.5">Stock</p>
              <p className={`text-base font-extrabold ${sc.textCls}`}>{stock}</p>
              <p className="text-[8px] text-muted">{item.unit}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-2.5 text-center border border-white/5">
              <p className="text-[8px] text-muted uppercase tracking-wider mb-0.5">Mínimo</p>
              <p className="text-base font-extrabold text-ivory/70">{minStock}</p>
              <p className="text-[8px] text-muted">{item.unit}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-2.5 text-center border border-white/5">
              <p className="text-[8px] text-muted uppercase tracking-wider mb-0.5">Costo</p>
              <p className="text-sm font-extrabold text-gold truncate">{fmtMoney(cost)}</p>
            </div>
          </div>

          {/* Barra visual detallada */}
          <div>
            <div className="flex justify-between text-[8px] text-muted mb-1">
              <span>0</span>
              <span className={theme.accentText}>{pct}%</span>
              <span>{maxStock} {item.unit}</span>
            </div>
            <StockBar pct={pct} status={status} />
          </div>

          {/* Forecast badge */}
          {item.daysUntilEmpty !== undefined && item.daysUntilEmpty <= 7 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Clock size={11} className="text-amber-400" />
              <span className="text-[10px] text-amber-400 font-semibold">
                Se agota en ~{item.daysUntilEmpty} día{item.daysUntilEmpty !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Panel de ajuste de stock */}
          <AnimatePresence>
            {adjusting && (
              <AdjustPanel
                adjustAmt={adjustAmt}
                setAdjustAmt={setAdjustAmt}
                adjustReason={adjustReason}
                setAdjustReason={setAdjustReason}
                onAdd={() => doAdjust("add")}
                onSubtract={() => doAdjust("subtract")}
                onClose={() => setAdjusting(false)}
                pending={adjustMutation.isPending}
                stock={stock}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Acciones */}
        <div className="flex gap-1.5 px-3 pb-3">
          <button
            type="button"
            onClick={() => openDrawer(item)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-muted hover:text-ivory transition-all"
          >
            <Eye size={12} /> Ver
          </button>
          <button
            type="button"
            onClick={() => setAdjusting((v) => !v)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              adjusting
                ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                : "bg-violet-500/8 border-violet-500/15 text-violet-400/70 hover:bg-violet-500/15"
            }`}
          >
            <Plus size={11} /><Minus size={11} /> Stock
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/8 border border-amber-500/15 text-amber-400/70 hover:bg-amber-500/15 transition-all"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id!)}
            className="px-2.5 py-1.5 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400/60 hover:bg-red-500/15 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // NIVEL AVANZADO — fila horizontal con toda la información
  // ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className={`relative rounded-2xl border bg-gradient-to-r ${theme.gradient} bg-surface-3/70 ${theme.cardBorder} transition-all duration-300 overflow-hidden`}
    >
      {/* Barra lateral de estado (corregida: clases dinámicas reales) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${sc.barCls}`}
      />

      <div className="flex items-center gap-4 p-4 pl-5">

        {/* Imagen / ícono */}
        <div className="flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-14 h-14 rounded-xl object-cover border border-white/10"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Package size={22} className="text-muted/50" />
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest">
              {item.category}
            </span>
            {/* Badge de estado — clases separadas (no template literal embebido) */}
            <span
              className={[
                "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider",
                "px-1.5 py-0.5 rounded-full border",
                sc.bgCls, sc.textCls, sc.borderCls,
              ].join(" ")}
            >
              {sc.icon} {sc.label}
            </span>
            {item.sector && (
              <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.accentText}`}>
                {item.sector}
              </span>
            )}
          </div>

          <h3 className="font-bold text-base text-ivory capitalize truncate leading-tight">
            {item.name}
          </h3>

          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted flex-wrap">
            {item.supplier && (
              <span className="flex items-center gap-1">
                <MapPin size={10} /> {item.supplier}
              </span>
            )}
            {(item.usedInRecipes?.length ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-violet-400/70">
                <BookOpen size={10} />
                {item.usedInRecipes!.length} receta{item.usedInRecipes!.length > 1 ? "s" : ""}
              </span>
            )}
            {item.daysUntilEmpty !== undefined && item.daysUntilEmpty <= 7 && (
              <span className="flex items-center gap-1 text-amber-400/80">
                <TrendingDown size={10} />
                {item.daysUntilEmpty}d hasta agotarse
              </span>
            )}
            {item.description && (
              <span className="text-muted/60 truncate max-w-[180px]">{item.description}</span>
            )}
          </div>
        </div>

        {/* Métricas */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="text-center">
            <p className="text-[8px] text-muted uppercase tracking-wider">Stock</p>
            <p className={`text-lg font-extrabold ${sc.textCls}`}>
              {stock}
              <span className="text-xs font-normal text-muted ml-1">{item.unit}</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-[8px] text-muted uppercase tracking-wider">Valor</p>
            <p className="text-sm font-bold text-gold">{fmtMoney(stock * cost)}</p>
          </div>
          <div className="w-24">
            <div className="flex justify-between text-[8px] text-muted mb-1">
              <span>0%</span>
              <span className={theme.accentText}>{pct}%</span>
            </div>
            <StockBar pct={pct} status={status} mini />
            <p className="text-[8px] text-muted text-right mt-0.5">
              mín {minStock}
            </p>
          </div>
        </div>

        {/* Panel de ajuste compacto */}
        <div className="flex-shrink-0">
          <AnimatePresence mode="wait">
            {adjusting ? (
              <motion.div
                key="adjust"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-black/30 rounded-xl border border-white/10">
                  <input
                    type="number"
                    min={1}
                    value={adjustAmt}
                    onChange={(e) => setAdjustAmt(Math.max(1, Number(e.target.value)))}
                    className="w-12 h-7 px-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-ivory text-center focus:outline-none focus:border-violet/40"
                  />
                  <button
                    onClick={() => doAdjust("add")}
                    disabled={adjustMutation.isPending}
                    className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 flex items-center justify-center transition-all disabled:opacity-30"
                    title="Entrada"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => doAdjust("subtract")}
                    disabled={adjustMutation.isPending || stock <= 0}
                    className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all disabled:opacity-30"
                    title="Salida"
                  >
                    <Minus size={12} />
                  </button>
                  <button
                    onClick={() => setAdjusting(false)}
                    className="w-7 h-7 rounded-lg border border-white/10 text-muted hover:text-ivory text-xs flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5"
              >
                <button
                  type="button"
                  onClick={() => setAdjusting(true)}
                  className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400/80 hover:bg-violet-500/20 flex items-center justify-center transition-all"
                  title="Ajustar stock"
                >
                  <DollarSign size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => openDrawer(item)}
                  className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-ivory flex items-center justify-center transition-all"
                  title="Ver detalle"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="w-8 h-8 rounded-xl bg-amber-500/8 border border-amber-500/15 text-amber-400/70 hover:bg-amber-500/15 flex items-center justify-center transition-all"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item._id!)}
                  className="w-8 h-8 rounded-xl bg-red-500/8 border border-red-500/10 text-red-400/50 hover:bg-red-500/15 flex items-center justify-center transition-all"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
