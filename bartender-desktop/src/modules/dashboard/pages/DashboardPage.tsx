"use client";

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw, Wifi, WifiOff, Box, Layers, Activity,
  LayoutGrid, BarChart2, PackageSearch,
  Plus, GlassWater, CalendarPlus,
} from "lucide-react";

// ── Hooks y stores (sin cambios) ───────────────────────────────
import { useDashboard }       from "../hooks/useDashboard";
import { useDashboardUiStore, type DashboardMode, type DashboardView } from "../store/dashboardUiStore";

// ── Componentes propios ────────────────────────────────────────
import OverviewStrip         from "../components/OverviewStrip";
import QuickStatusPanel      from "../components/QuickStatusPanel";
import TopProductsGrid       from "../components/TopProductsGrid";
import ServiceSummaryRow     from "../components/ServiceSummaryRow";
import AnalyticsPanel        from "../components/AnalyticsPanel";
import DashboardAlertsBanner from "../components/DashboardAlertsBanner";
import ActiveStaffPanel      from "../components/ActiveStaffPanel";
import InventoryAlerts       from "../components/alerts/InventoryAlerts";
import LiveActivity          from "../components/alerts/LiveActivity";
import RevenueStreamChart    from "../components/charts/RevenueStreamChart";
import ServiceHealth         from "../components/health/ServiceHealth";
import DashboardPricingPanel from "../components/DashboardPricingPanel";
import { useDashboardStore } from "../store/dashboardStore";

import "../../../styles/nebula-theme.css";

/* ─────────────────────────────────────────────────────────────────
   MODE TOGGLE
   Selector de complejidad: Simple / Estándar / Avanzado
───────────────────────────────────────────────────────────────── */

const MODES: { value: DashboardMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "simple",   label: "Simple",   icon: <Box     size={15} />, desc: "Solo lo crítico" },
  { value: "medium",   label: "Estándar", icon: <Layers  size={15} />, desc: "Vista operativa" },
  { value: "advanced", label: "Avanzado", icon: <Activity size={15} />, desc: "Analytics completo" },
];

