"use client";

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
  if (stock <= min * 1.5) return "low"    as const;
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
    textCls:   "text-[#F85149]",
    bgCls:     "bg-[rgba(248,81,73,0.12)]",
    borderCls: "border-[rgba(248,81,73,0.30)]",
    barCls:    "bg-[#F85149]",
    icon:      <XCircle size={12} />,
  },
  critical: {
    label:     "Crítico",
    textCls:   "text-[#F85149]",
    bgCls:     "bg-[rgba(248,81,73,0.12)]",
    borderCls: "border-[rgba(248,81,73,0.30)]",
    barCls:    "bg-[#F85149]",
    icon:      <AlertTriangle size={12} />,
  },
  low: {
    label:     "Stock bajo",
    textCls:   "text-[#FF7B54]",
    bgCls:     "bg-[rgba(255,123,84,0.12)]",
    borderCls: "border-[rgba(255,123,84,0.30)]",
    barCls:    "bg-[#FF7B54]",
    icon:      <AlertTriangle size={12} />,
  },
  optimal: {
    label:     "Óptimo",
    textCls:   "text-[#3FB950]",
    bgCls:     "bg-[rgba(63,185,80,0.12)]",
    borderCls: "border-[rgba(63,185,80,0.30)]",
    barCls:    "bg-[#3FB950]",
    icon:      <CheckCircle size={12} />,
  },
};

const SECTOR_THEME: Record<string, {
  accentText: string;
  badgeBg: string;
  badgeBorder: string;
  icon: React.ReactNode;
}> = {
  bar: {
    accentText:  "text-[#F0B429]",
    badgeBg:     "bg-[rgba(240,180,41,0.12)]",
    badgeBorder: "border-[rgba(240,180,41,0.30)]",
    icon:        <GlassWater size={18} className="text-[#F0B429]" />,
  },
  kitchen: {
    accentText:  "text-[#3FB950]",
    badgeBg:     "bg-[rgba(63,185,80,0.12)]",
    badgeBorder: "border-[rgba(63,185,80,0.30)]",
    icon:        <Flame size={18} className="text-[#3FB950]" />,
  },
  general: {
    accentText:  "text-[#388BFD]",
    badgeBg:     "bg-[rgba(56,139,253,0.12)]",
    badgeBorder: "border-[rgba(56,139,253,0.30)]",
    icon:        <Layers size={18} className="text-[#388BFD]" />,
  },
};

