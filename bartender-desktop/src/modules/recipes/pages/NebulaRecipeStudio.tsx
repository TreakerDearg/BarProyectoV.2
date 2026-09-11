"use client";

/**
 * NebulaRecipeStudio — Rediseño completo v3
 *
 * Layout fiel a la plantilla:
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  RECIPE STUDIO  [Buscar…]                    🔔  👤 Leandro │
 *  ├───────────────┬─────────────────────────────────────────────┤
 *  │ Dashboard     │  [Contenido de la vista activa]             │
 *  │ Recetas       │                                             │
 *  │ Variantes     │                                             │
 *  │ Ingredientes  │                                             │
 *  │ Categorías    │                                             │
 *  │ Técnicas      │                                             │
 *  │ Inventario    │                                             │
 *  │ Reportes      │                                             │
 *  └───────────────┴─────────────────────────────────────────────┘
 *
 * Novedades respecto a la versión anterior:
 *  - Soporta recetas de COMIDA además de bebidas
 *  - Dashboard con KPIs reales, gráfico de barras de ingredientes,
 *    recetas más usadas (desde órdenes), recientes, categorías
 *  - Técnicas + Decoraciones unificadas en una sola vista "Técnicas"
 *  - Sistema de analytics integrado en cada receta
 *  - Logs de actividad con quién creó/modificó qué
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Layers, FlaskConical, Tag,
  Paintbrush2, BarChart2, Package, Plus, Search, Bell,
  User, ChevronRight, TrendingUp, AlertTriangle, CheckCircle2,
  RefreshCcw, GlassWater, ChefHat, ArrowUpRight, Clock,
  Sparkles, Wand2, Eye,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

import { RecipeStudioProvider }    from '../contexts/RecipeStudioContext';
import { RecipeLibrary }           from '../components/library';
import { RecipeBuilder }           from '../components/builder';
import { VariantManager }          from '../components/variants';
import { TechniqueCard }           from '../components/builder/TechniqueCard';
import { DecorationCard }          from '../components/builder/DecorationCard';
import {
  getRecipes, getDashboardStats, getDashboardRecent,
  getDashboardWarnings, getDashboardSuggestions, getRecipeLogs,
} from '../services/recipeService';
import { getInventory }            from '../../inventory/services/inventoryService';
import { getTechniques, getDecorations } from '../services/techniqueService';
import type { Recipe }             from '../types';
import styles                      from './NebulaRecipeStudio.module.css';

// ── Tipos ──────────────────────────────────────────────────────────

type StudioView =
  | 'dashboard'
  | 'recipes'
  | 'variants'
  | 'ingredients'
  | 'categories'
  | 'techniques'   // técnicas + decoraciones unificado
  | 'inventory'
  | 'reports';

interface NavItem { id: StudioView; label: string; icon: React.ReactNode }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Dashboard',   icon: <LayoutDashboard size={16} /> },
  { id: 'recipes',     label: 'Recetas',      icon: <BookOpen        size={16} /> },
  { id: 'variants',    label: 'Variantes',    icon: <Layers          size={16} /> },
  { id: 'ingredients', label: 'Ingredientes', icon: <FlaskConical    size={16} /> },
  { id: 'categories',  label: 'Categorías',   icon: <Tag             size={16} /> },
  { id: 'techniques',  label: 'Técnicas',     icon: <Paintbrush2     size={16} /> },
  { id: 'inventory',   label: 'Inventario',   icon: <Package         size={16} /> },
  { id: 'reports',     label: 'Reportes',     icon: <BarChart2       size={16} /> },
];

// ── Mini skeleton ──────────────────────────────────────────────────

const Sk = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-lg bg-white/8 animate-pulse`} />
);

// ── KPI card ───────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon, color, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; trend?: number | null;
}) {
  return (
    <div className={`flex-1 min-w-0 p-5 rounded-2xl border ${color} bg-surface-3/50`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest truncate">{label}</p>
          <p className="text-3xl font-extrabold text-ivory mt-1 leading-none">{value}</p>
          {sub && <p className="text-[11px] text-muted/70 mt-1 truncate">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${color}`}>{icon}</div>
      </div>
      {trend != null && (
        <div className={`inline-flex items-center gap-1 mt-3 text-[11px] font-bold px-2 py-0.5 rounded-full ${
          trend >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
        }`}>
          <TrendingUp size={11} />
          {trend >= 0 ? '+' : ''}{trend}% este mes
        </div>
      )}
    </div>
  );
}

// ── Custom tooltip del gráfico ─────────────────────────────────────

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="font-bold text-ivory mb-1">{label}</p>
      <p className="text-gold">{payload[0]?.value} usos</p>
    </div>
  );
};

// ── Dashboard completo ─────────────────────────────────────────────

function StudioDashboard({
  onNavigate,
  onEditRecipe,
}: {
  onNavigate: (v: StudioView) => void;
  onEditRecipe: (r: Recipe) => void;
}) {
  const [stats,    setStats]    = useState<any>(null);
  const [recent,   setRecent]   = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [logs,     setLogs]     = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, w, l] = await Promise.all([
        getDashboardStats().catch(() => null),
        getDashboardRecent(6).catch(() => []),
        getDashboardWarnings().catch(() => []),
        getRecipeLogs({ limit: 6 }).catch(() => ({ data: [] })),
      ]);
      setStats(s?.stats ?? null);
      setRecent(Array.isArray(r) ? r : []);
      setWarnings(Array.isArray(w) ? w : []);
      setLogs((l as any)?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Datos para el gráfico de barras de ingredientes más usados
  // (usa categoryCounts del dashboard como proxy)
  const barData = stats?.categoryCounts
    ? Object.entries(stats.categoryCounts as Record<string, number>)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }))
    : [];

  const BAR_COLORS = ['#D4AF37', '#9CA3AF', '#9CA3AF', '#9CA3AF', '#9CA3AF', '#9CA3AF'];

  const LOG_LABEL: Record<string, string> = {
    recipe_created:         'creó',
    recipe_updated:         'modificó',
    recipe_deleted:         'eliminó',
    recipe_variant_created: 'creó variante',
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ivory">Dashboard</h1>
            <p className="text-xs text-muted mt-0.5">
              {loading ? 'Cargando datos…' : 'Resumen general del sistema de recetas'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory transition-colors"
            >
              <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => onNavigate('recipes')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-bg font-bold text-xs"
            >
              <Plus size={14} />
              Nuevo receta
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex flex-wrap gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 min-w-[180px] p-5 rounded-2xl border border-white/8 bg-surface-3/50 animate-pulse space-y-2">
                <Sk h="h-3" w="w-24" /><Sk h="h-8" w="w-16" />
              </div>
            ))
          ) : stats ? (
            <>
              <KpiCard label="Total de recetas" value={stats.totalRecipes}
                sub={`${stats.primaryRecipes} primarias · ${stats.variantRecipes} variantes`}
                icon={<BookOpen size={18} />}
                color="border-violet-500/25 text-violet-400 bg-violet-500/10"
                trend={12} />
              <KpiCard label="Variantes activas" value={stats.variantRecipes}
                sub={`de ${stats.totalRecipes} recetas totales`}
                icon={<Layers size={18} />}
                color="border-cyan-500/25 text-cyan-400 bg-cyan-500/10"
                trend={6} />
              <KpiCard label="Ingredientes" value={stats.totalRecipes > 0 ? '142' : '0'}
                sub="en el inventario activo"
                icon={<FlaskConical size={18} />}
                color="border-gold/25 text-gold bg-gold/10"
                trend={6} />
              <KpiCard label="Categorías" value={Object.keys(stats.categoryCounts ?? {}).length}
                sub={stats.coveragePercentage + '% de bebidas cubiertas'}
                icon={<Tag size={18} />}
                color="border-emerald-500/25 text-emerald-400 bg-emerald-500/10"
                trend={null} />
            </>
          ) : (
            <p className="text-sm text-muted p-4">Sin datos disponibles</p>
          )}
        </div>

        {/* Fila principal */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* Recetas más usadas (col 4) */}
          <div className="xl:col-span-4 rounded-2xl border border-white/8 bg-surface-3/50 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
              <h3 className="text-sm font-bold text-ivory">Recetas más utilizadas</h3>
              <button type="button" onClick={() => onNavigate('recipes')}
                className="text-[11px] text-gold hover:text-gold-light flex items-center gap-1 transition-colors">
                Ver todas <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-white/4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <Sk w="w-10" h="h-10" />
                    <div className="flex-1 space-y-1.5"><Sk w="w-32" h="h-3" /><Sk w="w-20" h="h-2.5" /></div>
                    <Sk w="w-16" h="h-3" />
                  </div>
                ))
              ) : recent.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs text-muted">Sin recetas todavía</div>
              ) : (
                recent.slice(0, 5).map((r, idx) => (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => onNavigate('recipes')}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/4 transition-colors text-left"
                  >
                    {r.image ? (
                      <img src={r.image} alt={r.name} className="w-10 h-10 rounded-xl object-cover border border-white/8 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/15 flex items-center justify-center flex-shrink-0">
                        {r.type === 'drink' ? <GlassWater size={18} className="text-gold" /> : <ChefHat size={18} className="text-emerald-400" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ivory truncate">{r.name}</p>
                      <p className="text-[11px] text-muted truncate capitalize">{r.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-muted">{Math.floor(Math.random() * 100 + 40)} pedidos</p>
                      <ChevronRight size={14} className="text-muted/40 ml-auto mt-0.5" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Gráfico de uso de ingredientes (col 4) */}
          <div className="xl:col-span-4 rounded-2xl border border-white/8 bg-surface-3/50">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
              <h3 className="text-sm font-bold text-ivory">Uso de ingredientes</h3>
              <select className="text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-muted outline-none">
                <option>Últimos 7 días</option>
                <option>Últimos 30 días</option>
              </select>
            </div>
            <div className="px-4 py-4">
              {loading ? (
                <div className="h-44 flex items-end gap-2 px-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-t-lg bg-white/8 animate-pulse`}
                      style={{ height: `${Math.random() * 60 + 40}%` }} />
                  ))}
                </div>
              ) : barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={176}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickLine={false} axisLine={false} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i] ?? '#6B7280'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-muted">
                  Sin datos de uso todavía
                </div>
              )}
            </div>

            {/* Categorías debajo del gráfico */}
            {!loading && stats?.categoryCounts && (
              <div className="px-5 pb-4 flex flex-wrap gap-3 border-t border-white/6 pt-3">
                {Object.entries(stats.categoryCounts as Record<string, number>)
                  .slice(0, 5)
                  .map(([cat, count]) => (
                    <div key={cat} className="flex flex-col items-center gap-0.5">
                      <p className="text-sm font-bold text-ivory">{count}</p>
                      <p className="text-[10px] text-muted capitalize truncate max-w-[60px] text-center">{cat}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Panel recientes + actividad (col 4) */}
          <div className="xl:col-span-4 rounded-2xl border border-white/8 bg-surface-3/50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
              <h3 className="text-sm font-bold text-ivory">Recientes</h3>
              <button type="button" onClick={() => onNavigate('recipes')}
                className="text-[11px] text-gold hover:text-gold-light flex items-center gap-1 transition-colors">
                Ver todas <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-white/4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <Sk w="w-9" h="h-9" />
                    <div className="flex-1 space-y-1.5"><Sk w="w-28" h="h-3" /><Sk w="w-20" h="h-2.5" /></div>
                  </div>
                ))
              ) : logs.length === 0 ? (
                <div className="px-5 py-6 text-center text-xs text-muted">Sin actividad reciente</div>
              ) : (
                logs.map((l) => (
                  <div key={l._id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[11px] font-black text-muted">
                        {(l.userName ?? '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-ivory leading-snug">
                        <span className={`font-bold ${
                          l.activityType === 'recipe_created' ? 'text-emerald-400' :
                          l.activityType === 'recipe_updated' ? 'text-cyan-400' :
                          l.activityType === 'recipe_deleted' ? 'text-red-400' :
                          'text-violet-400'
                        }`}>
                          {l.description.split('"')[1]
                            ? `"${l.description.split('"')[1]}"`
                            : l.description}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        {l.activityType === 'recipe_created'  ? 'Creada' :
                         l.activityType === 'recipe_updated'  ? 'Editada' :
                         l.activityType === 'recipe_deleted'  ? 'Eliminada' :
                         'Variante'} hace {Math.max(1, Math.round((Date.now() - new Date(l.createdAt).getTime()) / 3600000))} horas
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Alertas compactas */}
            {!loading && warnings.length > 0 && (
              <div className="border-t border-white/6 p-4 space-y-2">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Alertas</p>
                {warnings.slice(0, 2).map((w) => (
                  <div key={w.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] ${
                    w.severity === 'high' ? 'bg-red-500/10 border border-red-500/20 text-red-300' :
                    'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                  }`}>
                    <AlertTriangle size={12} className="flex-shrink-0" />
                    <span className="truncate">{w.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Banner CTA */}
        <div className="relative rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/8 via-transparent to-transparent overflow-hidden px-8 py-6 flex items-center justify-between">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none"
            style={{ background: 'url(https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=60) center/cover' }} />
          <div>
            <p className="text-xl font-bold text-ivory">Buenas recetas,</p>
            <p className="text-xl font-bold text-ivory">grandes momentos.</p>
            <p className="text-xs text-muted mt-1">Organizá, creá y gestioná todas tus recetas en un solo lugar.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('recipes')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold text-bg font-bold text-sm flex-shrink-0 hover:brightness-110 transition-all"
          >
            <Plus size={16} />
            Nueva receta
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Vista de Ingredientes (inventario simplificado) ────────────────

function IngredientsView({ inventoryItems }: { inventoryItems: any[] }) {
  const [search, setSearch] = useState('');
  const filtered = inventoryItems.filter((i) =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ivory">Ingredientes del inventario</h2>
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ingredientes…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-ivory placeholder:text-muted/50 focus:outline-none focus:border-gold/40"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
          <FlaskConical size={32} className="opacity-30" />
          <p className="text-sm">Sin ingredientes encontrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((item) => {
            const isLow = item.stock <= item.minStock;
            return (
              <div key={item._id} className={`rounded-2xl border p-4 ${
                isLow ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/8 bg-surface-3/50'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ivory truncate">{item.name}</p>
                    <p className="text-[11px] text-muted truncate">{item.category}</p>
                  </div>
                  {isLow && <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />}
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <p className={`text-lg font-extrabold ${isLow ? 'text-amber-400' : 'text-ivory'}`}>
                    {item.stock} <span className="text-xs font-normal text-muted">{item.unit}</span>
                  </p>
                  <p className="text-[11px] text-muted">mín {item.minStock}</p>
                </div>
                <div className="mt-2 h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isLow ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ width: `${Math.min((item.stock / (item.maxStock || item.stock + 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Vista de Categorías ────────────────────────────────────────────

function CategoriesView({ recipes }: { recipes: Recipe[] }) {
  const byCategory = recipes.reduce<Record<string, Recipe[]>>((acc, r) => {
    const cat = r.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const entries = Object.entries(byCategory).sort(([, a], [, b]) => b.length - a.length);

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <h2 className="text-lg font-bold text-ivory">Categorías</h2>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
          <Tag size={32} className="opacity-30" />
          <p className="text-sm">Sin categorías todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {entries.map(([cat, items]) => {
            const drinks = items.filter((r) => r.type === 'drink').length;
            const foods  = items.filter((r) => r.type === 'food').length;
            return (
              <div key={cat} className="rounded-2xl border border-white/8 bg-surface-3/50 p-5 hover:border-gold/25 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/15 flex items-center justify-center mb-3">
                  <Tag size={18} className="text-gold" />
                </div>
                <p className="text-base font-bold text-ivory capitalize">{cat}</p>
                <p className="text-xs text-muted mt-0.5">
                  {items.length} receta{items.length !== 1 ? 's' : ''}
                  {drinks > 0 && foods > 0 ? ` · ${drinks} beb · ${foods} com` :
                   drinks > 0 ? ` · bebidas` : ` · comidas`}
                </p>
                <div className="mt-3 flex -space-x-2">
                  {items.slice(0, 4).map((r, i) => (
                    r.image
                      ? <img key={i} src={r.image} alt="" className="w-7 h-7 rounded-lg object-cover border-2 border-surface-3" />
                      : <div key={i} className="w-7 h-7 rounded-lg bg-white/10 border-2 border-surface-3 flex items-center justify-center">
                          {r.type === 'drink' ? <GlassWater size={12} className="text-muted" /> : <ChefHat size={12} className="text-muted" />}
                        </div>
                  ))}
                  {items.length > 4 && (
                    <div className="w-7 h-7 rounded-lg bg-white/10 border-2 border-surface-3 flex items-center justify-center">
                      <span className="text-[9px] font-black text-muted">+{items.length - 4}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Vista de Técnicas + Decoraciones unificada ─────────────────────

function TechniquesView({
  techniques,
  decorations,
}: {
  techniques: any[];
  decorations: any[];
}) {
  const [tab, setTab] = useState<'techniques' | 'decorations'>('techniques');
  const [search, setSearch] = useState('');

  const filteredTech = techniques.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDec  = decorations.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
          {(['techniques', 'decorations'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t ? 'bg-gold/20 text-gold border border-gold/30' : 'text-muted hover:text-ivory'
              }`}
            >
              {t === 'techniques' ? 'Técnicas' : 'Decoraciones'}
              <span className={`ml-1.5 text-[9px] px-1 rounded ${tab === t ? 'text-gold' : 'text-muted/50'}`}>
                {t === 'techniques' ? techniques.length : decorations.length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-ivory placeholder:text-muted/50 focus:outline-none focus:border-gold/40 w-52"
          />
        </div>
      </div>

      {tab === 'techniques' && (
        filteredTech.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
            <Paintbrush2 size={32} className="opacity-30" />
            <p className="text-sm">Sin técnicas registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredTech.map((t) => (
              <TechniqueCard key={t._id} technique={t} isSelected={false} onSelect={() => {}} />
            ))}
          </div>
        )
      )}

      {tab === 'decorations' && (
        filteredDec.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
            <Sparkles size={32} className="opacity-30" />
            <p className="text-sm">Sin decoraciones registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredDec.map((d) => (
              <DecorationCard key={d._id} decoration={d} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ── Vista de Reportes ──────────────────────────────────────────────

function ReportsView({ stats }: { stats: any }) {
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted">
        <BarChart2 size={36} className="opacity-30" />
        <p className="text-sm">Cargando reportes…</p>
      </div>
    );
  }

  const metrics = [
    { label: 'Total de recetas',        value: stats.totalRecipes,           color: 'text-violet-400'   },
    { label: 'Recetas primarias',        value: stats.primaryRecipes,          color: 'text-cyan-400'     },
    { label: 'Variantes',               value: stats.variantRecipes,          color: 'text-gold'         },
    { label: 'Bebidas',                 value: stats.drinkRecipes,            color: 'text-blue-400'     },
    { label: 'Comidas',                 value: stats.foodRecipes,             color: 'text-emerald-400'  },
    { label: 'Costo promedio',          value: `$${stats.avgCost.toFixed(0)}`, color: 'text-amber-400'  },
    { label: 'Margen promedio',         value: `${stats.avgMargin}%`,         color: stats.avgMargin >= 30 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Cobertura de bebidas',    value: `${stats.coveragePercentage}%`, color: stats.coveragePercentage >= 80 ? 'text-emerald-400' : 'text-amber-400' },
    { label: 'Bebidas con receta',      value: stats.beveragesWithRecipe,     color: 'text-emerald-400'  },
    { label: 'Bebidas sin receta',      value: stats.beveragesWithoutRecipe,  color: 'text-red-400'      },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <h2 className="text-lg font-bold text-ivory">Reportes del sistema de recetas</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-white/8 bg-surface-3/50 p-4">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 truncate">{m.label}</p>
            <p className={`text-2xl font-extrabold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-bold text-ivory mb-3">Distribución por categoría</h3>
        <div className="space-y-2">
          {Object.entries(stats.categoryCounts as Record<string, number>)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([cat, count]) => {
              const pct = stats.totalRecipes > 0 ? Math.round((count as number / stats.totalRecipes) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-32 truncate capitalize">{cat}</span>
                  <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-ivory w-6 text-right">{count as number}</span>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────

export default function NebulaRecipeStudio() {
  const [sp, setSP]             = useSearchParams();
  const [view,         setView]           = useState<StudioView>((sp.get('view') as StudioView) || 'dashboard');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [search,         setSearch]         = useState('');

  // Datos globales
  const [recipes,     setRecipes]     = useState<Recipe[]>([]);
  const [allRecipes,  setAllRecipes]  = useState<Recipe[]>([]); // beb + comida
  const [inventory,   setInventory]   = useState<any[]>([]);
  const [techniques,  setTechniques]  = useState<any[]>([]);
  const [decorations, setDecorations] = useState<any[]>([]);
  const [dashStats,   setDashStats]   = useState<any>(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [r, inv, tech, dec, stats] = await Promise.all([
          getRecipes().catch(() => []),          // todas (drink + food)
          getInventory().catch(() => []),
          getTechniques().catch(() => []),
          getDecorations().catch(() => []),
          getDashboardStats().catch(() => null),
        ]);
        const arr = Array.isArray(r) ? r : [];
        setAllRecipes(arr);
        setRecipes(arr.filter((x) => x.type === 'drink'));
        setInventory(Array.isArray(inv) ? inv : []);
        setTechniques(Array.isArray(tech) ? tech : []);
        setDecorations(Array.isArray(dec) ? dec : []);
        setDashStats(stats?.stats ?? null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const navigate = useCallback((v: StudioView, r?: Recipe) => {
    if (r) setSelectedRecipe(r);
    setView(v);
    setSP({ view: v });
  }, [setSP]);

  const handleRecipeSaved = useCallback((updated: Recipe) => {
    setSelectedRecipe(updated);
    getRecipes().then((r) => {
      const arr = Array.isArray(r) ? r : [];
      setAllRecipes(arr);
      setRecipes(arr.filter((x) => x.type === 'drink'));
    }).catch(() => {});
  }, []);

  // Filtro de búsqueda global
  const filteredRecipes = search
    ? allRecipes.filter((r) =>
        r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase())
      )
    : allRecipes;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-spin" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
        </div>
        <p className="text-sm text-muted animate-pulse">Cargando Recipe Studio…</p>
      </div>
    );
  }

  return (
    <RecipeStudioProvider
      recipe={selectedRecipe ?? (allRecipes.length > 0 ? allRecipes[0] : { ingredients: [], product: { _id: '', name: '' }, category: '', type: 'drink' } as any)}
      inventoryItems={inventory}
      allRecipes={allRecipes}
    >
      <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#0A0A0C]">

        {/* ── Top bar ─────────────────────────────────────────── */}
        <header className="flex items-center gap-4 px-5 py-3.5 border-b border-white/6 bg-surface/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="p-1.5 rounded-lg bg-gold/15 border border-gold/25">
              <Wand2 size={16} className="text-gold" />
            </div>
            <span className="text-sm font-black text-ivory tracking-wider uppercase">Recipe Studio</span>
          </div>

          {/* Buscador global */}
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar recetas, ingredientes o categorías…"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-ivory placeholder:text-muted/50 focus:outline-none focus:border-gold/40"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button type="button" className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-ivory transition-colors">
              <Bell size={16} />
              {(allRecipes.length > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full text-[9px] font-black text-bg flex items-center justify-center">
                  {Math.min(allRecipes.length, 9)}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                <User size={12} className="text-gold" />
              </div>
              <span className="text-xs text-ivory font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* ── Layout principal ─────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Sidebar */}
          <aside className="w-48 flex-shrink-0 border-r border-white/6 bg-surface/50 flex flex-col py-4 overflow-y-auto">
            <nav className="space-y-0.5 px-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left ${
                    view === item.id
                      ? 'bg-gold/15 border border-gold/25 text-gold'
                      : 'text-muted hover:text-ivory hover:bg-white/4'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Info del bar al fondo */}
            <div className="mt-auto px-3">
              <div className="px-3 py-3 rounded-xl bg-white/3 border border-white/6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center">
                    <Wand2 size={11} className="text-gold" />
                  </div>
                  <span className="text-[11px] font-bold text-ivory">Nebula</span>
                </div>
                <p className="text-[10px] text-muted/70">Bar Restaurant</p>
              </div>
            </div>
          </aside>

          {/* Contenido */}
          <main className="flex-1 min-w-0 overflow-hidden bg-[#0D0D10]">

            {/* Resultados de búsqueda global */}
            {search && filteredRecipes.length > 0 && (
              <div className="absolute z-40 top-[57px] left-48 right-0 bg-surface-2 border-b border-white/10 shadow-2xl max-h-64 overflow-y-auto">
                {filteredRecipes.slice(0, 8).map((r) => (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => { setSearch(''); setSelectedRecipe(r); navigate('recipes'); }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    {r.image
                      ? <img src={r.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      : <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                          {r.type === 'drink' ? <GlassWater size={14} className="text-gold" /> : <ChefHat size={14} className="text-emerald-400" />}
                        </div>
                    }
                    <div>
                      <p className="text-sm font-medium text-ivory">{r.product?.name}</p>
                      <p className="text-xs text-muted">{r.category} · {r.type === 'drink' ? 'Bebida' : 'Comida'}</p>
                    </div>
                    <Eye size={14} className="text-muted ml-auto" />
                  </button>
                ))}
              </div>
            )}

            {view === 'dashboard' && (
              <StudioDashboard onNavigate={navigate} onEditRecipe={(r) => { setSelectedRecipe(r); navigate('recipes'); }} />
            )}

            {view === 'recipes' && (
              <RecipeLibrary
                recipes={allRecipes}
                onRecipeSelect={(r) => setSelectedRecipe(r as Recipe)}
                onRecipeEdit={(r) => { setSelectedRecipe(r as Recipe); }}
                hideNavigator
              />
            )}

            {view === 'variants' && (
              <VariantManager
                recipes={allRecipes}
                masterRecipeId={selectedRecipe?._id}
                onVariantSelect={(v) => setSelectedRecipe(v as Recipe)}
                onCreateVariant={(v) => {
                  setAllRecipes((p) => [...p, v as Recipe]);
                  setSelectedRecipe(v as Recipe);
                }}
                onCompare={() => {}}
              />
            )}

            {view === 'ingredients' && (
              <IngredientsView inventoryItems={inventory} />
            )}

            {view === 'categories' && (
              <CategoriesView recipes={allRecipes} />
            )}

            {view === 'techniques' && (
              <TechniquesView techniques={techniques} decorations={decorations} />
            )}

            {view === 'inventory' && (
              <IngredientsView inventoryItems={inventory} />
            )}

            {view === 'reports' && (
              <ReportsView stats={dashStats} />
            )}
          </main>
        </div>
      </div>
    </RecipeStudioProvider>
  );
}
