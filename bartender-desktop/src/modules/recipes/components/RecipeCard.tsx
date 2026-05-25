import {
  Trash2,
  Martini,
  Utensils,
  Flame,
  Zap,
  ChevronRight,
  TrendingUp,
  Box
} from "lucide-react";

import type { Recipe } from "../types/recipe";

interface Props {
  recipe: Recipe;
  onDelete: (id: string) => void;
  onOpen?: (recipe: Recipe) => void;
}

export default function RecipeCard({
  recipe,
  onDelete,
  onOpen,
}: Props) {
  const isDrink = recipe.type === "drink";

  const handleOpen = () => {
    if (!onOpen) return;
    onOpen(recipe);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!recipe._id) return;
    onDelete(recipe._id);
  };

  const handleOpenButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onOpen) return;
    onOpen(recipe);
  };

  return (
    <div
      onClick={handleOpen}
      className={`
        relative group cursor-pointer
        rounded-[2.5rem] p-8 space-y-6
        border border-white/5
        bg-surface-2 overflow-hidden transition-all duration-500
        hover:translate-y-[-8px] hover:shadow-royale
        ${isDrink ? 'hover:border-amber-400/30' : 'hover:border-emerald-400/30'}
      `}
    >
      {/* ATMOSPHERIC GLOW */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-700 opacity-0 group-hover:opacity-100 ${isDrink ? 'bg-gold/10' : 'bg-emerald-400/10'}`} />

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${isDrink ? 'bg-gold/10 text-gold shadow-gold-glow' : 'bg-emerald-400/10 text-emerald-400 shadow-emerald-glow'}`}>
            {isDrink ? <Martini size={24} /> : <Utensils size={24} />}
          </div>
          <div>
            <h3 className="font-black text-xl text-ivory tracking-tighter uppercase leading-none truncate max-w-[150px]">
              {recipe.product?.name || "Sin producto"}
            </h3>
            <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em] mt-1">
              {recipe.category || "GENERAL"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`badge ${isDrink ? 'badge-gold' : 'badge-emerald'} text-[8px] px-3 py-1.5 rounded-xl font-black tracking-widest`}>
            {recipe.type?.toUpperCase()}
          </div>
          {recipe.isActive === false && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red/10 border border-red/20 rounded-lg animate-pulse">
              <Flame size={10} className="text-red" />
              <span className="text-[8px] text-red font-black uppercase">PAUSED</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= STATS ROW ================= */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
          <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">INGREDIENTES</p>
          <div className="flex items-center gap-2">
            <Box size={12} className="text-gold" />
            <span className="text-sm font-black text-ivory">{recipe.ingredients?.length || 0}</span>
          </div>
        </div>
        <div className="bg-surface-3/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
          <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">COSTO TOTAL</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={12} className="text-emerald-400" />
            <span className="text-sm font-black text-ivory">${recipe.totalCost?.toFixed(2) || "0.00"}</span>
          </div>
        </div>
      </div>

      {/* ================= PREVIEW INGREDIENTS ================= */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-gold opacity-50" />
          <p className="text-[9px] font-black text-muted uppercase tracking-[0.3em]">Composición Base</p>
        </div>
        
        <div className="space-y-2">
          {recipe.ingredients?.slice(0, 3).map((i, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-transparent group-hover:border-white/5 transition-colors">
              <span className="text-xs font-bold text-ivory/80 truncate">
                {i.inventoryItem?.name || "Ítem"}
              </span>
              <span className="text-[10px] font-black text-muted uppercase tracking-tighter">
                {i.quantity} {i.unit}
              </span>
            </div>
          ))}
          {recipe.ingredients?.length > 3 && (
            <div className="flex justify-center pt-1">
              <p className="text-[9px] text-muted/50 font-black uppercase tracking-widest">+ {recipe.ingredients.length - 3} elementos adicionales</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-3 relative z-10 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
        <button
          onClick={handleOpenButton}
          className="flex-[2] h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between px-6 hover:bg-gold/10 hover:border-gold/30 transition-all group/btn"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted group-hover/btn:text-gold">EXAMINAR</span>
          <ChevronRight size={18} className="text-muted group-hover/btn:text-gold group-hover/btn:translate-x-1 transition-all" />
        </button>

        <button
          onClick={handleDelete}
          className="w-14 h-14 rounded-2xl bg-red/5 border border-red/10 flex items-center justify-center text-red/40 hover:text-red hover:bg-red/20 hover:border-red/40 transition-all"
          title="Archivar Receta"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* CASINO DECOR */}
      <div className="absolute -bottom-1 -right-1 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        {isDrink ? <Martini size={120} /> : <Utensils size={120} />}
      </div>
    </div>
  );
}