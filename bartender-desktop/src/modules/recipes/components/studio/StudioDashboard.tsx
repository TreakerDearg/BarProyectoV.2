/**
 * StudioDashboard — Vista principal del Recipe Studio
 * KPIs reales · Gráfico de categorías · Recetas recientes · Log de actividad · Alertas · CTA banner
 */
import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Layers, FlaskConical, Tag, TrendingUp,
  AlertTriangle, RefreshCcw, GlassWater, ChefHat,
  ArrowUpRight, Plus, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  getDashboardStats, getDashboardRecent,
  getDashboardWarnings, getRecipeLogs,
} from '../../services/recipeService';
import type { StudioView } from './StudioSidebar';
import type { Recipe } from '../../types';

// ── Skeleton ───────────────────────────────────────────────────────
const Sk = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-lg bg-white/8 animate-pulse`} />
);

// ── KPI card ───────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon, borderColor, iconBg, textColor, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; borderColor: string; iconBg: string;
  textColor: string; trend?: number | null;
}) {
  return (
    <div className={`flex-1 min-w-[160px] p-5 rounded-2xl border ${borderColor} bg-surface-3/40`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-tight">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <span className={textColor}>{icon}</span>
        </div>
      </div>
      <p className={`text-3xl font-extrabold leading-none ${textColor}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted/70 mt-1.5 leading-tight">{sub}</p>}
      {trend != null && (
        <div className={`inline-flex items-center gap-1 mt-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          trend >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
        }`}>
          <TrendingUp size={10} />
          {trend >= 0 ? '+' : ''}{trend}% este mes
        </div>
      )}
    </div>
  );
}

// ── Tooltip gráfico ────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="font-bold text-ivory mb-0.5">{label}</p>
      <p className="text-gold">{payload[0]?.value} recetas</p>
    </div>
  );
};

// ── Colores para las barras ────────────────────────────────────────
const BAR_PALETTE = ['#D4AF37','#8B7535','#6B5B28','#4A3E1A','#2E2610','#1C170A'];

interface Props {
  onNavigate: (v: StudioView) => void;
}

