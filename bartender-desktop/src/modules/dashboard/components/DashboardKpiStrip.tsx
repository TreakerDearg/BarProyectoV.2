"use client";

import type { DashboardStats } from "../services/dashboardService";
import type { DashboardMode, DashboardTab } from "../store/dashboardUiStore";

interface KpiItem {
  label: string;
  value: string;
  hint?: string;
  trend?: number | null;
  accent?: "gold" | "emerald" | "cyan" | "ember" | "violet";
}

interface Props {
  tab: DashboardTab;
  data: DashboardStats;
  mode: DashboardMode;
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
      return [
        {
          label: "Órdenes activas",
          value: String(data.activeOrdersCount ?? 0),
          hint: "En cocina o barra",
          trend: t?.ordersPct,
          accent: "emerald",
        },
        {
          label: "Reservas hoy",
          value: String(data.reservationsToday ?? 0),
          accent: "violet",
        },
        {
          label: "Ingresos del periodo",
          value: `$${(data.totalSales ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
          trend: t?.salesPct,
          accent: "gold",
        },
        {
          label: "Tiempo prom. orden",
          value:
            avgMin != null ? `${avgMin} min` : "—",
          hint: "Pedidos completados",
          accent: "cyan",
        },
      ];
    case "analytics":
      return [
        {
          label: "Ventas totales",
          value: `$${(data.totalSales ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
          trend: t?.salesPct,
          accent: "gold",
        },
        {
          label: "Ticket promedio",
          value: `$${(data.avgTicket ?? 0).toFixed(2)}`,
          trend: t?.ticketPct,
          accent: "cyan",
        },
        {
          label: "Órdenes",
          value: String(data.totalOrders ?? 0),
          trend: t?.ordersPct,
          accent: "emerald",
        },
      ];
    case "sales":
      return [
        {
          label: "Ingresos",
          value: `$${(data.totalSales ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
          trend: t?.salesPct,
          accent: "gold",
        },
        {
          label: "Descuentos aplicados",
          value: `$${(data.discountsGiven ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
          accent: "ember",
        },
        {
          label: "Giros de ruleta",
          value: String(data.rouletteSpins?.total ?? 0),
          hint: `${data.rouletteSpins?.accepted ?? 0} aceptados`,
          accent: "violet",
        },
      ];
    case "inventory":
      return [
        {
          label: "Stock bajo",
          value: String(inv?.lowStock ?? 0),
          accent: "ember",
        },
        {
          label: "Agotados",
          value: String(inv?.outOfStock ?? 0),
          accent: "ember",
        },
        {
          label: "Valor en bodega",
          value: `$${(inv?.stockValue ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
          accent: "gold",
        },
      ];
    default:
      return [];
  }
}

export default function DashboardKpiStrip({ tab, data, mode }: Props) {
  const items = buildKpis(tab, data);
  const visible = mode === "simple" ? items.slice(0, 2) : items;

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

function KpiCard({ label, value, hint, trend, accent = "gold" }: KpiItem) {
  const theme = accentClasses[accent] ?? accentClasses.gold;
  const trendLabel = formatTrend(trend);
  const trendUp = trend != null && trend > 0;
  const trendDown = trend != null && trend < 0;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all hover:border-white/15 ${theme.split(" ").slice(1).join(" ")} border`}
    >
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
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}
