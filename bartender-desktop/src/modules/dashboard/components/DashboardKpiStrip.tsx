"use client";

import { memo } from "react";
import type { DashboardStats } from "../services/dashboardService";
import type { DashboardMode, DashboardTab } from "../store/dashboardUiStore";
import KpiSkeleton from "./skeletons/KpiSkeleton";

interface KpiItem {
  label: string;
  value: string;
  hint?: string;
  trend?: number | null;
  accent?: "gold" | "emerald" | "cyan" | "ember" | "violet";
  comparisonPeriod?: string;
  status?: "good" | "warning" | "critical";
}

interface Props {
  tab: DashboardTab;
  data: DashboardStats;
  mode: DashboardMode;
  loading?: boolean;
}

const accentClasses: Record<string, string> = {
  gold: "text-gold border-gold/25 bg-gold/8",
  emerald: "text-emerald-400 border-emerald-400/25 bg-emerald-400/8",
  cyan: "text-cyan-400 border-cyan-400/25 bg-cyan-400/8",
  ember: "text-ember border-ember/25 bg-ember/8",
  violet: "text-violet-300 border-violet-400/25 bg-violet-400/8",
};

function formatTrend(pct: number | null | undefined): string | null {
  if (pct == null || Number.isNaN(pct)) return null;
  if (pct > 0) return `+${pct}%`;
  if (pct < 0) return `${pct}%`;
  return "0%";
}