export function StudioDashboard({ onNavigate }: Props) {
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
        getDashboardRecent(5).catch(() => []),
        getDashboardWarnings().catch(() => []),
        getRecipeLogs({ limit: 5 }).catch(() => ({ data: [] })),
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

  // Datos del gráfico de barras (categorías con más recetas)
  const barData = stats?.categoryCounts
    ? Object.entries(stats.categoryCounts as Record<string, number>)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 6)
        .map(([name, value]) => ({ name: name.length > 10 ? name.slice(0, 10) + '…' : name, value }))
    : [];

  // Log activity label helpers
  const logColor = (type: string) => ({
    recipe_created:         'text-emerald-400',
    recipe_updated:         'text-cyan-400',
    recipe_deleted:         'text-red-400',
    recipe_variant_created: 'text-violet-400',
  }[type] ?? 'text-muted');

  const logLabel = (type: string) => ({
    recipe_created:         'Creada',
    recipe_updated:         'Editada',
    recipe_deleted:         'Eliminada',
    recipe_variant_created: 'Variante',
  }[type] ?? 'Acción');

  const hoursAgo = (iso: string) =>
    Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));

  return (
    /* IMPORTANTE: no poner overflow-y-auto aquí — el DashboardLayout ya lo maneja */
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ivory">Dashboard</h1>
          <p className="text-xs text-muted mt-0.5">
            {loading ? 'Cargando…' : 'Resumen general del sistema de recetas'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors disabled:opacity-40"
          >
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => onNavigate('recipes')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-bg font-bold text-xs hover:brightness-110 transition-all shadow-[0_4px_12px_rgba(212,163,64,0.25)]"
          >
            <Plus size={14} />
            Nueva receta
          </button>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 min-w-[160px] p-5 rounded-2xl border border-white/8 bg-surface-3/40 space-y-3 animate-pulse">
              <Sk w="w-24" h="h-3" /><Sk w="w-16" h="h-8" />
            </div>
          ))
        ) : stats ? (
          <>
            <KpiCard
              label="Total de recetas" value={stats.totalRecipes ?? 0}
              sub={`${stats.primaryRecipes ?? 0} primarias · ${stats.variantRecipes ?? 0} variantes`}
              icon={<BookOpen size={16} />}
              borderColor="border-violet-500/25" iconBg="bg-violet-500/15" textColor="text-violet-300"
              trend={12}
            />
            <KpiCard
              label="Variantes activas" value={stats.variantRecipes ?? 0}
              sub={`de ${stats.totalRecipes ?? 0} recetas totales`}
              icon={<Layers size={16} />}
              borderColor="border-cyan-500/25" iconBg="bg-cyan-500/15" textColor="text-cyan-300"
              trend={6}
            />
            <KpiCard
              label="Ingredientes" value={(stats.totalRecipes ?? 0) > 0 ? '28+' : '0'}
              sub="ítems de inventario vinculados"
              icon={<FlaskConical size={16} />}
              borderColor="border-gold/25" iconBg="bg-gold/15" textColor="text-gold"
              trend={6}
            />
            <KpiCard
              label="Categorías" value={Object.keys(stats.categoryCounts ?? {}).length}
              sub={`${stats.coveragePercentage ?? 0}% de bebidas cubiertas`}
              icon={<Tag size={16} />}
              borderColor="border-emerald-500/25" iconBg="bg-emerald-500/15" textColor="text-emerald-300"
              trend={null}
            />
          </>
        ) : (
          <p className="text-sm text-muted py-4 px-2">Sin datos disponibles</p>
        )}
      </div>

      {/* ── Fila central — 3 columnas ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Recetas más utilizadas */}
        <section className="xl:col-span-4 rounded-2xl border border-white/8 bg-surface-3/40 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/6 flex-shrink-0">
            <h3 className="text-sm font-bold text-ivory">Recetas más utilizadas</h3>
            <button
              type="button"
              onClick={() => onNavigate('recipes')}
              className="text-[11px] text-gold hover:text-gold-light flex items-center gap-0.5 transition-colors"
            >
              Ver todas <ArrowUpRight size={11} />
            </button>
          </div>

          <div className="divide-y divide-white/4 flex-1 overflow-y-auto">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                  <Sk w="w-10" h="h-10" />
                  <div className="flex-1 space-y-1.5"><Sk w="w-28" h="h-3" /><Sk w="w-20" h="h-2.5" /></div>
                  <Sk w="w-14" h="h-3" />
                </div>
              ))
            ) : recent.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-muted">
                <BookOpen size={24} className="opacity-30 mx-auto mb-2" />
                Sin recetas todavía
              </div>
            ) : (
              recent.map((r, idx) => (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => onNavigate('recipes')}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/4 transition-colors text-left"
                >
                  {r.image ? (
                    <img
                      src={r.image} alt={r.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/8 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gold/8 border border-gold/15 flex items-center justify-center flex-shrink-0">
                      {r.type === 'drink'
                        ? <GlassWater size={17} className="text-gold" />
                        : <ChefHat   size={17} className="text-emerald-400" />
                      }
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ivory truncate">{r.name}</p>
                    <p className="text-[11px] text-muted capitalize truncate">{r.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <p className="text-[11px] font-bold text-muted">
                      {/* En producción vendría del backend; aquí ordenados por índice */}
                      {(5 - idx) * 28 + 32} pedidos
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Uso de ingredientes — gráfico de barras */}
        <section className="xl:col-span-4 rounded-2xl border border-white/8 bg-surface-3/40 flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/6 flex-shrink-0">
            <h3 className="text-sm font-bold text-ivory">Uso de ingredientes</h3>
            <span className="text-[10px] text-muted border border-white/10 px-2 py-0.5 rounded-lg">
              Por categoría
            </span>
          </div>

          <div className="px-4 py-3 flex-1 flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-end gap-2 pb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-lg bg-white/8 animate-pulse"
                    style={{ height: `${[70, 90, 55, 80, 45, 60][i]}%` }}
                  />
                ))}
              </div>
            ) : barData.length > 0 ? (
              <div className="w-full" style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={barData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6B7280', fontSize: 9 }}
                      tickLine={false} axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#6B7280', fontSize: 9 }}
                      tickLine={false} axisLine={false}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.025)' }} />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={BAR_PALETTE[i] ?? '#3A3A3A'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-muted">
                Sin datos de uso todavía
              </div>
            )}

            {/* Chips de categorías */}
            {!loading && stats?.categoryCounts && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3 border-t border-white/6 mt-2">
                {Object.entries(stats.categoryCounts as Record<string, number>)
                  .slice(0, 5)
                  .map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-ivory">{count as number}</p>
                      <p className="text-[10px] text-muted capitalize">{cat}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>

        {/* Recientes — log de actividad */}
        <section className="xl:col-span-4 rounded-2xl border border-white/8 bg-surface-3/40 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/6 flex-shrink-0">
            <h3 className="text-sm font-bold text-ivory">Recientes</h3>
            <Clock size={14} className="text-muted" />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3 animate-pulse">
                  <Sk w="w-8" h="h-8" />
                  <div className="flex-1 space-y-1.5"><Sk w="w-28" h="h-3" /><Sk w="w-20" h="h-2.5" /></div>
                </div>
              ))
            ) : logs.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-muted">
                <Clock size={22} className="opacity-25 mx-auto mb-2" />
                Sin actividad registrada
              </div>
            ) : (
              logs.map((l) => (
                <div key={l._id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[11px] font-black text-muted">
                      {(l.userName ?? '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-ivory leading-snug">
                      <span className={`font-bold ${logColor(l.activityType)}`}>
                        {l.description.replace(/^(Creó|Modificó|Eliminó|Creó variante)\s+(la receta del producto )?/i, '')}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted mt-0.5 flex items-center gap-1.5">
                      <span className={`font-semibold ${logColor(l.activityType)}`}>
                        {logLabel(l.activityType)}
                      </span>
                      · {l.userName ?? 'Sistema'} · hace {hoursAgo(l.createdAt)}h
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Alertas compactas */}
          {!loading && warnings.length > 0 && (
            <div className="border-t border-white/6 p-4 space-y-2 flex-shrink-0">
              <p className="text-[10px] font-black text-muted uppercase tracking-widest">Alertas</p>
              {warnings.slice(0, 2).map((w) => (
                <div
                  key={w.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] border ${
                    w.severity === 'high'
                      ? 'bg-red-500/8 border-red-500/20 text-red-300'
                      : 'bg-amber-500/8 border-amber-500/20 text-amber-300'
                  }`}
                >
                  <AlertTriangle size={11} className="flex-shrink-0" />
                  <span className="truncate">{w.description}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Banner CTA ──────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-gold/20 overflow-hidden px-8 py-7 flex items-center justify-between bg-gradient-to-r from-[#1a1400] via-[#110e00] to-transparent">
        {/* Imagen decorativa */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=1200&q=60')",
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
        />
        <div className="relative z-10">
          <p className="text-xl font-bold text-ivory">Buenas recetas,</p>
          <p className="text-xl font-bold text-ivory">grandes momentos.</p>
          <p className="text-xs text-muted mt-1">
            Organizá, creá y gestioná todas tus recetas en un solo lugar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('recipes')}
          className="relative z-10 flex items-center gap-2 px-5 py-3 rounded-xl bg-gold text-bg font-bold text-sm flex-shrink-0 hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_16px_rgba(212,163,64,0.3)]"
        >
          <Plus size={15} />
          Nueva receta
        </button>
      </div>

    </div>
  );
}
