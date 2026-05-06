import {
  Pencil,
  Trash2,
  Sparkles,
  Layers,
  CheckCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  Box,
  Target,
  Zap
} from "lucide-react";

import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
}

export default function MenuCard({ menu, onEdit, onDelete }: Props) {
  const totalProducts = menu.categories?.reduce((acc, cat) => acc + (cat.products?.length || 0), 0) || 0;
  const totalCategories = menu.categories?.length || 0;
  const mainCategory = menu.categories?.[0]?.name || "Gral";
  const isActive = menu.active;

  return (
    <div className={`
      relative group cursor-pointer
      rounded-[2.5rem] p-8 space-y-7
      border border-white/5
      bg-surface-2 overflow-hidden transition-all duration-500
      hover:translate-y-[-8px] hover:shadow-royale
      ${isActive ? 'hover:border-gold/30' : 'hover:border-red/30'}
    `}>
      {/* ATMOSPHERIC GLOW */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-700 opacity-0 group-hover:opacity-100 ${isActive ? 'bg-gold/10' : 'bg-red/10'}`} />

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${isActive ? 'bg-gold/10 text-gold shadow-gold-glow' : 'bg-red/10 text-red shadow-red-glow'}`}>
            <Layers size={24} />
          </div>
          <div>
            <h3 className="font-black text-xl text-ivory tracking-tighter uppercase leading-none truncate max-w-[150px]">
              {menu.name}
            </h3>
            <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em] mt-1">
              {mainCategory} · EXP {totalProducts > 10 ? 'VIP' : 'STD'}
            </p>
          </div>
        </div>

        <div className={`badge ${isActive ? 'badge-gold' : 'badge-red'} text-[8px] px-3 py-1.5 rounded-xl font-black tracking-widest`}>
          {isActive ? 'ACTIVO' : 'PAUSADO'}
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}
      <p className="text-xs text-muted/80 font-bold leading-relaxed line-clamp-2 relative z-10 italic">
        "{menu.description || "Sin descripción estratégica para este menú."}"
      </p>

      {/* ================= STATS ROW ================= */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
          <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">CATEGORÍAS</p>
          <div className="flex items-center gap-2">
            <Target size={12} className="text-gold" />
            <span className="text-sm font-black text-ivory">{totalCategories}</span>
          </div>
        </div>
        <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
          <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">PRODUCTOS</p>
          <div className="flex items-center gap-2">
            <Box size={12} className="text-emerald-400" />
            <span className="text-sm font-black text-ivory">{totalProducts}</span>
          </div>
        </div>
      </div>

      {/* ================= METRICS PREVIEW ================= */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center gap-2">
          <TrendingUp size={12} className="text-gold opacity-50" />
          <p className="text-[9px] font-black text-muted uppercase tracking-[0.3em]">Eficiencia de Carta</p>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${isActive ? 'bg-grad-gold' : 'bg-red'} transition-all duration-1000`} 
            style={{ width: `${Math.min(100, (totalProducts / 20) * 100)}%` }}
          />
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-3 relative z-10 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
        <button
          onClick={() => onEdit(menu)}
          className="flex-[2] h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between px-6 hover:bg-gold/10 hover:border-gold/30 transition-all group/btn"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted group-hover/btn:text-gold">CONFIGURAR</span>
          <ChevronRight size={18} className="text-muted group-hover/btn:text-gold group-hover/btn:translate-x-1 transition-all" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(menu._id!); }}
          className="w-14 h-14 rounded-2xl bg-red/5 border border-red/10 flex items-center justify-center text-red/40 hover:text-red hover:bg-red/20 hover:border-red/40 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* CASINO DECOR */}
      <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Zap size={100} />
      </div>
    </div>
  );
}