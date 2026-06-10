import {
  Pencil,
  Trash2,
  ChevronRight,
  TrendingUp,
  Box,
  Target,
  Zap,
  Copy,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Martini,
  Utensils,
  Layers,
  Star,
  Eye,
  Image as ImageIcon,
  Loader2
} from "lucide-react";

import { useState } from "react";
import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (menu: Menu) => void;
  onExport?: (menu: Menu) => void;
  simplified?: boolean;
}

export default function MenuCard({ menu, onEdit, onDelete, onDuplicate, onExport, simplified = false }: Props) {
  const totalProducts = menu.categories?.reduce((acc, cat) => acc + (cat.products?.length || 0), 0) || 0;
  const totalCategories = menu.categories?.length || 0;
  const mainCategory = menu.categories?.[0]?.name || "Gral";
  const isActive = menu.active;
  const isPublic = menu.isPublic;

  // Image loading states
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Calculate products with recipes
  const productsWithRecipes = menu.categories?.reduce((acc, cat) => {
    return acc + (cat.products?.filter(p => p.hasRecipe).length || 0);
  }, 0) || 0;

  // Get type icon
  const getTypeIcon = () => {
    switch (menu.type) {
      case 'drink':
        return <Martini size={12} className="text-cyan-400" />;
      case 'food':
        return <Utensils size={12} className="text-gold" />;
      case 'mixed':
      default:
        return <Layers size={12} className="text-violet-400" />;
    }
  };

  // Get type badge color
  const getTypeBadgeColor = () => {
    switch (menu.type) {
      case 'drink':
        return 'bg-cyan/10 border-cyan/30 text-cyan-300';
      case 'food':
        return 'bg-gold/10 border-gold/30 text-gold-300';
      case 'mixed':
      default:
        return 'bg-violet/10 border-violet/30 text-violet-300';
    }
  };

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
          {menu.image && !imageError ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-3 border border-white/5 flex-shrink-0 relative group/image shadow-lg">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-3">
                  <Loader2 size={20} className="text-violet-400/50 animate-spin" />
                </div>
              )}
              <img
                src={menu.image}
                alt={menu.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-110 group-hover/image:rotate-1"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-surface-3 to-surface-2 border border-white/5 flex-shrink-0 flex items-center justify-center shadow-lg group/image hover:from-violet/10 hover:to-surface-3 transition-all duration-300">
              <ImageIcon size={24} className="text-muted/40 group-hover/image:text-violet-400/60 transition-colors" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-xl text-ivory tracking-tighter uppercase leading-none truncate">
                {menu.name}
              </h3>
              {isActive ? (
                <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 animate-pulse" aria-label="Menú activo" />
              ) : (
                <XCircle size={14} className="text-red-400 flex-shrink-0" aria-label="Menú pausado" />
              )}
              {isPublic && (
                <Eye size={12} className="text-cyan-400 flex-shrink-0" aria-label="Menú público" />
              )}
              {menu.featured && (
                <Star size={12} className="text-gold-400 flex-shrink-0" aria-label="Menú destacado" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[8px] font-semibold uppercase tracking-wider ${getTypeBadgeColor()}`}>
                {getTypeIcon()}
                <span>{menu.type || 'mixed'}</span>
              </div>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em]">
                {mainCategory} · EXP {totalProducts > 10 ? 'VIP' : 'STD'}
              </p>
            </div>
            {!simplified && (
              <div className="flex items-center gap-2 mt-1.5">
                <Clock size={10} className="text-muted" />
                <span className="text-[8px] text-muted">
                  {menu.updatedAt ? `Actualizado ${new Date(menu.updatedAt).toLocaleDateString()}` : 'Actualizado recientemente'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={`badge text-[8px] px-3 py-1.5 rounded-xl font-black tracking-widest border ${isActive ? 'badge-gold' : 'badge-red'}`}>
          {isActive ? 'ACTIVO' : 'PAUSADO'}
        </div>
      </div>

      {/* ================= DESCRIPTION - Hidden in simplified mode ================= */}
      {!simplified && (
        <p className="text-xs text-muted/80 font-bold leading-relaxed line-clamp-2 relative z-10 italic">
          "{menu.description || "Sin descripción estratégica para este menú."}"
        </p>
      )}

      {/* ================= STATS ROW - Simplified in simple mode ================= */}
      <div className={`grid gap-3 relative z-10 ${simplified ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center hover:border-white/10 transition-colors">
          <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">PRODUCTOS</p>
          <div className="flex items-center gap-2">
            <Box size={12} className="text-emerald-400" />
            <span className="text-sm font-black text-ivory">{totalProducts}</span>
          </div>
        </div>
        {!simplified && (
          <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center hover:border-white/10 transition-colors">
            <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">CATEGORÍAS</p>
            <div className="flex items-center gap-2">
              <Target size={12} className="text-gold" />
              <span className="text-sm font-black text-ivory">{totalCategories}</span>
            </div>
          </div>
        )}
        <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center hover:border-white/10 transition-colors">
          <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">RECETAS</p>
          <div className="flex items-center gap-2">
            <FileText size={12} className="text-violet-400" />
            <span className="text-sm font-black text-ivory">{productsWithRecipes}</span>
          </div>
        </div>
      </div>

      {/* ================= METRICS PREVIEW - Hidden in simplified mode ================= */}
      {!simplified && (
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={12} className="text-gold opacity-50" />
              <p className="text-[9px] font-black text-muted uppercase tracking-[0.3em]">Eficiencia de Carta</p>
            </div>
            {menu.featured && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30">
                <Star size={8} className="text-gold-400" />
                <span className="text-[8px] font-semibold text-gold-300 uppercase tracking-wider">Destacado</span>
              </div>
            )}
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${isActive ? 'bg-grad-gold' : 'bg-red'} transition-all duration-1000`}
              style={{ width: `${Math.min(100, (totalProducts / 20) * 100)}%` }}
            />
          </div>
          {menu.categories && menu.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {menu.categories.slice(0, 3).map((cat, idx) => (
                <span key={idx} className="text-[8px] px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded font-semibold">
                  {cat.name}: {cat.products?.length || 0}
                </span>
              ))}
              {menu.categories.length > 3 && (
                <span className="text-[8px] text-muted">+{menu.categories.length - 3} categorías</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= ACTIONS - Always visible but simplified in simple mode ================= */}
      <div className={`flex gap-3 relative z-10 ${simplified ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'} transition-all duration-500`}>
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(menu); }}
            className="w-14 h-14 rounded-2xl bg-violet/5 border border-violet/10 flex items-center justify-center text-violet/40 hover:text-violet hover:bg-violet/20 transition-all"
            aria-label="Duplicar menú"
          >
            <Copy size={18} />
          </button>
        )}
        {onExport && (
          <button
            onClick={(e) => { e.stopPropagation(); onExport(menu); }}
            className="w-14 h-14 rounded-2xl bg-cyan/5 border border-cyan/10 flex items-center justify-center text-cyan/40 hover:text-cyan hover:bg-cyan/20 transition-all"
            aria-label="Exportar menú"
          >
            <Download size={18} />
          </button>
        )}
        <button
          onClick={() => onEdit(menu)}
          className={`rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gold/10 hover:border-gold/30 transition-all group/btn focus:outline-none focus:ring-2 focus:ring-gold/50 ${simplified ? 'flex-1 h-12' : 'flex-[2] h-14 px-6 justify-between'}`}
          aria-label={simplified ? "Editar menú" : "Configurar menú"}
        >
          {!simplified && <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted group-hover/btn:text-gold">CONFIGURAR</span>}
          {simplified ? <Pencil size={16} className="text-muted group-hover/btn:text-gold" /> : <ChevronRight size={18} className="text-muted group-hover/btn:text-gold group-hover/btn:translate-x-1 transition-all" />}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(menu._id!); }}
          className={`rounded-2xl bg-red/5 border border-red/10 flex items-center justify-center text-red/40 hover:text-red hover:bg-red/20 hover:border-red/40 transition-all focus:outline-none focus:ring-2 focus:ring-red/50 ${simplified ? 'w-12 h-12' : 'w-14 h-14'}`}
          aria-label="Eliminar menú"
        >
          <Trash2 size={simplified ? 16 : 18} />
        </button>
      </div>

      {/* CASINO DECOR */}
      <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Zap size={100} />
      </div>
    </div>
  );
}