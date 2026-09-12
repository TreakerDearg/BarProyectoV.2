/**
 * StudioIngredientsView — Vista de Ingredientes en el Recipe Studio
 * Grid de ítems de inventario · filtro por categoría · stock bar · badge de alerta
 * SIN overflow-y-auto propio — el DashboardLayout.main scrollea
 */
import { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical, AlertTriangle, Search, RefreshCcw,
  ChevronDown, Package, TrendingDown,
} from 'lucide-react';
import { getInventory } from '../../../inventory/services/inventoryService';
import type { InventoryItem } from '../../../inventory/types/inventory';

// ── Helpers ────────────────────────────────────────────────────────
function stockPct(item: InventoryItem): number {
  const max = item.maxStock ?? (item.quantity * 2 || 100);
  return Math.min(100, Math.round((item.quantity / max) * 100));
}

function stockLabel(item: InventoryItem): 'critical' | 'low' | 'ok' {
  const pct = stockPct(item);
  if (pct <= 10) return 'critical';
  if (item.quantity <= (item.minStock ?? 0)) return 'low';
  return 'ok';
}

const STATUS_COLOR: Record<string, string> = {
  critical: 'bg-red-500',
  low:      'bg-amber-400',
  ok:       'bg-emerald-500',
};
const STATUS_TEXT: Record<string, string> = {
  critical: 'text-red-400',
  low:      'text-amber-400',
  ok:       'text-emerald-400',
};

// ── Skeleton ───────────────────────────────────────────────────────
const Sk = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-lg bg-white/8 animate-pulse`} />
);

// ── Card de ingrediente ────────────────────────────────────────────
function IngredientCard({ item }: { item: InventoryItem }) {
  const pct    = stockPct(item);
  const status = stockLabel(item);

  return (
    <div className={`relative rounded-2xl border p-4 flex flex-col gap-3 bg-surface-3/40 transition-all hover:border-white/16 ${
      status === 'critical' ? 'border-red-500/30'
      : status === 'low'    ? 'border-amber-400/25'
      :                       'border-white/8'
    }`}>
      {/* Badge alerta */}
      {status !== 'ok' && (
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
          status === 'critical' ? 'bg-red-500/15 text-red-400' : 'bg-amber-400/15 text-amber-300'
        }`}>
          <AlertTriangle size={9} />
          {status === 'critical' ? 'Crítico' : 'Bajo'}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pr-12">
        <div className="w-10 h-10 rounded-xl bg-gold/8 border border-gold/15 flex items-center justify-center flex-shrink-0">
          <FlaskConical size={17} className="text-gold" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ivory leading-tight truncate">{item.name}</p>
          <p className="text-[11px] text-muted capitalize mt-0.5">{item.category ?? 'Sin categoría'}</p>
        </div>
      </div>

      {/* Stock bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-muted">Stock actual</span>
          <span className={`font-bold ${STATUS_TEXT[status]}`}>
            {item.quantity} {item.unit}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${STATUS_COLOR[status]}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted/50">
          <span>Mín: {item.minStock ?? 0} {item.unit}</span>
          <span>{pct}%</span>
        </div>
      </div>

      {/* Precio */}
      {item.costPerUnit != null && item.costPerUnit > 0 && (
        <p className="text-[11px] text-muted border-t border-white/6 pt-2">
          Costo: <span className="text-ivory font-semibold">${item.costPerUnit.toFixed(2)}/{item.unit}</span>
        </p>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────
export function StudioIngredientsView() {
  const [items,    setItems]    = useState<InventoryItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'critical'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Categorías únicas
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category ?? 'Sin categoría'));
    return ['all', ...Array.from(set).sort()];
  }, [items]);

  // Filtrado
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchCat    = catFilter === 'all' || item.category === catFilter;
      const status      = stockLabel(item);
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [items, search, catFilter, statusFilter]);

  // Estadísticas rápidas
  const criticals = items.filter((i) => stockLabel(i) === 'critical').length;
  const lows      = items.filter((i) => stockLabel(i) === 'low').length;

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto w-full">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ivory">Ingredientes</h1>
          <p className="text-xs text-muted mt-0.5">
            {loading ? 'Cargando…' : `${items.length} ítems de inventario vinculados`}
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

      {/* ── KPIs compactos ────────────────────────────────────── */}
      {!loading && (
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-white/8 bg-surface-3/40 flex items-center gap-3">
            <Package size={18} className="text-gold flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted uppercase tracking-widest">Total</p>
              <p className="text-xl font-bold text-ivory">{items.length}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/6 flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-red-400 uppercase tracking-widest">Críticos</p>
              <p className="text-xl font-bold text-red-300">{criticals}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-amber-400/20 bg-amber-400/6 flex items-center gap-3">
            <TrendingDown size={18} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-amber-400 uppercase tracking-widest">Stock bajo</p>
              <p className="text-xl font-bold text-amber-300">{lows}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filtros ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ingrediente…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-ivory placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>

        {/* Categoría */}
        <div className="relative">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-3 pr-7 py-2 text-xs text-ivory focus:outline-none focus:border-gold/40 transition-colors cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#0A0A0D]">
                {c === 'all' ? 'Todas las categorías' : c}
              </option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        {/* Estado de stock */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-white/8 bg-white/3">
          {(['all', 'low', 'critical'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                statusFilter === s
                  ? 'bg-gold/15 text-gold border border-gold/25'
                  : 'text-muted hover:text-ivory'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'low' ? 'Bajo' : 'Crítico'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid de ingredientes ──────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/8 bg-surface-3/40 p-4 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <Sk w="w-10" h="h-10" />
                <div className="flex-1 space-y-2"><Sk w="w-24" h="h-3" /><Sk w="w-16" h="h-2.5" /></div>
              </div>
              <Sk h="h-1.5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FlaskConical size={36} className="text-muted/25 mb-3" />
          <p className="text-sm font-semibold text-muted">Sin ingredientes</p>
          <p className="text-xs text-muted/50 mt-1">
            {search || catFilter !== 'all' || statusFilter !== 'all'
              ? 'Probá con otros filtros'
              : 'El inventario está vacío'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <IngredientCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