function fmtMoney(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

// ── Barra de stock reutilizable ───────────────────────────────────

function StockBar({
  pct,
  status,
  height = "h-1.5",
}: {
  pct: number;
  status: StockStatus;
  height?: string;
}) {
  const s = STATUS[status];
  return (
    <div className={`${height} bg-[#0D1117] rounded-full overflow-hidden border border-[#30363D]`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${s.barCls}`}
        style={{ width: `${Math.max(2, Math.min(pct, 100))}%` }}
      />
    </div>
  );
}

// ── Badge de estado ───────────────────────────────────────────────

function StatusBadge({ status }: { status: StockStatus }) {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.bgCls} ${s.textCls} ${s.borderCls}`}
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
  unit,
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
  unit: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-2 mt-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              min={1}
              value={adjustAmt}
              onChange={(e) => setAdjustAmt(Math.max(1, Number(e.target.value)))}
              className="w-full h-8 px-2.5 rounded-lg bg-[#161B22] border border-[#30363D] text-xs text-[#E6EDF3] text-left focus:outline-none focus:border-[#F0B429]"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#8B949E] pointer-events-none">
              {unit}
            </span>
          </div>
          <input
            type="text"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            placeholder="Motivo (opcional)"
            className="flex-1 h-8 px-2.5 rounded-lg bg-[#161B22] border border-[#30363D] text-xs text-[#E6EDF3] placeholder:text-[#8B949E] focus:outline-none focus:border-[#F0B429]"
          />
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onAdd}
            disabled={pending}
            className="flex-1 h-8 rounded-lg bg-[rgba(63,185,80,0.15)] border border-[rgba(63,185,80,0.30)] text-[#3FB950] text-xs font-bold flex items-center justify-center gap-1 hover:bg-[rgba(63,185,80,0.25)] transition-all disabled:opacity-40"
          >
            <Plus size={13} /> Entrada
          </button>
          <button
            type="button"
            onClick={onSubtract}
            disabled={pending || stock <= 0}
            className="flex-1 h-8 rounded-lg bg-[rgba(248,81,73,0.15)] border border-[rgba(248,81,73,0.30)] text-[#F85149] text-xs font-bold flex items-center justify-center gap-1 hover:bg-[rgba(248,81,73,0.25)] transition-all disabled:opacity-40"
          >
            <Minus size={13} /> Salida
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 h-8 rounded-lg border border-[#30363D] bg-[#161B22] text-[#8B949E] text-xs hover:text-[#E6EDF3] transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Componente Principal InventoryCard ────────────────────────────

export default function InventoryCard({ item, view = "standard", onEdit, onDelete }: Props) {
  const { openDrawer } = useInventoryUiStore();
  const adjustMutation = useAdjustStock();
  const [adjusting, setAdjusting]       = useState(false);
  const [adjustAmt, setAdjustAmt]       = useState(item.unit === "ml" || item.unit === "g" ? 50 : 1);
  const [adjustReason, setAdjustReason] = useState("");

  const stock    = Number(item.stock    ?? 0);
  const minStock = Number(item.minStock ?? 0);
  const maxStock = Number(item.maxStock ?? 100) || 100;
  const cost     = Number(item.cost     ?? 0);

  const pct    = Math.min(Math.round((stock / maxStock) * 100), 100);
  const status = stockStatus(stock, minStock);
  const sc     = STATUS[status];
  const theme  = SECTOR_THEME[item.sector ?? "general"] ?? SECTOR_THEME.general;

  // Paso predeterminado para el ajuste rápido de 1 clic
  const quickStep = item.unit === "ml" || item.unit === "g" ? 50 : 1;

  const doQuickAdjust = async (type: "add" | "subtract") => {
    try {
      await adjustMutation.mutateAsync({
        id:     item._id!,
        amount: quickStep,
        type,
        reason: type === "add" ? `Entrada rápida (+${quickStep} ${item.unit})` : `Salida rápida (-${quickStep} ${item.unit})`,
      });
    } catch { /* manejado globalmente */ }
  };

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
      setAdjustAmt(quickStep);
      setAdjustReason("");
    } catch { /* error manejado globalmente */ }
  };

  // ────────────────────────────────────────────────────────────────
  // NIVEL BÁSICO — Tarjeta Operativa Compacta
  // ────────────────────────────────────────────────────────────────
  if (view === "basic") {
    return (
      <div className="relative rounded-2xl border border-[#30363D] bg-[#161B22] hover:border-[#3D444D] transition-all duration-200 overflow-hidden shadow-sm flex flex-col justify-between">
        {/* Barra superior de stock */}
        <StockBar pct={pct} status={status} height="h-1" />

        <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
          {/* Categoría + Status Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block truncate">
                {item.category || "General"}
              </span>
              <h3 className="text-sm font-bold text-[#E6EDF3] capitalize truncate mt-0.5 leading-tight" title={item.name}>
                {item.name}
              </h3>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Stock central + Botones de Ajuste Rápido de Alto Contraste */}
          <div className="flex items-end justify-between pt-1 border-t border-[#30363D]">
            <div>
              <p className={`text-2xl font-black leading-none ${sc.textCls}`}>
                {stock}
              </p>
              <p className="text-xs text-[#8B949E] mt-1">
                {item.unit} · mín {minStock}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Botón Salida */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); doQuickAdjust("subtract"); }}
                disabled={adjustMutation.isPending || stock <= 0}
                className="w-8 h-8 rounded-xl bg-[rgba(248,81,73,0.12)] hover:bg-[rgba(248,81,73,0.25)] border border-[rgba(248,81,73,0.30)] text-[#F85149] flex items-center justify-center transition-all disabled:opacity-30 active:scale-95 shadow-xs"
                title={`Salida rápida (-${quickStep} ${item.unit})`}
              >
                <Minus size={14} />
              </button>

              {/* Botón Entrada */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); doQuickAdjust("add"); }}
                disabled={adjustMutation.isPending}
                className="w-8 h-8 rounded-xl bg-[rgba(63,185,80,0.12)] hover:bg-[rgba(63,185,80,0.25)] border border-[rgba(63,185,80,0.30)] text-[#3FB950] flex items-center justify-center transition-all disabled:opacity-30 active:scale-95 shadow-xs"
                title={`Entrada rápida (+${quickStep} ${item.unit})`}
              >
                <Plus size={14} />
              </button>

              {/* Botón Editar */}
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="w-8 h-8 rounded-xl bg-[#21283A] hover:bg-[#30363D] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] transition-all flex items-center justify-center active:scale-95"
                title="Editar insumo"
              >
                <Pencil size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // NIVEL ESTÁNDAR — Tarjeta Completa con Métricas
  // ────────────────────────────────────────────────────────────────
  if (view === "standard") {
    return (
      <div className="group relative rounded-2xl border border-[#30363D] bg-[#161B22] hover:border-[#3D444D] transition-all duration-200 flex flex-col overflow-hidden shadow-sm">
        {/* Barra de progreso superior */}
        <StockBar pct={pct} status={status} height="h-1.5" />

        <div className="p-4 flex flex-col gap-3.5 flex-1">
          {/* Header con imagen/ícono, categoría, nombre y badge */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-[#30363D]"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-[#0D1117] border border-[#30363D] flex items-center justify-center shrink-0">
                  {theme.icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block truncate">
                  {item.category || "General"}
                </span>
                <h3 className="text-sm font-bold text-[#E6EDF3] capitalize truncate leading-tight" title={item.name}>
                  {item.name}
                </h3>
                {item.supplier && (
                  <p className="text-xs text-[#8B949E] truncate mt-0.5 flex items-center gap-1">
                    <MapPin size={11} className="text-[#8B949E]/70" />
                    <span>{item.supplier}</span>
                  </p>
                )}
              </div>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* 3 Cajas de Métricas Legibles */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#0D1117] rounded-xl p-2.5 text-center border border-[#30363D]">
              <p className="text-xs text-[#8B949E] uppercase tracking-wider mb-0.5">Stock</p>
              <p className={`text-base font-black ${sc.textCls}`}>{stock}</p>
              <p className="text-xs text-[#8B949E]">{item.unit}</p>
            </div>
            <div className="bg-[#0D1117] rounded-xl p-2.5 text-center border border-[#30363D]">
              <p className="text-xs text-[#8B949E] uppercase tracking-wider mb-0.5">Mínimo</p>
              <p className="text-base font-black text-[#E6EDF3]">{minStock}</p>
              <p className="text-xs text-[#8B949E]">{item.unit}</p>
            </div>
            <div className="bg-[#0D1117] rounded-xl p-2.5 text-center border border-[#30363D]">
              <p className="text-xs text-[#8B949E] uppercase tracking-wider mb-0.5">Costo Unit.</p>
              <p className="text-xs font-black text-[#F0B429] truncate mt-1">{fmtMoney(cost)}</p>
            </div>
          </div>

          {/* Barra de nivel con porcentaje y rangos */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#8B949E]">
              <span>0 {item.unit}</span>
              <span className={`font-bold ${theme.accentText}`}>{pct}% capacidad</span>
              <span>{maxStock} {item.unit}</span>
            </div>
            <StockBar pct={pct} status={status} height="h-2" />
          </div>

          {/* Badge de Forecasting si se aproxima agotamiento */}
          {item.daysUntilEmpty !== undefined && item.daysUntilEmpty <= 7 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(255,123,84,0.12)] border border-[rgba(255,123,84,0.25)] rounded-xl">
              <Clock size={13} className="text-[#FF7B54]" />
              <span className="text-xs text-[#FF7B54] font-semibold">
                Agotamiento proyectado en ~{item.daysUntilEmpty} día{item.daysUntilEmpty !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Panel Desplegable de Ajuste Manual */}
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
                unit={item.unit}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Acciones de Tarjeta */}
        <div className="flex items-center gap-1.5 px-3.5 pb-3.5 pt-1 border-t border-[#30363D]">
          <button
            type="button"
            onClick={() => openDrawer(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#21283A] hover:bg-[#30363D] border border-[#30363D] text-xs font-bold text-[#E6EDF3] transition-all"
          >
            <Eye size={13} />
            <span>Ficha</span>
          </button>
          <button
            type="button"
            onClick={() => setAdjusting((v) => !v)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition-all ${
              adjusting
                ? "bg-[#21283A] border-[#F0B429] text-[#F0B429]"
                : "bg-[rgba(240,180,41,0.12)] hover:bg-[rgba(240,180,41,0.20)] border-[rgba(240,180,41,0.30)] text-[#F0B429]"
            }`}
          >
            <Plus size={12} /><Minus size={12} />
            <span>Stock</span>
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-2 rounded-xl bg-[#0D1117] hover:bg-[#21283A] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] transition-all"
            title="Editar insumo"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id!)}
            className="p-2 rounded-xl bg-[#0D1117] hover:bg-[rgba(248,81,73,0.15)] border border-[#30363D] hover:border-[rgba(248,81,73,0.30)] text-[#8B949E] hover:text-[#F85149] transition-all"
            title="Eliminar insumo"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // NIVEL AVANZADO — Fila Horizontal / Auditoría
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="relative rounded-2xl border border-[#30363D] bg-[#161B22] hover:border-[#3D444D] transition-all duration-200 overflow-hidden shadow-sm">
      {/* Indicador lateral de color */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sc.barCls}`} />

      <div className="flex items-center gap-4 p-3.5 pl-5 flex-wrap md:flex-nowrap">
        {/* Imagen / Ícono */}
        <div className="shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#30363D]"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#0D1117] border border-[#30363D] flex items-center justify-center">
              {theme.icon}
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
              {item.category || "General"}
            </span>
            <StatusBadge status={status} />
            {item.sector && (
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.accentText} border ${theme.badgeBorder}`}>
                {item.sector}
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm md:text-base text-[#E6EDF3] capitalize truncate leading-tight">
            {item.name}
          </h3>

          <div className="flex items-center gap-3 mt-1 text-xs text-[#8B949E] flex-wrap">
            {item.supplier && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {item.supplier}
              </span>
            )}
            {(item.usedInRecipes?.length ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[#388BFD]">
                <BookOpen size={11} />
                {item.usedInRecipes!.length} receta{item.usedInRecipes!.length > 1 ? "s" : ""} vinculada{item.usedInRecipes!.length > 1 ? "s" : ""}
              </span>
            )}
            {item.daysUntilEmpty !== undefined && item.daysUntilEmpty <= 7 && (
              <span className="flex items-center gap-1 text-[#FF7B54]">
                <TrendingDown size={11} />
                {item.daysUntilEmpty}d para agotarse
              </span>
            )}
          </div>
        </div>

        {/* Métricas compactas */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center min-w-[70px]">
            <p className="text-xs text-[#8B949E] uppercase tracking-wider">Stock</p>
            <p className={`text-lg font-black ${sc.textCls}`}>
              {stock}
              <span className="text-xs font-normal text-[#8B949E] ml-1">{item.unit}</span>
            </p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-xs text-[#8B949E] uppercase tracking-wider">Valorización</p>
            <p className="text-xs font-black text-[#F0B429] mt-1">{fmtMoney(stock * cost)}</p>
          </div>
          <div className="w-24 hidden sm:block">
            <div className="flex justify-between text-xs text-[#8B949E] mb-1">
              <span>0</span>
              <span className={theme.accentText}>{pct}%</span>
            </div>
            <StockBar pct={pct} status={status} height="h-1.5" />
            <p className="text-xs text-[#8B949E] text-right mt-0.5">mín {minStock}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => setAdjusting((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-[rgba(240,180,41,0.12)] hover:bg-[rgba(240,180,41,0.20)] border border-[rgba(240,180,41,0.30)] text-[#F0B429] text-xs font-bold transition-all flex items-center gap-1"
            title="Ajustar stock"
          >
            <Plus size={12} /><Minus size={12} />
            <span className="hidden md:inline">Ajustar</span>
          </button>
          <button
            type="button"
            onClick={() => openDrawer(item)}
            className="p-2 rounded-xl bg-[#21283A] hover:bg-[#30363D] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] transition-all"
            title="Ver detalle"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-2 rounded-xl bg-[#0D1117] hover:bg-[#21283A] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] transition-all"
            title="Editar insumo"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id!)}
            className="p-2 rounded-xl bg-[#0D1117] hover:bg-[rgba(248,81,73,0.15)] border border-[#30363D] hover:border-[rgba(248,81,73,0.30)] text-[#8B949E] hover:text-[#F85149] transition-all"
            title="Eliminar insumo"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Panel de ajuste desplegable en modo avanzado */}
      <AnimatePresence>
        {adjusting && (
          <div className="p-3 pt-0">
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
              unit={item.unit}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