function buildKpis(tab: DashboardTab, data: DashboardStats): KpiItem[] {
  const inv = data.inventory;
  const t = data.trends;
  const avgMin = data.avgOrderTimeMin;

  switch (tab) {
    case "service":
      const activeOrders = data.activeOrdersCount ?? 0;
      return [
        {
          label: "Órdenes activas",
          value: String(activeOrders),
          hint: "Órdenes en cocina o barra actualmente",
          trend: t?.ordersPct,
          comparisonPeriod: "vs ayer",
          accent: "emerald",
          status: activeOrders > 30 ? "warning" : activeOrders > 50 ? "critical" : "good",
        },
        {
          label: "Reservas hoy",
          value: String(data.reservationsToday ?? 0),
          hint: "Reservas confirmadas para hoy",
          comparisonPeriod: "hoy",
          accent: "violet",
          status: "good",
        },
        {
          label: "Ingresos del periodo",
          value: `$${(data.totalSales ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
          hint: "Ventas totales en el periodo seleccionado",
          trend: t?.salesPct,
          comparisonPeriod: "vs periodo anterior",
          accent: "gold",
          status: (data.totalSales ?? 0) > 30000 ? "good" : "warning",
        },
        {
          label: "Tiempo prom. orden",
          value: avgMin != null ? `${avgMin} min` : "—",
          hint: "Tiempo promedio para completar pedidos",
          comparisonPeriod: "promedio actual",
          accent: "cyan",
          status: avgMin != null && avgMin > 15 ? "warning" : avgMin != null && avgMin > 25 ? "critical" : "good",
        },
      ];
    case "analytics":
      return [
        {
          label: "Ventas totales",
          value: `$${(data.totalSales ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
          hint: "Ventas acumuladas en el periodo",
          trend: t?.salesPct,
          comparisonPeriod: "vs periodo anterior",
          accent: "gold",
          status: (data.totalSales ?? 0) > 40000 ? "good" : "warning",
        },
        {
          label: "Ticket promedio",
          value: `$${(data.avgTicket ?? 0).toFixed(2)}`,
          hint: "Valor promedio por orden",
          trend: t?.ticketPct,
          comparisonPeriod: "vs periodo anterior",
          accent: "cyan",
          status: (data.avgTicket ?? 0) > 150 ? "good" : "warning",
        },
        {
          label: "Órdenes",
          value: String(data.totalOrders ?? 0),
          hint: "Total de órdenes procesadas",
          trend: t?.ordersPct,
          comparisonPeriod: "vs periodo anterior",
          accent: "emerald",
          status: "good",
        },
      ];
    case "sales":
      return [
        {
          label: "Ingresos",
          value: `$${(data.totalSales ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
          hint: "Ventas brutas del periodo",
          trend: t?.salesPct,
          comparisonPeriod: "vs periodo anterior",
          accent: "gold",
          status: (data.totalSales ?? 0) > 30000 ? "good" : "warning",
        },
        {
          label: "Descuentos aplicados",
          value: `$${(data.discountsGiven ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
          hint: "Valor total de descuentos otorgados",
          comparisonPeriod: "acumulado",
          accent: "ember",
          status: (data.discountsGiven ?? 0) > 5000 ? "warning" : "good",
        },
        {
          label: "Giros de ruleta",
          value: String(data.rouletteSpins?.total ?? 0),
          hint: `${data.rouletteSpins?.accepted ?? 0} aceptados de ${data.rouletteSpins?.total ?? 0}`,
          comparisonPeriod: "acumulado",
          accent: "violet",
          status: "good",
        },
      ];
    case "inventory":
      const lowStock = inv?.lowStock ?? 0;
      const outOfStock = inv?.outOfStock ?? 0;
      return [
        {
          label: "Stock bajo",
          value: String(lowStock),
          hint: "Productos con stock por agotarse",
          comparisonPeriod: "actual",
          accent: "ember",
          status: lowStock > 10 ? "warning" : lowStock > 20 ? "critical" : "good",
        },
        {
          label: "Agotados",
          value: String(outOfStock),
          hint: "Productos sin stock disponible",
          comparisonPeriod: "actual",
          accent: "ember",
          status: outOfStock > 0 ? "critical" : "good",
        },
        {
          label: "Valor en bodega",
          value: `$${(inv?.stockValue ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
          hint: "Valor total del inventario",
          comparisonPeriod: "actual",
          accent: "gold",
          status: "good",
        },
      ];
    default:
      return [];
  }
}

export default function DashboardKpiStrip({ tab, data, mode, loading = false }: Props) {
  if (loading) {
    return (
      <div
        data-tutorial="kpi-strip"
        className={`grid gap-4 ${
          mode === "simple"
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
        }`}
      >
        <KpiSkeleton />
        <KpiSkeleton />
        {mode !== "simple" && <KpiSkeleton />}
      </div>
    );
  }

  const items = buildKpis(tab, data);
  // Reduce visible KPIs from all to 2 by default for better layout
  const visible = mode === "simple" ? items.slice(0, 2) : items.slice(0, 2);

  return (
    <div
      data-tutorial="kpi-strip"
      className={`grid gap-4 ${
        visible.length <= 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      }`}
    >
      {visible.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}

const KpiCard = memo(function KpiCard({ label, value, hint, trend, accent = "gold", comparisonPeriod, status }: KpiItem) {
  const theme = accentClasses[accent] ?? accentClasses.gold;
  const trendLabel = formatTrend(trend);
  const trendUp = trend != null && trend > 0;
  const trendDown = trend != null && trend < 0;

  const statusClasses = {
    good: "bg-emerald-400/10 border-emerald-400/30",
    warning: "bg-gold/10 border-gold/30",
    critical: "bg-red/10 border-red/30",
  };

  const statusDot = {
    good: "bg-emerald-400",
    warning: "bg-gold",
    critical: "bg-red",
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all hover:border-white/15 ${theme.split(" ").slice(1).join(" ")} border relative`}
    >
      {/* Status indicator */}
      {status && status !== "good" && (
        <div className="absolute top-4 right-4">
          <div className={`w-2 h-2 rounded-full ${statusDot[status]} animate-pulse`} />
        </div>
      )}

      <div className="flex justify-between items-start gap-2">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">
          {label}
        </p>
        {trendLabel && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              trendUp
                ? "text-emerald-400 bg-emerald-400/10"
                : trendDown
                  ? "text-red bg-red/10"
                  : "text-muted bg-white/5"
            }`}
          >
            {trendLabel}
          </span>
        )}
      </div>
      <p
        className={`text-3xl font-bold tracking-tight mt-2 ${theme.split(" ")[0]}`}
      >
        {value}
      </p>
      <div className="mt-2 space-y-1">
        {hint && <p className="text-xs text-muted">{hint}</p>}
        {comparisonPeriod && (
          <p className="text-[10px] text-muted/70">
            {comparisonPeriod}
          </p>
        )}
      </div>
      {/* Status bar */}
      {status && status !== "good" && (
        <div className={`mt-3 pt-3 border-t ${statusClasses[status]} border rounded-lg px-2 py-1`}>
          <p className="text-[10px] font-semibold">
            {status === "warning" ? "⚠ Requiere atención" : "⚠ Acción necesaria"}
          </p>
        </div>
      )}
    </div>
  );
});
