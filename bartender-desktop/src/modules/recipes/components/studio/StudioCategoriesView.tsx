/**
 * StudioCategoriesView — Vista de Categorías en el Recipe Studio
 * Grid de categorías · conteo de recetas · miniaturas · soporte drink + food
 * SIN overflow-y-auto propio — el DashboardLayout.main scrollea
 */
import { useState, useEffect, useMemo } from 'react';
import {
  Tag, GlassWater, ChefHat, BookOpen,
  RefreshCcw, Search, Layers,
} from 'lucide-react';
import { getRecipes } from '../../services/recipeService';
import type { Recipe } from '../../types';

// ── Paleta de colores para categorías ─────────────────────────────
const CAT_PALETTE = [
  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-300',  dot: 'bg-violet-400' },
  { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-300',    dot: 'bg-cyan-400' },
  { bg: 'bg-gold/8',         border: 'border-gold/20',        text: 'text-gold',        dot: 'bg-gold' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-300',    dot: 'bg-rose-400' },
  { bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  text: 'text-orange-300',  dot: 'bg-orange-400' },
  { bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     text: 'text-sky-300',     dot: 'bg-sky-400' },
  { bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    text: 'text-pink-300',    dot: 'bg-pink-400' },
];

function paletteFor(index: number) {
  return CAT_PALETTE[index % CAT_PALETTE.length];
}

// ── Skeleton ───────────────────────────────────────────────────────
const Sk = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-lg bg-white/8 animate-pulse`} />
);

// ── Tipos internos ────────────────────────────────────────────────
interface CategoryGroup {
  name:       string;
  total:      number;
  drinks:     number;
  food:       number;
  recipes:    Recipe[];     // primeras 4 para miniaturas
  paletteIdx: number;
}

// ── Card de categoría ─────────────────────────────────────────────
function CategoryCard({ group }: { group: CategoryGroup }) {
  const pal = paletteFor(group.paletteIdx);
  const thumbs = group.recipes.slice(0, 4);

  return (
    <div className={`rounded-2xl border ${pal.border} ${pal.bg} p-5 flex flex-col gap-4 transition-all hover:brightness-110`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${pal.dot}`} />
          <p className={`text-sm font-bold ${pal.text} capitalize truncate`}>{group.name}</p>
        </div>
        <span className={`flex-shrink-0 text-xs font-black px-2.5 py-0.5 rounded-full ${pal.bg} border ${pal.border} ${pal.text}`}>
          {group.total}
        </span>
      </div>

      {/* Miniaturas */}
      {thumbs.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {thumbs.map((r) => (
            r.image ? (
              <img
                key={r._id}
                src={r.image}
                alt={r.name}
                className="aspect-square w-full rounded-lg object-cover border border-white/8"
              />
            ) : (
              <div
                key={r._id}
                className="aspect-square w-full rounded-lg bg-white/6 border border-white/8 flex items-center justify-center"
              >
                {r.type === 'drink'
                  ? <GlassWater size={13} className="text-muted/60" />
                  : <ChefHat   size={13} className="text-muted/60" />
                }
              </div>
            )
          ))}
          {/* Placeholders vacíos */}
          {Array.from({ length: Math.max(0, 4 - thumbs.length) }).map((_, i) => (
            <div
              key={`ph-${i}`}
              className="aspect-square w-full rounded-lg bg-white/4 border border-white/6"
            />
          ))}
        </div>
      )}

      {/* Badges tipo */}
      <div className="flex gap-2 flex-wrap">
        {group.drinks > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-muted bg-white/5 border border-white/8 px-2 py-0.5 rounded-lg">
            <GlassWater size={10} className="text-cyan-400" />
            {group.drinks} bebidas
          </div>
        )}
        {group.food > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-muted bg-white/5 border border-white/8 px-2 py-0.5 rounded-lg">
            <ChefHat size={10} className="text-emerald-400" />
            {group.food} comidas
          </div>
        )}
      </div>

      {/* Barra de distribución */}
      {group.total > 0 && (group.drinks > 0 || group.food > 0) && (
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full bg-white/8 overflow-hidden flex">
            {group.drinks > 0 && (
              <div
                className="h-full bg-cyan-400/60 transition-all"
                style={{ width: `${Math.round((group.drinks / group.total) * 100)}%` }}
              />
            )}
            {group.food > 0 && (
              <div
                className="h-full bg-emerald-400/60 transition-all"
                style={{ width: `${Math.round((group.food / group.total) * 100)}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-muted/50">
            <span>{group.drinks > 0 ? `${Math.round((group.drinks / group.total) * 100)}% bebida` : ''}</span>
            <span>{group.food > 0 ? `${Math.round((group.food / group.total) * 100)}% comida` : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────
export function StudioCategoriesView() {
  const [recipes,  setRecipes]  = useState<Recipe[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'drink' | 'food'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getRecipes();
      setRecipes(Array.isArray(data) ? data : []);
    } catch {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Agrupar por categoría
  const groups = useMemo<CategoryGroup[]>(() => {
    const map = new Map<string, CategoryGroup>();
    let idx = 0;

    recipes.forEach((r) => {
      const cat = r.category || 'Sin categoría';
      if (!map.has(cat)) {
        map.set(cat, { name: cat, total: 0, drinks: 0, food: 0, recipes: [], paletteIdx: idx++ });
      }
      const g = map.get(cat)!;
      g.total++;
      if (r.type === 'drink') g.drinks++;
      else                    g.food++;
      if (g.recipes.length < 4) g.recipes.push(r);
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [recipes]);

  // Filtrado
  const filtered = useMemo(() => {
    return groups.filter((g) => {
      const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase());
      const matchType   =
        typeFilter === 'all'   ? true :
        typeFilter === 'drink' ? g.drinks > 0 :
                                 g.food > 0;
      return matchSearch && matchType;
    });
  }, [groups, search, typeFilter]);

  const totalDrink = recipes.filter((r) => r.type === 'drink').length;
  const totalFood  = recipes.filter((r) => r.type !== 'drink').length;

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto w-full">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ivory">Categorías</h1>
          <p className="text-xs text-muted mt-0.5">
            {loading ? 'Cargando…' : `${groups.length} categorías · ${recipes.length} recetas en total`}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors disabled:opacity-40"
        >
          <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────── */}
      {!loading && (
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-white/8 bg-surface-3/40 flex items-center gap-3">
            <Tag size={17} className="text-gold flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted uppercase tracking-widest">Categorías</p>
              <p className="text-xl font-bold text-ivory">{groups.length}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-cyan-500/20 bg-cyan-500/6 flex items-center gap-3">
            <GlassWater size={17} className="text-cyan-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-cyan-400 uppercase tracking-widest">Bebidas</p>
              <p className="text-xl font-bold text-cyan-300">{totalDrink}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/6 flex items-center gap-3">
            <ChefHat size={17} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest">Comidas</p>
              <p className="text-xl font-bold text-emerald-300">{totalFood}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-violet-500/20 bg-violet-500/6 flex items-center gap-3">
            <Layers size={17} className="text-violet-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-violet-400 uppercase tracking-widest">Total recetas</p>
              <p className="text-xl font-bold text-violet-300">{recipes.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filtros ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar categoría…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-ivory placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl border border-white/8 bg-white/3">
          {(['all', 'drink', 'food'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                typeFilter === t
                  ? 'bg-gold/15 text-gold border border-gold/25'
                  : 'text-muted hover:text-ivory'
              }`}
            >
              {t === 'all'   && <><BookOpen  size={11} /> Todos</>}
              {t === 'drink' && <><GlassWater size={11} className="text-cyan-400" /> Bebidas</>}
              {t === 'food'  && <><ChefHat   size={11} className="text-emerald-400" /> Comidas</>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid de categorías ────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/8 bg-surface-3/40 p-5 space-y-3 animate-pulse">
              <div className="flex justify-between"><Sk w="w-20" h="h-3.5" /><Sk w="w-8" h="h-5" /></div>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 4 }).map((__, j) => <Sk key={j} w="w-full" h="h-8" />)}
              </div>
              <Sk h="h-2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Tag size={36} className="text-muted/25 mb-3" />
          <p className="text-sm font-semibold text-muted">Sin categorías</p>
          <p className="text-xs text-muted/50 mt-1">
            {search || typeFilter !== 'all' ? 'Probá con otros filtros' : 'Agregá recetas para ver categorías'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((g) => (
            <CategoryCard key={g.name} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}
