/**
 * StudioTopBar — Barra superior del Recipe Studio
 * Logo · Buscador global · Notificaciones · Usuario
 */
import { Bell, User, Wand2 } from 'lucide-react';
import type { Recipe } from '../../types';

interface Props {
  search:         string;
  onSearchChange: (v: string) => void;
  recipeCount:    number;
  filteredRecipes:Recipe[];
  onSelectRecipe: (r: Recipe) => void;
}

export function StudioTopBar({
  search, onSearchChange, recipeCount, filteredRecipes, onSelectRecipe,
}: Props) {
  return (
    <header className="flex items-center gap-4 px-5 py-3 border-b border-white/6 bg-[#0D0D10]/90 backdrop-blur-sm flex-shrink-0 relative z-30">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0 min-w-[148px]">
        <div className="p-1.5 rounded-lg bg-gold/15 border border-gold/25">
          <Wand2 size={15} className="text-gold" />
        </div>
        <span className="text-xs font-black text-ivory tracking-[0.15em] uppercase">
          Recipe Studio
        </span>
      </div>

      {/* Buscador */}
      <div className="relative flex-1 max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none w-3.5 h-3.5"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar recetas, ingredientes o categorías…"
          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-ivory placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
        />

        {/* Dropdown de resultados */}
        {search && filteredRecipes.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-surface-2 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-56 overflow-y-auto">
            {filteredRecipes.slice(0, 6).map((r) => (
              <button
                key={r._id}
                type="button"
                onClick={() => { onSearchChange(''); onSelectRecipe(r); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
              >
                {r.image ? (
                  <img src={r.image} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Wand2 size={12} className="text-gold" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ivory truncate">{r.product?.name}</p>
                  <p className="text-[10px] text-muted truncate">{r.category} · {r.type === 'drink' ? 'Bebida' : 'Comida'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="ml-auto flex items-center gap-2.5">
        <button
          type="button"
          className="relative w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-ivory transition-colors"
        >
          <Bell size={14} />
          {recipeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gold rounded-full text-[8px] font-black text-bg flex items-center justify-center">
              {Math.min(recipeCount, 9)}
            </span>
          )}
        </button>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
            <User size={11} className="text-gold" />
          </div>
          <span className="text-[11px] text-ivory font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}
