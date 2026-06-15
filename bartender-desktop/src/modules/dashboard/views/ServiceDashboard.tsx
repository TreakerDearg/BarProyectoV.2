"use client";

import type { DashboardStats } from "../services/dashboardService";
import type { DashboardMode } from "../store/dashboardUiStore";
import {
  useDashboardStore,
  type LiveActivityItem,
} from "../store/dashboardStore";
import RevenueStreamChart from "../components/charts/RevenueStreamChart";
import TopPerformanceBars from "../components/performance/TopPerformanceBars";
import ServiceHealth from "../components/health/ServiceHealth";
import InventoryAlerts from "../components/alerts/InventoryAlerts";
import LiveActivity from "../components/alerts/LiveActivity";
import DashboardPricingPanel from "../components/DashboardPricingPanel";
import CollapsibleSection from "../components/CollapsibleSection";
import {
  Activity,
  Target,
  Flame,
  ShieldAlert,
  ArrowRight,
  Monitor,
} from "lucide-react";

interface Props {
  data: DashboardStats;
  mode: DashboardMode;
  onViewActivityLog?: () => void;
}

export default function ServiceDashboard({
  data,
  mode,
  onViewActivityLog,
}: Props) {
  const isSimple = mode === "simple";
  const liveActivities = useDashboardStore((s) => s.liveActivities);

  // Calculate executive summary
  const getOperationStatus = () => {
    const kitchenLoad = data.kitchenLoad || 0;
    const barLoad = data.barLoad || 0;

    if (kitchenLoad > 80 || barLoad > 80) {
      return { status: "Pico de demanda", color: "text-red", bg: "bg-red/10", border: "border-red/20" };
    } else if (kitchenLoad > 50 || barLoad > 50) {
      return { status: "Operación activa", color: "text-gold", bg: "bg-gold/10", border: "border-gold/20" };
    } else {
      return { status: "Operación normal", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" };
    }
  };

  const operationStatus = getOperationStatus();

  return (
    <div
      className={`grid gap-6 dashboard-animate-fade-in-up ${
        isSimple ? "grid-cols-1" : "grid-cols-12"
      }`}
    >
      {/* Executive Summary - Only in advanced mode */}
      {!isSimple && (
        <div className="col-span-12 dashboard-panel p-6 bg-violet-500/5 border-violet-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${operationStatus.bg} ${operationStatus.border}`}>
                <Activity size={24} className={operationStatus.color} />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Estado actual</p>
                <p className={`text-lg font-bold ${operationStatus.color}`}>{operationStatus.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-xs text-muted mb-1">Órdenes activas</p>
                <p className="text-2xl font-bold text-ivory">{data.activeOrdersCount || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted mb-1">Tiempo promedio</p>
                <p className="text-2xl font-bold text-ivory">{data.avgOrderTimeMin ? `${data.avgOrderTimeMin} min` : "—"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted mb-1">Reservas hoy</p>
                <p className="text-2xl font-bold text-ivory">{data.reservationsToday || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={isSimple ? "space-y-6" : "col-span-12 lg:col-span-8 space-y-6"}>
        <div className="dashboard-panel p-6 md:p-8" data-tutorial="revenue-chart">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-ivory">Ingresos diarios - Últimos 7 días</h3>
              <p className="text-xs text-muted mt-0.5">
                Evolución de ventas con tendencia
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En vivo
            </span>
          </div>
          <div className={isSimple ? "h-[260px]" : "h-[320px]"}>
            <RevenueStreamChart data={data.salesData} />
          </div>
          {data.salesData && data.salesData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Total del periodo:</span>
                <span className="text-lg font-bold text-gold">
                  ${data.salesData.reduce((sum, item) => sum + (item.total || 0), 0).toLocaleString("es-MX")}
                </span>
              </div>
              {data.trends?.salesPct && (
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-muted">vs periodo anterior:</span>
                  <span className={`font-semibold ${data.trends.salesPct > 0 ? "text-emerald-400" : "text-red"}`}>
                    {data.trends.salesPct > 0 ? "+" : ""}{data.trends.salesPct}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {isSimple ? (
          <CollapsibleSection
            title="Más detalles de operación"
            subtitle="Bebidas, comida, precios y estado del servicio"
            mode="simple"
          >
            <OperationDetails
              data={data}
              activities={liveActivities}
              onViewActivityLog={onViewActivityLog}
            />
          </CollapsibleSection>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="dashboard-panel p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gold/10 text-gold">
                    <Flame size={22} />
                  </div>
                  <h3 className="text-base font-bold text-ivory">
                    Top 5 Bebidas
                  </h3>
                </div>
                <TopPerformanceBars
                  items={data?.topDrinks || []}
                  color="text-gold"
                  bgBar="bg-grad-gold shadow-gold-glow"
                />
              </div>
              <div className="dashboard-panel p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-emerald-400/10 text-emerald-400">
                    <Target size={22} />
                  </div>
                  <h3 className="text-base font-bold text-ivory">
                    Top 5 Comidas
                  </h3>
                </div>
                <TopPerformanceBars
                  items={data?.topFoods || []}
                  color="text-emerald-400"
                  bgBar="bg-emerald-400 shadow-emerald-400/20"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {!isSimple && (
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <DashboardPricingPanel />
          <div className="dashboard-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor size={18} className="text-violet-300" />
              <h3 className="text-sm font-bold text-ivory">Estado del servicio</h3>
            </div>
            <ServiceHealth data={data} />
          </div>
          <div className="dashboard-panel p-6 border-red/15 bg-red/[0.03]">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert size={18} className="text-red" />
              <h3 className="text-sm font-bold text-red">Alertas de inventario</h3>
            </div>
            <InventoryAlerts
              lowStock={data?.inventory?.lowStock || 0}
              outOfStock={data?.inventory?.outOfStock || 0}
            />
          </div>
          <ActivityPanel
            data={data}
            activities={liveActivities}
            onViewActivityLog={onViewActivityLog}
          />
        </div>
      )}

      {isSimple && (
        <CollapsibleSection
          title="Salud del servicio e inventario"
          subtitle="Cocina, barra y alertas"
          mode="simple"
        >
          <div className="space-y-6">
            <ServiceHealth data={data} />
            <InventoryAlerts
              lowStock={data?.inventory?.lowStock || 0}
              outOfStock={data?.inventory?.outOfStock || 0}
            />
            <ActivityPanel
              data={data}
              activities={liveActivities}
              onViewActivityLog={onViewActivityLog}
              compact
            />
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

function OperationDetails({
  data,
  activities,
  onViewActivityLog,
}: {
  data: DashboardStats;
  activities: LiveActivityItem[];
  onViewActivityLog?: () => void;
}) {
  return (
    <div className="space-y-6">
      <DashboardPricingPanel />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted mb-3 font-semibold">Bebidas</p>
          <TopPerformanceBars
            items={data?.topDrinks || []}
            color="text-gold"
            bgBar="bg-grad-gold"
          />
        </div>
        <div>
          <p className="text-xs text-muted mb-3 font-semibold">Comida</p>
          <TopPerformanceBars
            items={data?.topFoods || []}
            color="text-emerald-400"
            bgBar="bg-emerald-400"
          />
        </div>
      </div>
      <ServiceHealth data={data} />
      <ActivityPanel
        data={data}
        activities={activities}
        onViewActivityLog={onViewActivityLog}
        compact
      />
    </div>
  );
}

function ActivityPanel({
  data,
  activities,
  onViewActivityLog,
  compact,
}: {
  data: DashboardStats;
  activities: LiveActivityItem[];
  onViewActivityLog?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "dashboard-panel p-6"}>
      <div className="flex items-center gap-3 mb-4">
        <Activity size={18} className="text-violet-300" />
        <h3 className="text-sm font-bold text-ivory">Actividad reciente</h3>
      </div>
      <LiveActivity
        activities={activities}
        reservations={data.recentReservations}
      />
      {onViewActivityLog && (
        <button
          type="button"
          onClick={onViewActivityLog}
          className="w-full mt-4 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:border-violet-400/30 transition-all text-xs font-semibold text-muted hover:text-violet-200"
        >
          Ver registro completo
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
