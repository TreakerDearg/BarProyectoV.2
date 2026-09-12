/**
 * RecipeLibrary — Biblioteca de recetas
 * SIN overflow-y interno — el DashboardLayout.main scrollea
 */
import { useState, memo } from 'react';
import {
  Search, Plus, LayoutGrid, AlignJustify, Grid2X2,
  GlassWater, Heart, BookOpen, RefreshCcw,
} from 'lucide-react';
import type { Recipe } from '../../types';
import { PremiumRecipeCard } from './PremiumRecipeCard';
import { QuickPreview }      from './QuickPreview';
import { LibraryEmptyState } from './LibraryEmptyState';
import styles from './RecipeLibrary.module.css';

/* ── Tipos ───────────────────────────────────────────────────── */
type ViewMode  = 'gallery' | 'grid' | 'compact' | 'list';
type SortMode  = 'name' | 'date' | 'cost' | 'popularity';

/* ── Props ───────────────────────────────────────────────────── */
interface RecipeLibraryProps {
  recipes:        Recipe[];
  onRecipeSelect?: (recipe: Recipe) => void;
  onRecipeEdit?:   (recipe: Recipe) => void;
  onNewRecipe?:    () => void;
  hideNavigator?:  boolean;
  onNavigate?:     (mode: string) => void;
}

/* ── Barra superior compacta ─────────────────────────────────── */
function LibraryBar({
  search, onSearch,
  viewMode, setViewMode,
  sortMode, setSortMode,
  filter, setFilter,
  total, onNew,
}: {
  search: string; onSearch: (v: string) => void;
  viewMode: ViewMode; setViewMode: (v: ViewMode) => void;
  sortMode: SortMode; setSortMode: (v: SortMode) => void;
  filter: 'all' | 'drinks' | 'food' | 'favorites';
  setFilter: (v: 'all' | 'drinks' | 'food' | 'favorites') => void;
  total: number; onNew?: () => void;
}) {
  const views: { id: ViewMode; icon: React.ElementType; label: string }[] = [
    { id: 'gallery', icon: Grid2X2,      label: 'Gallery' },
    { id: 'grid',    icon: LayoutGrid,   label: 'Grid'    },
    { id: 'compact', icon: LayoutGrid,   label: 'Compact' },
    { id: 'list',    icon: AlignJustify, label: 'Lista'   },
  ];

  const filters: { id: typeof filter; label: string; icon?: React.ElementType }[] = [
    { id: 'all',       label: 'Todas'    },
    { id: 'drinks',    label: 'Bebidas',   icon: GlassWater },
    { id: 'food',      label: 'Comidas'               },
    { id: 'favorites', label: 'Favoritas', icon: Heart },
  ];

  return (
    <div className="flex flex-col gap-3 px-6 py-4 border-b border-white/6 bg-[#0A0A0F]/60 sticky top-0 z-10 backdrop-blur-xl">
      {/* Fila 1: título + search + nuevo */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={18} className="text-gold flex-shrink-0" />
          <div>
            <h2 className="text-base font-bold text-ivory leading-none">Biblioteca</h2>
            <p className="text-[10px] text-muted/60 mt-0.5">{total} recetas</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar receta, categoría…"
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-xs text-ivory placeholder:text-muted/40 focus:outline-none focus:border-gold/35 transition-colors"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Sort */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-[11px] text-muted focus:outline-none focus:border-gold/35 transition-colors cursor-pointer"
          >
            <option value="name">Nombre</option>
            <option value="date">Fecha</option>
            <option value="cost">Costo</option>
            <option value="popularity">Popularidad</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 p-1 bg-white/4 border border-white/8 rounded-xl">
            {views.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                title={label}
                onClick={() => setViewMode(id)}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === id
                    ? 'bg-gold/15 text-gold border border-gold/20'
                    : 'text-muted hover:text-ivory'
                }`}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>

          {/* Nueva receta */}
          {onNew && (
            <button
              type="button"
              onClick={onNew}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold text-bg text-xs font-bold hover:brightness-110 transition-all shadow-[0_4px_12px_rgba(212,163,64,0.2)]"
            >
              <Plus size={14} />
              Nueva
            </button>
          )}
        </div>
      </div>

      {/* Fila 2: filtros de tipo */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {filters.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all ${
              filter === id
                ? 'bg-gold/12 border-gold/25 text-gold'
                : 'bg-white/4 border-white/8 text-muted hover:text-ivory hover:border-white/14'
            }`}
          >
            {Icon && <Icon size={11} />}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */
export const RecipeLibrary = memo(function RecipeLibrary({
  recipes,
  onRecipeSelect,
  onRecipeEdit,
  onNewRecipe,
}: RecipeLibraryProps) {
  const [search,   setSearch]   = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [filter,   setFilter]   = useState<'all' | 'drinks' | 'food' | 'favorites'>('all');
  const [preview,  setPreview]  = useState<Recipe | null>(null);

  /* ── Filtrado + orden ──────────────────────────────────────── */
  const filtered = recipes
    .filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        r.product?.name?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.tags?.some((t) => {
          const label = typeof t === 'string' ? t : t.name;
          return label?.toLowerCase().includes(q);
        });

      const matchFilter =
        filter === 'all'       ? true :
        filter === 'drinks'    ? r.type === 'drink'  :
        filter === 'food'      ? r.type !== 'drink'  :
        filter === 'favorites' ? r.isFavorite === true : true;

      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      switch (sortMode) {
        case 'name':       return (a.product?.name ?? '').localeCompare(b.product?.name ?? '');
        case 'cost':       return (b.totalCost ?? 0) - (a.totalCost ?? 0);
        case 'popularity': return (b.analytics?.popularity ?? 0) - (a.analytics?.popularity ?? 0);
        case 'date':
        default:           return 0;
      }
    });

  if (recipes.length === 0) {
    return (
      <div className={styles.recipeLibrary}>
        <LibraryEmptyState
          onNewRecipe={() => onNewRecipe?.()}
          onImport={() => {}}
        />
      </div>
    );
  }

  return (
    <div className={styles.recipeLibrary}>
      {/* Top bar fijo con sticky */}
      <LibraryBar
        search={search}       onSearch={setSearch}
        viewMode={viewMode}   setViewMode={setViewMode}
        sortMode={sortMode}   setSortMode={setSortMode}
        filter={filter}       setFilter={setFilter}
        total={recipes.length}
        onNew={onNewRecipe}
      />

      <div className={styles.libraryMain}>
        {filtered.length === 0 ? (
          <div className={styles.noResults}>
            <Search size={40} className={styles.noResultsIcon} />
            <p className={styles.noResultsText}>
              No se encontraron recetas para "{search || filter}"
            </p>
          </div>
        ) : (
          <div className={`${styles.recipeGrid} ${styles[viewMode]}`}>
            {filtered.map((recipe, index) => (
              <PremiumRecipeCard
                key={recipe._id}
                recipe={recipe}
                onSelect={() => onRecipeSelect?.(recipe)}
                onEdit={() => onRecipeEdit?.(recipe)}
                onPreview={() => setPreview(recipe)}
                isHero={index === 0 && viewMode === 'gallery'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick preview modal */}
      <QuickPreview
        recipe={preview}
        onEdit={() => preview && onRecipeEdit?.(preview)}
        onOpenBuilder={() => preview && onRecipeSelect?.(preview)}
        onClose={() => setPreview(null)}
      />
    </div>
  );
});
