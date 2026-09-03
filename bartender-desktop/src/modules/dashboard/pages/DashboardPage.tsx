"use client";

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw, Wifi, WifiOff, Box, Layers, Activity,
  LayoutGrid, BarChart2, PackageSearch, Clock, Plus,
  GlassWater, CalendarPlus,
} from "lucide-react";

// ── Hooks y stores ────────────────────────────────────────────────
import { useDashboard }       from "../hooks/useDashboard";
import { useDashboardUiStore, type DashboardMode, type DashboardView } from "../store/dashboardUiStore";

// ── Componentes propios ───────────────────────────────────────────
import OverviewStrip      from "../components/OverviewStrip";
import QuickStatusPanel   from "../components/QuickStatusPanel";
import TopProductsGrid    from "../components/TopProductsGrid";
import ServiceSummaryRow  from "../components/ServiceSummaryRow";
import AnalyticsPanel     from "../components/AnalyticsPanel";
import DashboardAlertsBanner from "../components/DashboardAlertsBanner";

// ── Componentes existentes reutilizados ───────────────────────────
import ActiveStaffPanel   from "../components/ActiveStaffPanel";
import InventoryAlerts    from "../components/alerts/InventoryAlerts";
import LiveActivity       from "../components/alerts/LiveActivity";
import RevenueStreamChart from "../components/charts/RevenueStreamChart";
import ServiceHealth      from "../components/health/ServiceHealth";
import DashboardPricingPanel from "../components/DashboardPricingPanel";
import { useDashboardStore }  from "../store/dashboardStore";

import "../../../styles/nebula-theme.css";

// ── Mode Toggle ───────────────────────────────────────────────────

const MODES: { value: DashboardMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "simple",   label: "Simple",   icon: <Box     size={13} />, desc: "Solo lo crítico" },
  { value: "medium",   label: "Estándar", icon: <Layers  size={13} />, desc: "Vista operativa" },
  { value: "advanced", label: "Avanzado", icon: <Activity size={13} />, desc: "Analytics completo" },
];

