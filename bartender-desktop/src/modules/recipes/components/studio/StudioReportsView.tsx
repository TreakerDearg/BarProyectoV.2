/**
 * StudioReportsView — Vista de Reportes / Analíticas del Recipe Studio
 * Métricas detalladas · distribución por categoría · cobertura de bebidas · tendencias
 * SIN overflow-y-auto propio — el DashboardLayout.main scrollea
 */
import { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, GlassWater, ChefHat, TrendingUp,
  RefreshCcw, AlertTriangle, CheckCircle2, Circle,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  getDashboardStats,
  getDashboardWarnings,
} from '../../services/recipeService';

// ── Paleta de colores para la torta ───────────────────────────────
const PIE_COLORS = [
  '#D4AF37','#B8962E','#8B7535','#6B5B28','#4A3E1A',
  '#2E6B5A','#1E8C5E','#22D3A8','#0EA5E9','#7C3AED',
];

// ── Skeleton ───────────────────────────────────────────────────────
const Sk = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-lg bg-white/8 animate-pulse`} />
);

// ── Tooltip personalizado ──────────────────────────────────────────
const PieTooltipCustom = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="font-bold text-ivory mb-0.5 capitalize">{payload[0].name}</p>
      <p className="text-gold">{payload[0].value} recetas</p>
      <p className="text-muted">{payload[0].payload.pct}% del total</p>
    </div>
  );
};

const BarTooltipCustom = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="font-bold text-ivory mb-0.5 capitalize">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({
  label, value, sub, color = 'text-ivory', bg = 'border-white/8 bg-surface-3/40',
}: {
  label: string; value: string | number; sub?: string; color?: string; bg?: string;
}) {
  return (
    <div className={`flex-1 min-w-[140px] p-4 rounded-2xl border ${bg} space-y-1`}>
      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted/60">{sub}</p>}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────
export function StudioReportsView() {
  const [stats,    setStats]    = useState<any>(null);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, w] = await Promise.all([
        getDashboardStats().catch(() => null),
        getDashboardWarnings().catch(() => []),
      ]);
      setStats(s?.stats ?? null);
      setWarnings(Array.isArray(w) ? w : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Datos derivados ──────────────────────────────────────────────
  const catCounts: Record<string, number> = stats?.categoryCounts ?? {};
  const totalRecipes = stats?.totalRecipes ?? 0;

  // Pie chart data
  const pieData = Object.entries(catCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([name, value]) => ({
      name,
      value: value as number,
      pct: totalRecipes > 0 ? Math.round(((value as number) / totalRecipes) * 100) : 0,
    }));

  // Bar chart: bebidas vs comidas por categoría (datos simulados enriquecidos con los reales)
  const barData = Object.entries(catCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 7)
    .map(([name, total]) => ({
      name: name.length > 9 ? name.slice(0, 9) + '…' : name,
      total: total as number,
    }));

  const coveragePct = stats?.coveragePercentage ?? 0;
  const beveragesTotal   = stats?.totalBeverages    ?? 0;
  const beveragesCovered = stats?.beveragesWithRecipe ?? 0;
  const beveragesMissing = stats?.beveragesWithoutRecipe ?? 0;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ivory">Reportes</h1>
          <p className="text-xs text-muted mt-0.5">
            {loading ? 'Cargando…' : 'Analíticas generales del sistema de recetas'}
          </p>
        </div>
        <button
          type="button" onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors disabled:opacity-40"
        >
          <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 min-w-[140px] p-4 rounded-2xl border border-white/8 bg-surface-3/40 space-y-2 animate-pulse">
              <Sk w="w-20" h="h-2.5" /><Sk w="w-14" h="h-7" />
            </div>
          ))
        ) : (
          <>
            <StatCard label="Total recetas"    value={stats?.totalRecipes ?? 0} />
            <StatCard label="Recetas primarias" value={stats?.primaryRecipes ?? 0}
              color="text-violet-300" bg="border-violet-500/20 bg-violet-500/6" />
            <StatCard label="Variantes"        value={stats?.variantRecipes ?? 0}
              color="text-cyan-300"   bg="border-cyan-500/20   bg-cyan-500/6" />
            <StatCard label="Bebidas"          value={stats?.drinkRecipes ?? 0}
              color="text-gold"       bg="border-gold/20       bg-gold/6" />
            <StatCard label="Comidas"          value={stats?.foodRecipes ?? 0}
              color="text-emerald-300" bg="border-emerald-500/20 bg-emerald-500/6" />
          </>
        )}
      </div>

      {/* ── Fila de gráficos ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Pie — distribución por categoría */}
        <section className="rounded-2xl border border-white/8 bg-surface-3/40 p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-ivory">Distribución por categoría</h3>

          {loading ? (
            <div className="h-56 flex items-center justify-center">
              <Sk w="w-48" h="h-48" />
            </div>
          ) : pieData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-muted">
              Sin datos todavía
            </div>
          ) : (
            <div className="flex gap-6 items-center flex-wrap">
              <div style={{ width: 180, height: 180, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData} cx="50%" cy="50%"
                      innerRadius={48} outerRadius={80}
                      paddingAngle={2} dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltipCustom />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Leyenda */}
              <div className="flex-1 min-w-[140px] space-y-2 max-h-44 overflow-y-auto pr-1">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-[11px] text-ivory capitalize truncate flex-1">{d.name}</span>
                    <span className="text-[11px] font-bold text-muted flex-shrink-0">{d.value}</span>
                    <span className="text-[10px] text-muted/50 flex-shrink-0 w-8 text-right">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Bar — recetas por categoría */}
        <section className="rounded-2xl border border-white/8 bg-surface-3/40 p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-ivory">Recetas por categoría (Top 7)</h3>

          {loading ? (
            <div className="h-48 flex items-end gap-2 pb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-white/8 animate-pulse"
                  style={{ height: `${[80,60,95,45,70,50,35][i]}%` }} />
              ))}
            </div>
          ) : barData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted">
              Sin datos todavía
            </div>
          ) : (
            <div style={{ height: 192, width: '100%' }}>
              <ResponsiveContainer width="100%" height={192}>
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<BarTooltipCustom />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]} fill="#D4AF37" opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* ── Cobertura de bebidas ───────────────────────────────── */}
      <section className="rounded-2xl border border-white/8 bg-surface-3/40 p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-ivory">Cobertura de bebidas</h3>
          <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
            coveragePct >= 80
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : coveragePct >= 50
              ? 'text-amber-400  bg-amber-500/10  border-amber-500/20'
              : 'text-red-400    bg-red-500/10    border-red-500/20'
          }`}>
            {loading ? '…' : `${coveragePct}% cobertura`}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Sk h="h-4" /><div className="grid grid-cols-3 gap-3"><Sk /><Sk /><Sk /></div>
          </div>
        ) : (
          <>
            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-gold to-amber-500"
                  style={{ width: `${Math.min(100, coveragePct)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted/60">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>

            {/* Stats de cobertura */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase tracking-widest font-bold">
                  <GlassWater size={11} />
                  Total bebidas
                </div>
                <p className="text-xl font-bold text-ivory">{beveragesTotal}</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/6 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] uppercase tracking-widest font-bold">
                  <CheckCircle2 size={11} />
                  Con receta
                </div>
                <p className="text-xl font-bold text-emerald-300">{beveragesCovered}</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/6 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] uppercase tracking-widest font-bold">
                  <Circle size={11} />
                  Sin receta
                </div>
                <p className="text-xl font-bold text-amber-300">{beveragesMissing}</p>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Alertas ───────────────────────────────────────────── */}
      {!loading && warnings.length > 0 && (
        <section className="rounded-2xl border border-white/8 bg-surface-3/40 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <h3 className="text-sm font-bold text-ivory">Alertas del sistema ({warnings.length})</h3>
          </div>

          <div className="space-y-2">
            {warnings.map((w) => (
              <div
                key={w.id}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  w.severity === 'high'
                    ? 'bg-red-500/8 border-red-500/20'
                    : w.severity === 'medium'
                    ? 'bg-amber-500/8 border-amber-500/20'
                    : 'bg-white/4 border-white/8'
                }`}
              >
                <AlertTriangle
                  size={13}
                  className={`flex-shrink-0 mt-0.5 ${
                    w.severity === 'high' ? 'text-red-400' : w.severity === 'medium' ? 'text-amber-400' : 'text-muted'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${
                    w.severity === 'high' ? 'text-red-300' : w.severity === 'medium' ? 'text-amber-300' : 'text-muted'
                  }`}>
                    {w.title}
                  </p>
                  <p className="text-[11px] text-muted/70 mt-0.5">{w.description}</p>
                </div>
                {w.count > 0 && (
                  <span className={`text-[11px] font-bold flex-shrink-0 px-2 py-0.5 rounded-lg border ${
                    w.severity === 'high'
                      ? 'text-red-400 bg-red-500/10 border-red-500/20'
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {w.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Tips ──────────────────────────────────────────────── */}
      {!loading && (
        <section className="rounded-2xl border border-gold/15 bg-gold/4 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-gold" />
            <h3 className="text-sm font-bold text-gold">Sugerencias</h3>
          </div>
          <ul className="space-y-1.5">
            {coveragePct < 80 && (
              <li className="flex items-start gap-2 text-xs text-ivory/80">
                <span className="text-gold mt-0.5">•</span>
                Cobertura al {coveragePct}% — aún hay {beveragesMissing} bebidas sin receta asignada.
              </li>
            )}
            {(stats?.variantRecipes ?? 0) < 3 && (
              <li className="flex items-start gap-2 text-xs text-ivory/80">
                <span className="text-gold mt-0.5">•</span>
                Solo tenés {stats?.variantRecipes ?? 0} variantes. Crear más variantes expande las opciones del menú.
              </li>
            )}
            {(stats?.drinkRecipes ?? 0) > 0 && (
              <li className="flex items-start gap-2 text-xs text-ivory/80">
                <span className="text-gold mt-0.5">•</span>
                {stats.drinkRecipes} recetas de bebidas activas. ¡Buen trabajo organizando el bar!
              </li>
            )}
            {(stats?.foodRecipes ?? 0) === 0 && (
              <li className="flex items-start gap-2 text-xs text-ivory/80">
                <span className="text-gold mt-0.5">•</span>
                No hay recetas de comida aún. Podés agregar platos para ampliar el menú.
              </li>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
