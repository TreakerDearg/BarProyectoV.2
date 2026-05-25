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

  return (
    <div
      className={`grid gap-6 animate-fade-in-up-fusion ${
        isSimple ? "grid-cols-1" : "grid-cols-12"
      }`}
    >
      <div className={isSimple ? "space-y-6" : "col-span-12 lg:col-span-8 space-y-6"}>
        <div className="nebula-panel p-6 md:p-8" data-tutorial="revenue-chart">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-ivory">Ingresos</h3>
              <p className="text-xs text-muted mt-0.5">
                Evolución de ventas en el periodo seleccionado
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
              <div className="nebula-panel p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gold/10 text-gold">
                    <Flame size={22} />
                  </div>
                  <h3 className="text-base font-bold text-ivory">
                    Bebidas más vendidas
                  </h3>
                </div>
                <TopPerformanceBars
                  items={data?.topDrinks || []}
                  color="text-gold"
                  bgBar="bg-grad-gold shadow-gold-glow"
                />
              </div>
              <div className="nebula-panel p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-emerald-400/10 text-emerald-400">
                    <Target size={22} />
                  </div>
                  <h3 className="text-base font-bold text-ivory">
                    Comida más vendida
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
          <div className="nebula-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor size={18} className="text-violet-300" />
              <h3 className="text-sm font-bold text-ivory">Estado del servicio</h3>
            </div>
            <ServiceHealth data={data} />
          </div>
          <div className="nebula-panel p-6 border-red/15 bg-red/[0.03]">
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
    <div className={compact ? "" : "nebula-panel p-6"}>
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
