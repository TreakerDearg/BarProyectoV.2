"use client";

import {
  Pencil,
  Trash2,
  Flame,
  Martini,
  Layers,
  MapPin,
  DollarSign,
  Activity,
  Package,
  Eye
} from "lucide-react";

import type { InventoryItem } from "../types/inventory";
import { useInventoryUiStore } from "../store/inventoryUiStore";

interface Props {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  simplified?: boolean;
}

export default function InventoryCard({
  item,
  onEdit,
  onDelete,
  simplified = false,
}: Props) {
  const { openDrawer } = useInventoryUiStore();
  const stock = Number(item.stock ?? 0);
  const minStock = Number(item.minStock ?? 0);
  const maxStock = Number(item.maxStock ?? 100);
  const cost = Number(item.cost ?? 0);
  const totalValue = stock * cost;

  const percent = Math.min((stock / maxStock) * 100, 100);
  
  const status = stock <= minStock ? "critical" : stock <= minStock * 1.5 ? "low" : "optimal";

  const sectorTheme = {
    bar: {
      color: "gold",
      icon: <Martini size={28} />,
      gradient: "from-amber-500/15 via-gold/10 to-orange-500/5",
      borderColor: "border-gold/20",
      glow: "bg-gold/5"
    },
    kitchen: {
      color: "emerald",
      icon: <Flame size={28} />,
      gradient: "from-emerald-500/15 via-green-500/10 to-teal-500/5",
      borderColor: "border-emerald/20",
      glow: "bg-emerald/5"
    },
    general: {
      color: "violet",
      icon: <Layers size={28} />,
      gradient: "from-violet-500/15 via-purple-500/10 to-cyan-500/5",
      borderColor: "border-violet/20",
      glow: "bg-violet/5"
    },
  }[(item.sector?.toLowerCase() as "bar" | "kitchen" | "general") || "general"];

  const statusConfig = {
    critical: { 
      color: "red", 
      label: "CRÍTICO", 
      bgColor: "bg-red-500/10",
      textColor: "text-red-400",
      borderColor: "border-red/30"
    },
    low: { 
      color: "amber", 
      label: "BAJO", 
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      borderColor: "border-amber/30"
    },
    optimal: { 
      color: "emerald", 
      label: "ÓPTIMO", 
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      borderColor: "border-emerald/30"
    },
  }[status];

  const handleViewDetails = () => {
    openDrawer(item);
  };

  return (
    <div className={`
        relative group cursor-pointer
        rounded-2xl overflow-hidden
        border ${sectorTheme.borderColor}
        bg-white/5 backdrop-blur-sm
        transition-all duration-300
        hover:shadow-2xl hover:scale-[1.02]
        hover:bg-white/10
      `}>

      {/* HERO SECTION WITH GRADIENT */}
      <div className={`
        p-4 pb-3 relative overflow-hidden
        bg-gradient-to-br ${sectorTheme.gradient}
      `}>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className={`
              p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20
              text-${sectorTheme.color}
            `}>
              {sectorTheme.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-white truncate">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-[10px] text-white/60">
                  <MapPin size={10} className="text-gold" />
                  <span className="truncate">{item.location || 'Bóveda Central'}</span>
                </div>
                <span className="text-white/30">•</span>
                <span className="text-[10px] text-white/60 capitalize">{item.sector}</span>
              </div>
            </div>
          </div>

          <div className={`
            px-2.5 py-1 rounded-lg text-[10px] font-bold border
            ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}
          `}>
            {statusConfig.label}
          </div>
        </div>
      </div>

      {/* STOCK INDICATOR SECTION */}
      <div className="p-4 space-y-3">
        {/* Circular Progress / Stock Display */}
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={status === "critical" ? "#ef4444" : status === "low" ? "#f59e0b" : "#10b981"}
                strokeWidth="3"
                strokeDasharray={`${percent}, 100`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white">{stock}</span>
              <span className="text-[9px] text-white/50">{item.unit}</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/50">Disponibilidad</span>
              <span className={`text-xs font-bold ${statusConfig.textColor}`}>
                {percent.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  status === "critical" ? "bg-red-500" :
                  status === "low" ? "bg-amber-500" :
                  "bg-emerald-500"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/40">Min: {minStock}</span>
              <span className="text-white/40">Max: {maxStock}</span>
            </div>
          </div>
        </div>

        {/* QUICK STATS ROW */}
        {!simplified && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <DollarSign size={12} className="text-gold" />
              <div>
                <p className="text-[9px] text-white/40">Costo unit.</p>
                <p className="text-xs font-semibold text-white">${cost.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-cyan" />
              <div>
                <p className="text-[9px] text-white/40">Valor total</p>
                <p className="text-xs font-semibold text-white">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* RECIPE INFO */}
        {!simplified && item.usedInRecipes && item.usedInRecipes.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            <Package size={10} className="text-violet-400" />
            <span className="text-[9px] text-violet-400">
              {item.usedInRecipes.length} receta(s)
            </span>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS - Floating on hover */}
      <div className={`
        absolute bottom-4 right-4 flex gap-2
        transition-all duration-300
        ${simplified ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        <button
          onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
          className="p-2 rounded-lg bg-violet/20 border border-violet/30 text-violet hover:bg-violet/30 transition-colors"
          title="Ver detalles"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(item); }}
          className="p-2 rounded-lg bg-cyan/20 border border-cyan/30 text-cyan hover:bg-cyan/30 transition-colors"
          title="Editar"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item._id!); }}
          className="p-2 rounded-lg bg-red/20 border border-red/30 text-red hover:bg-red/30 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* DECORATIVE ELEMENT */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
    </div>
  );
}