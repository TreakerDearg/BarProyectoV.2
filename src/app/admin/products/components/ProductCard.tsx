"use client";

import {
  Pencil,
  Trash2,
  Wine,
  UtensilsCrossed,
  DollarSign,
  TrendingUp,
  Zap,
  Activity,
  Box,
  Link as LinkIcon
} from "lucide-react";

import type { Product } from "@/lib/types/product";

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onInspect?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onInspect
}: Props) {
  const isDrink = product.type === "drink";
  const price = product.price ?? 0;
  const dynamicPrice = (product.dynamicPrice ?? price) as number;
  const cost = product.cost ?? 0;
  const margin = dynamicPrice > 0 ? Math.round(((dynamicPrice - cost) / dynamicPrice) * 100) : 0;
  const hasAdjustment = Math.abs(dynamicPrice - price) > 0.01;

  const typeTheme = isDrink 
    ? { color: "gold", icon: <Wine size={20} /> } 
    : { color: "emerald", icon: <UtensilsCrossed size={20} /> };

  return (
    <div className={`
      relative group cursor-pointer
      rounded-[2.5rem] p-8 space-y-7
      border border-white/5
      bg-surface-2 overflow-hidden transition-all duration-500
      hover:translate-y-[-8px] hover:shadow-royale
      ${isDrink ? 'hover:border-gold/30' : 'hover:border-emerald-400/30'}
    `}>
      
      {/* ATMOSPHERIC GLOW */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-700 opacity-0 group-hover:opacity-100 ${isDrink ? 'bg-gold/10' : 'bg-emerald-400/10'}`} />

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl bg-surface-3 border border-white/5 text-${typeTheme.color} shadow-inner`}>
            {typeTheme.icon}
          </div>
          <div>
            <h3 className="font-black text-xl text-ivory tracking-tighter uppercase leading-none truncate max-w-[150px]">
              {product.name}
            </h3>
            <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em] mt-1">
              {product.category || 'GENERAL'} · {product.type?.toUpperCase()}
            </p>
          </div>
        </div>

        <div className={`badge ${isDrink ? 'badge-gold' : 'badge-emerald'} text-[8px] px-3 py-1.5 rounded-xl font-black tracking-widest`}>
          VIP SELECTION
        </div>
      </div>

      {/* ================= PRICE & PROFIT ================= */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
          <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">PRECIO VENTA</p>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className={hasAdjustment ? "text-primary" : "text-emerald-400"} />
            <span className={`text-lg font-black ${hasAdjustment ? "text-primary" : "text-ivory"}`}>
              ${dynamicPrice.toFixed(2)}
            </span>
            {hasAdjustment && (
              <span className="text-[10px] text-muted line-through opacity-50 ml-1">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
          <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">RENTABILIDAD</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className={margin > 50 ? 'text-lime' : 'text-gold'} />
            <span className={`text-lg font-black ${margin > 50 ? 'text-lime' : 'text-gold'}`}>{margin}%</span>
          </div>
        </div>
      </div>

      {/* ================= TACTICAL STATS ================= */}
      <div className="flex items-center gap-6 relative z-10">
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-muted" />
          <p className="text-[9px] font-black text-muted uppercase tracking-widest">Costo: ${cost.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2">
          <LinkIcon size={12} className="text-gold opacity-50" />
          <p className="text-[9px] font-black text-muted uppercase tracking-widest">Fórmula Vinculada</p>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex flex-col gap-3 relative z-10">
        <button
          onClick={() => onInspect?.(product)}
          className="w-full h-14 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center gap-3 hover:bg-gold/10 hover:border-gold/30 transition-all group/btn"
        >
          <Zap size={16} className="text-gold" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold">MAPEO DE INGREDIENTES</span>
        </button>
        
        <div className="flex gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <Pencil size={14} className="text-muted" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted">EDITAR</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product._id!); }}
            className="w-14 h-14 rounded-2xl bg-red/5 border border-red/10 flex items-center justify-center text-red/40 hover:text-red hover:bg-red/20 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* CASINO DECOR */}
      <div className="absolute -bottom-1 -right-1 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Box size={100} />
      </div>
    </div>
  );
}