function ModeToggle({ mode, onChange }: { mode: DashboardMode; onChange: (m: DashboardMode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-[#1C2333] border border-[#30363D] rounded-xl p-1">
      {MODES.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.desc}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold
            transition-all duration-200
            ${mode === opt.value
              ? "bg-[#F0B429]/20 text-[#F0B429] border border-[#F0B429]/30 shadow-[0_0_10px_rgba(240,180,41,0.1)]"
              : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-white/5 border border-transparent"
            }
          `}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   VIEW TABS
   Selector de vista: Operación / Análisis / Inventario
───────────────────────────────────────────────────────────────── */

const VIEWS: { value: DashboardView; label: string; icon: React.ReactNode }[] = [
  { value: "operation",  label: "Operación",  icon: <LayoutGrid    size={15} /> },
  { value: "analytics",  label: "Análisis",   icon: <BarChart2     size={15} /> },
  { value: "inventory",  label: "Inventario", icon: <PackageSearch size={15} /> },
];

function ViewTabs({ view, onChange }: { view: DashboardView; onChange: (v: DashboardView) => void }) {
  return (
    <div className="flex items-center gap-1 bg-[#161B22] border border-[#30363D] rounded-xl p-1">
      {VIEWS.map((v) => (
        <button
          key={v.value}
          type="button"
          onClick={() => onChange(v.value)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold
            transition-all duration-200
            ${view === v.value
              ? "bg-[#21283A] text-[#E6EDF3] border border-[#3D444D] shadow-sm"
              : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-white/4 border border-transparent"
            }
          `}
        >
          {v.icon}
          <span>{v.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   RANGE SELECTOR
───────────────────────────────────────────────────────────────── */

function RangeSelector({ range, onChange }: { range: string; onChange: (r: string) => void }) {
  return (
    <select
      value={range}
      onChange={(e) => onChange(e.target.value)}
      className="select-dark h-10"
      style={{ colorScheme: "dark" }}
    >
      <option value="1">Hoy</option>
      <option value="7">7 días</option>
      <option value="30">30 días</option>
      <option value="90">90 días</option>
    </select>
  );
}

/* ─────────────────────────────────────────────────────────────────
   QUICK ACTIONS
   Accesos directos a las acciones más frecuentes
───────────────────────────────────────────────────────────────── */

function QuickActions({ navigate }: { navigate: (path: string) => void }) {
  const actions = [
    {
      label: "Nuevo pedido",
      icon:  <Plus         size={15} />,
      path:  "/orders",
      cls:   "bg-[#3FB950]/10 border-[#3FB950]/25 text-[#3FB950] hover:bg-[#3FB950]/18",
    },
    {
      label: "Nueva reserva",
      icon:  <CalendarPlus size={15} />,
      path:  "/reservations",
      cls:   "bg-[#F0B429]/10 border-[#F0B429]/25 text-[#F0B429] hover:bg-[#F0B429]/18",
    },
    {
      label: "Ver carta",
      icon:  <GlassWater   size={15} />,
      path:  "/products",
      cls:   "bg-[#388BFD]/10 border-[#388BFD]/25 text-[#388BFD] hover:bg-[#388BFD]/18",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {actions.map((a) => (
        <button
          key={a.path}
          type="button"
          onClick={() => navigate(a.path)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${a.cls}`}
        >
          {a.icon}
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD PAGE — componente principal
───────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState("7");

  /* Stores y hooks (sin cambios) */
  const { mode, view, setMode, setView } = useDashboardUiStore();
  const { data, loading, error, lastSync, socketConnected, reload } = useDashboard(view, range);
  const liveActivities = useDashboardStore((s) => s.liveActivities);

  const handleRefresh = useCallback(() => { reload({ forceRefresh: true }); }, [reload]);
  const handleRangeChange = useCallback((r: string) => { setRange(r); }, []);

  return (
    <div className="flex flex-col h-full min-h-0 gap-4 overflow-hidden nebula-dashboard-root">

      {/* ── HEADER DEL DASHBOARD ─────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">

        {/* Título + sync */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#F0B429]/15 border border-[#F0B429]/25 shadow-[0_0_20px_rgba(240,180,41,0.12)]">
            <Activity className="text-[#F0B429]" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#E6EDF3] tracking-tight">
              Centro de operaciones
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {socketConnected
                ? <Wifi size={11} className="text-[#3FB950]" />
                : <WifiOff size={11} className="text-[#F85149]" />
              }
              <p className="text-xs text-[#566270]">
                {lastSync
                  ? `Actualizado ${new Date(lastSync).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
                  : "Sincronizando…"}
              </p>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center gap-2">
          <QuickActions navigate={navigate} />

          <ViewTabs   view={view} onChange={setView}  />
          <ModeToggle mode={mode} onChange={setMode}  />

          {mode !== "simple" && (
            <RangeSelector range={range} onChange={handleRangeChange} />
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            title="Actualizar datos"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#30363D] text-sm text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors disabled:opacity-40"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
            <span>Actualizar</span>
          </button>
        </div>
      </header>

      {/* ── ERROR GLOBAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="px-4 py-3 rounded-xl bg-[#F85149]/12 border border-[#F85149]/30 text-[#FF6B63] text-sm flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center gap-1.5 text-[#F85149] hover:text-[#FF6B63] font-semibold text-sm"
              >
                <RefreshCcw size={13} /> Reintentar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BANNER DE ALERTAS ────────────────────────────────── */}
      <div className="flex-shrink-0">
        <DashboardAlertsBanner />
      </div>

      {/* ── CONTENIDO SCROLLABLE ─────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 pb-4 space-y-4"
           style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}>

        {/* ── OVERVIEW STRIP — siempre visible ─────────────── */}
        <OverviewStrip data={data ?? ({} as any)} mode={mode} loading={loading && !data} />

        {/* ── VISTAS ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* ── VISTA: OPERACIÓN ───────────────────────────── */}
          {view === "operation" && (
            <motion.div
              key="operation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {/* MODO SIMPLE */}
              {mode === "simple" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <QuickStatusPanel data={data ?? ({} as any)} loading={loading && !data} />
                  <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-5">
                    <h3 className="text-xs font-black text-[#566270] uppercase tracking-[0.18em] mb-4">
                      Actividad reciente
                    </h3>
                    <LiveActivity
                      activities={liveActivities}
                      reservations={data?.recentReservations ?? []}
                    />
                  </div>
                </div>
              )}

              {/* MODO STANDARD */}
              {mode === "medium" && (
                <>
                  <ServiceSummaryRow data={data ?? ({} as any)} loading={loading && !data} />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Gráfico ventas */}
                    <div className="lg:col-span-8 rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-[#566270] uppercase tracking-[0.18em]">
                          Ventas del período
                        </h3>
                        {data?.trends?.salesPct != null && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            data.trends.salesPct >= 0
                              ? "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/25"
                              : "bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/25"
                          }`}>
                            {data.trends.salesPct >= 0 ? "+" : ""}{data.trends.salesPct}% vs período anterior
                          </span>
                        )}
                      </div>
                      {loading && !data ? (
                        <div className="h-48 bg-[#21283A] rounded-xl animate-pulse" />
                      ) : data?.salesData?.some((d) => d.total > 0) ? (
                        <div className="h-48">
                          <RevenueStreamChart data={data!.salesData} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-48 text-[#566270] text-sm">
                          Sin ventas registradas en el período seleccionado
                        </div>
                      )}
                    </div>

                    {/* Sidebar: personal + alertas */}
                    <div className="lg:col-span-4 space-y-4">
                      <ActiveStaffPanel />
                      <div className="rounded-2xl border border-[#F85149]/20 bg-[#F85149]/6 p-5">
                        <h3 className="text-xs font-black text-[#F85149] uppercase tracking-[0.18em] mb-3">
                          Alertas stock
                        </h3>
                        <InventoryAlerts
                          lowStock={data?.inventory?.lowStock  ?? 0}
                          outOfStock={data?.inventory?.outOfStock ?? 0}
                        />
                      </div>
                    </div>
                  </div>

                  <TopProductsGrid
                    topDrinks={data?.topDrinks ?? []}
                    topFoods={data?.topFoods   ?? []}
                    loading={loading && !data}
                  />
                </>
              )}

              {/* MODO ADVANCED */}
              {mode === "advanced" && (
                <>
                  <ServiceSummaryRow data={data ?? ({} as any)} loading={loading && !data} />

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    <div className="xl:col-span-8 space-y-4">
                      <AnalyticsPanel data={data ?? ({} as any)} loading={loading && !data} />
                      <TopProductsGrid
                        topDrinks={data?.topDrinks ?? []}
                        topFoods={data?.topFoods   ?? []}
                        loading={loading && !data}
                      />
                    </div>

                    <div className="xl:col-span-4 space-y-4">
                      <DashboardPricingPanel />
                      <ActiveStaffPanel />
                      <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-5">
                        <h3 className="text-xs font-black text-[#566270] uppercase tracking-[0.18em] mb-3">
                          Estado del servicio
                        </h3>
                        <ServiceHealth data={data ?? ({} as any)} />
                      </div>
                      <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-5">
                        <h3 className="text-xs font-black text-[#566270] uppercase tracking-[0.18em] mb-3">
                          Actividad reciente
                        </h3>
                        <LiveActivity
                          activities={liveActivities}
                          reservations={data?.recentReservations ?? []}
                        />
                      </div>
                      <div className="rounded-2xl border border-[#F85149]/20 bg-[#F85149]/6 p-5">
                        <h3 className="text-xs font-black text-[#F85149] uppercase tracking-[0.18em] mb-3">
                          Alertas inventario
                        </h3>
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

          {/* ── VISTA: ANALYTICS ───────────────────────────── */}
          {view === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <div className={`grid gap-4 ${mode === "advanced" ? "grid-cols-1 xl:grid-cols-12" : "grid-cols-1"}`}>
                <div className={mode === "advanced" ? "xl:col-span-8" : ""}>
                  <AnalyticsPanel data={data ?? ({} as any)} loading={loading && !data} />
                </div>
                {mode !== "simple" && (
                  <div className={mode === "advanced" ? "xl:col-span-4" : "mt-0"}>
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

          {/* ── VISTA: INVENTARIO ──────────────────────────── */}
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
                    label:  "Stock crítico",
                    value:  String((data?.inventory?.lowStock ?? 0) + (data?.inventory?.outOfStock ?? 0)),
                    sub:    "productos con alertas",
                    color:  (data?.inventory?.outOfStock ?? 0) > 0 ? "text-[#F85149]"
                            : (data?.inventory?.lowStock ?? 0) > 0 ? "text-[#FF7B54]"
                            : "text-[#3FB950]",
                    border: (data?.inventory?.outOfStock ?? 0) > 0 ? "border-[#F85149]/25"
                            : (data?.inventory?.lowStock ?? 0) > 0 ? "border-[#FF7B54]/25"
                            : "border-[#3FB950]/25",
                    bg:     (data?.inventory?.outOfStock ?? 0) > 0 ? "bg-[#F85149]/6"
                            : (data?.inventory?.lowStock ?? 0) > 0 ? "bg-[#FF7B54]/6"
                            : "bg-[#3FB950]/6",
                  },
                  {
                    label: "Sin stock",
                    value: String(data?.inventory?.outOfStock ?? 0),
                    sub:   "requieren reposición urgente",
                    color: "text-[#F85149]", border: "border-[#F85149]/25", bg: "bg-[#F85149]/6",
                  },
                  ...(mode !== "simple" ? [{
                    label: "Stock bajo",
                    value: String(data?.inventory?.lowStock ?? 0),
                    sub:   "por agotarse pronto",
                    color: "text-[#FF7B54]", border: "border-[#FF7B54]/25", bg: "bg-[#FF7B54]/6",
                  }] : []),
                  ...(mode === "advanced" ? [{
                    label: "Valor inventario",
                    value: `$${(data?.inventory?.stockValue ?? 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
                    sub:   "valor total en stock",
                    color: "text-[#F0B429]", border: "border-[#F0B429]/25", bg: "bg-[#F0B429]/6",
                  }] : []),
                ].map((k) => (
                  <div key={k.label} className={`rounded-2xl border ${k.border} ${k.bg} p-6`}>
                    <p className="text-xs font-bold text-[#566270] uppercase tracking-wide mb-2">{k.label}</p>
                    <p className={`text-4xl font-black ${k.color}`}>{k.value}</p>
                    <p className="text-xs text-[#566270] mt-1.5">{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Productos críticos */}
              {loading && !data ? (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {[0,1,2].map((i) => (
                    <div key={i} className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-5 animate-pulse">
                      <div className="h-4 w-24 rounded-full bg-[#21283A] mb-3" />
                      <div className="h-8 w-16 rounded-xl bg-[#21283A]" />
                    </div>
                  ))}
                </div>
              ) : (data?.inventory?.criticalItems ?? []).length > 0 ? (
                <div>
                  <h3 className="text-xs font-black text-[#566270] uppercase tracking-[0.18em] mb-3">
                    Productos que requieren reposición
                  </h3>
                  <div className={`grid gap-3 ${mode === "simple" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"}`}>
                    {(data!.inventory!.criticalItems!).slice(0, mode === "simple" ? 4 : mode === "medium" ? 6 : 12).map((item: any) => (
                      <div key={item._id} className="rounded-2xl border border-[#F85149]/25 bg-[#F85149]/8 p-5">
                        <p className="text-[10px] font-black text-[#F85149]/70 uppercase tracking-widest mb-2">
                          Reponer
                        </p>
                        <p className="text-sm font-bold text-[#E6EDF3] truncate">{item.name}</p>
                        <p className="text-3xl font-black text-[#F85149] mt-2">
                          {item.stock}
                          <span className="text-sm font-normal text-[#566270] ml-1.5">{item.unit ?? "uds"}</span>
                        </p>
                        {mode !== "simple" && item.minStock != null && (
                          <p className="text-xs text-[#566270] mt-1">mínimo: {item.minStock}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#3FB950]/25 bg-[#3FB950]/6 px-6 py-10 text-center">
                  <p className="text-[#3FB950] font-bold text-sm">Inventario estable</p>
                  <p className="text-xs text-[#566270] mt-1">No hay productos con alertas críticas en este momento</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
