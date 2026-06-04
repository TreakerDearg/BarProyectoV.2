"use client";

import {
  Pencil,
  Trash2,
  Flame,
  Martini,
  Layers,
  MapPin,
  Droplets,
  Box,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  DollarSign
} from "lucide-react";

import type { InventoryItem } from "../types/inventory";
import ExpandableCardWrapper from "../../../components/ui/ExpandableCardWrapper";
import InventoryExpandedPanel from "./InventoryExpandedPanel";

interface Props {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  simplified?: boolean;
  averageCost?: number;
  lastRestock?: string;
  stockTrend?: 'up' | 'down' | 'stable';
  expanded?: boolean;
  onExpandToggle?: (id: string) => void;
}

export default function InventoryCard({
  item,
  onEdit,
  onDelete,
  simplified = false,
  averageCost = 0,
  lastRestock,
  stockTrend = 'stable',
  expanded,
  onExpandToggle
}: Props) {
  const stock = Number(item.stock ?? 0);
  const minStock = Number(item.minStock ?? 0);
  const maxStock = Number(item.maxStock ?? 100);
  const cost = Number(item.cost ?? 0);
  const totalValue = stock * cost;
  const costVsAverage = averageCost > 0 ? ((cost - averageCost) / averageCost) * 100 : 0;

  const isLiquid = ['ml', 'l', 'oz', 'cl'].includes(item.unit?.toLowerCase() || "");
  const percent = Math.min((stock / maxStock) * 100, 100);
  
  const status = stock <= minStock ? "critical" : stock <= minStock * 1.5 ? "low" : "optimal";

  const sectorTheme = {
    bar: { color: "gold", icon: <Martini size={18} /> },
    kitchen: { color: "emerald", icon: <Flame size={18} /> },
    general: { color: "ember", icon: <Layers size={18} /> },
  }[(item.sector?.toLowerCase() as "bar" | "kitchen" | "general") || "general"];

  const statusConfig = {
    critical: { color: "red", label: "REPOSICIÓN CRÍTICA", glow: "shadow-red/20 border-red/40" },
    low: { color: "ember", label: "ADVERTENCIA STOCK", glow: "shadow-ember/20 border-ember/40" },
    optimal: { color: "lime", label: "NIVEL ÓPTIMO", glow: "shadow-lime/20 border-white/5" },
  }[status];

  return (
    <ExpandableCardWrapper
      id={item._id}
      expanded={expanded}
      onExpandToggle={() => onExpandToggle?.(item._id!)}
      expandedContent={<InventoryExpandedPanel item={item} />}
    >
      <div className={`
        relative group cursor-pointer
        rounded-[2.5rem] p-8 space-y-8
        border border-white/5
        bg-surface-2 overflow-hidden transition-all duration-500
        hover:translate-y-[-8px] hover:shadow-royale
        ${statusConfig.glow}
      `}>
      
      {/* ATMOSPHERIC GLOW */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-700 opacity-0 group-hover:opacity-100 bg-${statusConfig.color}/10`} />

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl bg-surface-3 border border-white/5 text-${sectorTheme.color} shadow-inner`}>
            {sectorTheme.icon}
          </div>
          <div>
            <h3 className="font-black text-xl text-ivory tracking-tighter uppercase leading-none truncate max-w-[150px]">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 text-[9px] text-muted font-black uppercase tracking-widest mt-1">
              <MapPin size={10} className="text-gold" />
              {item.location || 'BÓVEDA CENTRAL'}
            </div>
            {!simplified && (
              <div className="flex items-center gap-2 mt-1">
                {lastRestock && (
                  <div className="flex items-center gap-1 text-[8px] text-muted">
                    <Calendar size={8} />
                    <span>Última: {lastRestock}</span>
                  </div>
                )}
                {costVsAverage > 20 && (
                  <div className="flex items-center gap-1 text-[8px] text-red-400">
                    <AlertTriangle size={8} />
                    <span>Costo alto</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`badge badge-${statusConfig.color} text-[8px] px-3 py-1.5 rounded-xl font-black tracking-widest`}>
          {statusConfig.label}
        </div>
      </div>

      {/* ================= DYNAMIC VISUALIZATION ================= */}
      <div className={`relative bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden group/gauge shadow-inner ${simplified ? 'h-32' : 'h-48'}`}>
        {simplified ? (
          /* SIMPLIFIED VIEW */
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
            <p className="text-3xl font-black text-ivory tracking-tighter">{stock}<span className="text-sm ml-1 text-muted">{item.unit}</span></p>
            <div className={`px-3 py-1 rounded-full bg-${statusConfig.color}/20 text-${statusConfig.color} text-xs font-bold`}>
              {percent.toFixed(0)}%
            </div>
          </div>
        ) : isLiquid ? (
          /* LIQUID GAUGE */
          <div className="absolute inset-0 flex flex-col justify-end">
            <div
              className={`w-full bg-${statusConfig.color} opacity-40 transition-all duration-1000 relative`}
              style={{ height: `${percent}%` }}
            >
              <div className="absolute top-0 left-0 w-full h-4 bg-white/20 blur-sm -translate-y-2" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
              <Droplets size={32} className={`text-${statusConfig.color} opacity-30 animate-pulse`} />
              <p className="text-4xl font-black text-ivory tracking-tighter">{stock}<span className="text-sm ml-1 text-muted">{item.unit}</span></p>
            </div>
          </div>
        ) : (
          /* STOCK GRID / SOLID */
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="grid grid-cols-5 gap-2 opacity-20">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className={`h-4 rounded-md ${i < (stock / maxStock) * 15 ? `bg-${statusConfig.color}` : 'bg-white/10'}`} />
              ))}
            </div>
            <div className="flex flex-col items-center justify-center flex-1 space-y-2">
              <Box size={32} className={`text-${statusConfig.color} opacity-30`} />
              <p className="text-4xl font-black text-ivory tracking-tighter">{stock}<span className="text-sm ml-1 text-muted">{item.unit}</span></p>
            </div>
          </div>
        )}

        {/* INFO OVERLAY - Hidden in simplified mode */}
        {!simplified && (
          <div className="absolute bottom-4 left-0 w-full px-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-${statusConfig.color} animate-pulse`} />
              <span className="text-[10px] font-black text-ivory uppercase tracking-widest">{percent.toFixed(0)}% DISPONIBLE</span>
            </div>
            <div className="flex items-center gap-2">
              {stockTrend === 'up' && <TrendingUp size={12} className="text-emerald-400" />}
              {stockTrend === 'down' && <TrendingDown size={12} className="text-red-400" />}
              <p className="text-[10px] font-black text-muted uppercase tracking-widest">MÁX: {maxStock}</p>
            </div>
          </div>
        )}
      </div>

      {/* ================= STATS ROW - Hidden in simplified mode ================= */}
      {!simplified && (
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
            <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">COSTO UNITARIO</p>
            <div className="flex items-center gap-2">
              <TrendingUp size={12} className={costVsAverage > 20 ? 'text-red-400' : costVsAverage < -20 ? 'text-emerald-400' : 'text-emerald-400'} />
              <span className={`text-sm font-black ${costVsAverage > 20 ? 'text-red-400' : 'text-ivory'}`}>${cost.toFixed(2)}</span>
            </div>
            {averageCost > 0 && (
              <p className={`text-[8px] mt-1 ${costVsAverage > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {costVsAverage > 0 ? '+' : ''}{costVsAverage.toFixed(0)}% vs promedio
              </p>
            )}
          </div>
          <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
            <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">VALOR TOTAL</p>
            <div className="flex items-center gap-2">
              <DollarSign size={12} className="text-gold" />
              <span className="text-sm font-black text-gold">${totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= RECIPE INFO - Hidden in simplified mode ================= */}
      {!simplified && item.usedInRecipes && item.usedInRecipes.length > 0 && (
        <div className="flex items-center gap-2 relative z-10">
          <Martini size={12} className="text-violet-400" />
          <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">
            {item.usedInRecipes.length} receta(s) usan este insumo
          </span>
        </div>
      )}

      {/* ================= ACTIONS - Always visible but simplified in simple mode ================= */}
      <div className={`flex gap-3 relative z-10 ${simplified ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'} transition-all duration-500`}>
        <button
          onClick={() => onEdit(item)}
          className={`rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gold/10 hover:border-gold/30 transition-all group/btn ${simplified ? 'flex-1 h-12' : 'flex-[2] h-14 px-6 justify-between'}`}
        >
          {!simplified && <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted group-hover/btn:text-gold">GESTIONAR</span>}
          {simplified ? <Pencil size={16} className="text-muted group-hover/btn:text-gold" /> : <ChevronRight size={18} className="text-muted group-hover/btn:text-gold group-hover/btn:translate-x-1 transition-all" />}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item._id!); }}
          className={`rounded-2xl bg-red/5 border border-red/10 flex items-center justify-center text-red/40 hover:text-red hover:bg-red/20 hover:border-red/40 transition-all ${simplified ? 'w-12 h-12' : 'w-14 h-14'}`}
        >
          <Trash2 size={simplified ? 16 : 18} />
        </button>
      </div>

      {/* CASINO DECOR */}
      <div className="absolute -bottom-1 -right-1 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <ShieldCheck size={120} />
      </div>
    </div>
    </ExpandableCardWrapper>
  );
}