function ModeToggle({ mode, onChange }: { mode: DashboardMode; onChange: (m: DashboardMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-xl p-1">
      {MODES.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.desc}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            mode === opt.value
              ? "bg-gold/20 text-gold border border-gold/30"
              : "text-muted hover:text-ivory"
          }`}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── View Toggle ───────────────────────────────────────────────────

const VIEWS: { value: DashboardView; label: string; icon: React.ReactNode }[] = [
  { value: "operation",  label: "Operación",  icon: <LayoutGrid   size={14} /> },
  { value: "analytics",  label: "Análisis",   icon: <BarChart2    size={14} /> },
  { value: "inventory",  label: "Inventario", icon: <PackageSearch size={14} /> },
];

function ViewTabs({ view, onChange }: { view: DashboardView; onChange: (v: DashboardView) => void }) {
  return (
    <div className="flex items-center gap-1 bg-white/4 border border-white/8 rounded-xl p-1">
      {VIEWS.map((v) => (
        <button
          key={v.value}
          type="button"
          onClick={() => onChange(v.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            view === v.value
              ? "bg-surface-2 text-ivory border border-white/10"
              : "text-muted hover:text-ivory"
          }`}
        >
          {v.icon}
          <span className="hidden md:inline">{v.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Range Selector ────────────────────────────────────────────────

function RangeSelector({ range, onChange }: { range: string; onChange: (r: string) => void }) {
  return (
    <select
      value={range}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-ivory outline-none focus:border-gold/40 cursor-pointer"
    >
      <option value="1">Hoy</option>
      <option value="7">7 días</option>
      <option value="30">30 días</option>
      <option value="90">90 días</option>
    </select>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────

function QuickActions({ navigate }: { navigate: (path: string) => void }) {
  const actions = [
    { label: "Nuevo pedido",  icon: <Plus        size={14} />, path: "/orders",       cls: "bg-violet-500/10 border-violet-500/20 text-violet-300 hover:bg-violet-500/15"  },
    { label: "Nueva reserva", icon: <CalendarPlus size={14} />, path: "/reservations", cls: "bg-gold/10 border-gold/20 text-gold hover:bg-gold/15"                          },
    { label: "Ver carta",     icon: <GlassWater  size={14} />, path: "/products",     cls: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/15"           },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((a) => (
        <button
          key={a.path}
          type="button"
          onClick={() => navigate(a.path)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${a.cls}`}
        >
          {a.icon}
          <span className="hidden lg:inline">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── DashboardPage ─────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState("7");

  const { mode, view, setMode, setView } = useDashboardUiStore();
  const { data, loading, error, lastSync, socketConnected, reload } = useDashboard(view, range);
  const liveActivities = useDashboardStore((s) => s.liveActivities);

  const handleRefresh = useCallback(() => {
    reload({ forceRefresh: true });
  }, [reload]);

  const handleRangeChange = useCallback((r: string) => {
    setRange(r);
  }, []);

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full min-h-0 gap-4 overflow-hidden relative nebula-dashboard-root">
      {/* Aurora */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-40">
        <div className="nebula-aurora" />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-gold/25 to-amber-500/15 border border-gold/20 shadow-[0_0_20px_rgba(212,163,64,0.15)]">
            <Activity className="text-gold" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ivory">
              Centro de operaciones
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {socketConnected
                ? <Wifi size={10} className="text-emerald-400" />
                : <WifiOff size={10} className="text-red-400" />
              }
              <p className="text-[10px] text-muted">
                {lastSync
                  ? `Actualizado ${new Date(lastSync).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
                  : "Sincronizando…"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <QuickActions navigate={navigate} />

          <ViewTabs    view={view}    onChange={setView}   />
          <ModeToggle  mode={mode}    onChange={setMode}   />

          {mode !== "simple" && (
            <RangeSelector range={range} onChange={handleRangeChange} />
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            title="Actualizar datos"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors disabled:opacity-40"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </header>

      {/* ── ERROR GLOBAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center gap-1 text-red-400 hover:text-red-200 font-semibold text-xs"
              >
                <RefreshCcw size={12} /> Reintentar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ALERTAS BANNER ──────────────────────────────────────── */}
      <div className="flex-shrink-0">
        <DashboardAlertsBanner />
      </div>

      {/* ── CONTENT — scrollable ────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-0.5 pb-4 space-y-4">

        {/* ── OVERVIEW STRIP — siempre visible ─────────────────── */}
        <OverviewStrip data={data ?? ({} as any)} mode={mode} loading={loading && !data} />

        {/* ── VISTA: OPERACIÓN ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {view === "operation" && (
            <motion.div
              key="operation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {/* MODO SIMPLE ─────────────────────────────────────── */}
              {mode === "simple" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <QuickStatusPanel data={data ?? ({} as any)} loading={loading && !data} />
                  <div className="rounded-2xl border border-white/8 bg-surface-3/50 p-5">
                    <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-4">Actividad reciente</h3>
                    <LiveActivity
                      activities={liveActivities}
                      reservations={data?.recentReservations ?? []}
                    />
                  </div>
                </div>
              )}

              {/* MODO STANDARD ───────────────────────────────────── */}
              {mode === "medium" && (
                <>
                  {/* Fila de resumen de servicio */}
                  <ServiceSummaryRow data={data ?? ({} as any)} loading={loading && !data} />

                  {/* Gráfico + lateral */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Gráfico ventas */}
                    <div className="lg:col-span-8 rounded-2xl border border-white/8 bg-surface-3/50 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em]">
                          Ventas del período
                        </h3>
                        {data?.trends?.salesPct != null && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            data.trends.salesPct >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                          }`}>
                            {data.trends.salesPct >= 0 ? "+" : ""}{data.trends.salesPct}% vs período anterior
                          </span>
                        )}
                      </div>
                      {loading && !data ? (
                        <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
                      ) : (data?.salesData?.some((d) => d.total > 0)) ? (
                        <div className="h-48">
                          <RevenueStreamChart data={data!.salesData} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-48 text-muted text-xs">
                          Sin ventas registradas en el período seleccionado
                        </div>
                      )}
                    </div>

                    {/* Sidebar: personal + alertas */}
                    <div className="lg:col-span-4 space-y-4">
                      <ActiveStaffPanel />
                      <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-5">
                        <h3 className="text-xs font-black text-red uppercase tracking-[0.2em] mb-3">Alertas stock</h3>
                        <InventoryAlerts
                          lowStock={data?.inventory?.lowStock  ?? 0}
                          outOfStock={data?.inventory?.outOfStock ?? 0}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top productos */}
                  <TopProductsGrid
                    topDrinks={data?.topDrinks ?? []}
                    topFoods={data?.topFoods   ?? []}
                    loading={loading && !data}
                  />
                </>
              )}

              {/* MODO ADVANCED ───────────────────────────────────── */}
              {mode === "advanced" && (
                <>
                  {/* Fila de resumen */}
                  <ServiceSummaryRow data={data ?? ({} as any)} loading={loading && !data} />

                  {/* Grid principal 3 columnas */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    {/* Analytics + Top productos — 8 cols */}
                    <div className="xl:col-span-8 space-y-4">
                      <AnalyticsPanel data={data ?? ({} as any)} loading={loading && !data} />
                      <TopProductsGrid
                        topDrinks={data?.topDrinks ?? []}
                        topFoods={data?.topFoods   ?? []}
                        loading={loading && !data}
                      />
                    </div>

                    {/* Sidebar — 4 cols */}
                    <div className="xl:col-span-4 space-y-4">
                      {/* Pricing */}
                      <DashboardPricingPanel />

                      {/* Personal */}
                      <ActiveStaffPanel />

                      {/* Estado del servicio */}
                      <div className="rounded-2xl border border-white/8 bg-surface-3/50 p-5">
                        <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-3">Estado del servicio</h3>
                        <ServiceHealth data={data ?? ({} as any)} />
                      </div>

                      {/* Actividad reciente */}
                      <div className="rounded-2xl border border-white/8 bg-surface-3/50 p-5">
                        <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-3">Actividad reciente</h3>
                        <LiveActivity
                          activities={liveActivities}
                          reservations={data?.recentReservations ?? []}
                        />
                      </div>

                      {/* Alertas stock */}
                      <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-5">
                        <h3 className="text-xs font-black text-red uppercase tracking-[0.2em] mb-3">Alertas inventario</h3>
                        <InventoryAlerts
                          lowStock={data?.inventory?.lowStock  ?? 0}
                          outOfStock={data?.inventory?.outOfStock ?? 0}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── VISTA: ANALYTICS ─────────────────────────────────── */}
          {view === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {/* Siempre renderiza el view real de analytics */}
              <div className={`grid gap-4 ${mode === "advanced" ? "grid-cols-1 xl:grid-cols-12" : "grid-cols-1"}`}>
                <div className={mode === "advanced" ? "xl:col-span-8" : ""}>
                  <AnalyticsPanel data={data ?? ({} as any)} loading={loading && !data} />
                </div>
                {mode !== "simple" && (
                  <div className={mode === "advanced" ? "xl:col-span-4 space-y-4" : "mt-0"}>
                    <TopProductsGrid
                      topDrinks={data?.topDrinks ?? []}
                      topFoods={data?.topFoods   ?? []}
                      loading={loading && !data}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── VISTA: INVENTARIO ────────────────────────────────── */}
          {view === "inventory" && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {/* KPIs de inventario */}
              <div className={`grid gap-4 ${mode === "simple" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
                {[
                  {
                    label: "Stock crítico",
                    value: String((data?.inventory?.lowStock ?? 0) + (data?.inventory?.outOfStock ?? 0)),
                    sub:   "productos con alertas",
                    color: (data?.inventory?.outOfStock ?? 0) > 0 ? "text-red-400" : (data?.inventory?.lowStock ?? 0) > 0 ? "text-amber-400" : "text-emerald-400",
                    border:"border-red-500/20",
                  },
                  {
                    label: "Sin stock",
                    value: String(data?.inventory?.outOfStock ?? 0),
                    sub:   "requieren reposición urgente",
                    color: "text-red-400",
                    border:"border-red-500/20",
                  },
                  ...(mode !== "simple" ? [{
                    label: "Stock bajo",
                    value: String(data?.inventory?.lowStock ?? 0),
                    sub:   "por agotarse pronto",
                    color: "text-amber-400",
                    border:"border-amber-500/20",
                  }] : []),
                  ...(mode === "advanced" ? [{
                    label: "Valor inventario",
                    value: `$${(data?.inventory?.stockValue ?? 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
                    sub:   "valor total en stock",
                    color: "text-gold",
                    border:"border-gold/20",
                  }] : []),
                ].map((k) => (
                  <div key={k.label} className={`rounded-2xl border ${k.border} bg-surface-3/50 p-5`}>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{k.label}</p>
                    <p className={`text-3xl font-extrabold ${k.color}`}>{k.value}</p>
                    <p className="text-[11px] text-muted/60 mt-1">{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Productos críticos */}
              {loading && !data ? (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {[0,1,2].map((i) => (
                    <div key={i} className="rounded-2xl border border-white/8 bg-surface-3/50 p-5 animate-pulse">
                      <div className="h-4 w-24 rounded-full bg-white/10 mb-3" />
                      <div className="h-7 w-16 rounded-xl bg-white/15" />
                    </div>
                  ))}
                </div>
              ) : (data?.inventory?.criticalItems ?? []).length > 0 ? (
                <div>
                  <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-3">
                    Productos que requieren reposición
                  </h3>
                  <div className={`grid gap-3 ${mode === "simple" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"}`}>
                    {(data!.inventory!.criticalItems!).slice(0, mode === "simple" ? 4 : mode === "medium" ? 6 : 12).map((item: any) => (
                      <div key={item._id} className="rounded-2xl border border-red-500/20 bg-red-500/6 p-4">
                        <p className="text-[9px] font-black text-red-400/70 uppercase tracking-widest mb-1.5">Reponer</p>
                        <p className="text-sm font-bold text-ivory truncate">{item.name}</p>
                        <p className="text-2xl font-extrabold text-red-400 mt-1.5">
                          {item.stock}<span className="text-sm font-normal text-muted ml-1">{item.unit ?? "uds"}</span>
                        </p>
                        {mode !== "simple" && item.minStock != null && (
                          <p className="text-[10px] text-muted/60 mt-1">mínimo: {item.minStock}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/6 px-6 py-10 text-center">
                  <p className="text-emerald-400 font-bold text-sm">Inventario estable</p>
                  <p className="text-xs text-muted mt-1">No hay productos con alertas críticas en este momento</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
