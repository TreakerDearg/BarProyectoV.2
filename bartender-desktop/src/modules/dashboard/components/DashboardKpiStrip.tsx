"use client";

/**
 * DashboardKpiStrip — Tira de KPIs adaptativa por tab y modo.
 * Genera los KPIs correctos para cada vista (operación / analytics / inventario).
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DashboardStats }               from "../services/dashboardService";
import type { DashboardMode, DashboardTab }  from "../store/dashboardUiStore";
import KpiSkeleton                           from "./skeletons/KpiSkeleton";
import { AlertTriangle }                     from "lucide-react";

interface KpiItem {
  label:            string;
  value:            string;
  hint?:            string;
  trend?:           { text: string; direction: "up" | "down" | "same" } | null;
  accent?:          "gold" | "emerald" | "blue" | "orange" | "violet";
  comparisonPeriod?: string;
  status?:          "good" | "warning" | "critical";
  onClick?:         () => void;
}

interface Props {
  tab:      DashboardTab;
  data:     DashboardStats;
  mode:     DashboardMode;
  loading?: boolean;
}

/* ── Tokens de color por acento ─────────────────────────────── */
const ACCENT: Record<string, { text: string; border: string; bg: string }> = {
  gold:    { text: "#F0B429", border: "rgba(240,180,41,0.25)",  bg: "rgba(240,180,41,0.08)"  },
  emerald: { text: "#3FB950", border: "rgba(63,185,80,0.25)",   bg: "rgba(63,185,80,0.08)"   },
  blue:    { text: "#388BFD", border: "rgba(56,139,253,0.25)",  bg: "rgba(56,139,253,0.08)"  },
  orange:  { text: "#FF7B54", border: "rgba(255,123,84,0.25)",  bg: "rgba(255,123,84,0.08)"  },
  violet:  { text: "#A371F7", border: "rgba(163,113,247,0.25)", bg: "rgba(163,113,247,0.08)" },
};

/* ── Helpers de estado de operación ─────────────────────────── */
function opStatusText(kL?: number, bL?: number) {
  const load = Math.max(kL ?? 0, bL ?? 0);
  if (load > 80) return "Crítico";
  if (load > 50) return "Ocupado";
  return "Normal";
}
function opStatusAccent(kL?: number, bL?: number): KpiItem["accent"] {
  const load = Math.max(kL ?? 0, bL ?? 0);
  if (load > 80) return "orange";
  if (load > 50) return "gold";
  return "emerald";
}
function opStatusSeverity(kL?: number, bL?: number): KpiItem["status"] {
  const load = Math.max(kL ?? 0, bL ?? 0);
  if (load > 80) return "critical";
  if (load > 50) return "warning";
  return "good";
}

function fmt(pct: number | null | undefined): KpiItem["trend"] {
  if (pct == null || Number.isNaN(pct)) return null;
  if (pct > 0) return { text: `↑ ${pct}%`,          direction: "up"   };
  if (pct < 0) return { text: `↓ ${Math.abs(pct)}%`, direction: "down" };
  return             { text: "= 0%",                 direction: "same" };
}

/* ── Construir KPIs por tab / modo ──────────────────────────── */
function buildKpis(tab: DashboardTab, data: DashboardStats, mode: DashboardMode): KpiItem[] {
  const inv = data.inventory;
  const t   = data.trends;
  const avg = data.avgOrderTimeMin;

  if (tab === "operation") {
    const ao = data.activeOrdersCount ?? 0;
    if (mode === "simple") return [
      {
        label: "Pedidos ahora", value: String(ao),
        hint: "En cocina o barra actualmente",
        comparisonPeriod: "actual", accent: "emerald",
        status: ao > 50 ? "critical" : ao > 30 ? "warning" : "good",
      },
      {
        label: "Estado servicio", value: opStatusText(data.kitchenLoad, data.barLoad),
        hint: "Estado general de operación",
        comparisonPeriod: "tiempo real", accent: opStatusAccent(data.kitchenLoad, data.barLoad),
        status: opStatusSeverity(data.kitchenLoad, data.barLoad),
      },
    ];
    const base: KpiItem[] = [
      {
        label: "Pedidos ahora", value: String(ao),
        hint: "En cocina o barra actualmente",
        trend: fmt(t?.ordersPct), comparisonPeriod: "vs ayer", accent: "emerald",
        status: ao > 50 ? "critical" : ao > 30 ? "warning" : "good",
      },
      {
        label: "Reservas hoy", value: String(data.reservationsToday ?? 0),
        hint: "Reservas confirmadas para hoy",
        comparisonPeriod: "hoy", accent: "violet", status: "good",
      },
      {
        label: "Ventas hoy",
        value: `$${(data.totalSales ?? 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
        hint: "Ventas totales del día",
        trend: fmt(t?.salesPct), comparisonPeriod: "vs ayer", accent: "gold",
        status: (data.totalSales ?? 0) > 30000 ? "good" : "warning",
      },
    ];
    if (mode === "medium") return base;
    return [...base, {
      label: "Tiempo espera",
      value: avg != null ? `${avg} min` : "—",
      hint: "Tiempo promedio de preparación",
      comparisonPeriod: "promedio actual", accent: "blue",
      status: avg != null && avg > 25 ? "critical" : avg != null && avg > 15 ? "warning" : "good",
    }];
  }

  if (tab === "analytics") {
    if (mode === "simple") return [
      {
        label: "Ventas",
        value: `$${(data.totalSales ?? 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
        hint: "Ventas acumuladas en el período",
        comparisonPeriod: "período actual", accent: "gold",
        status: (data.totalSales ?? 0) > 40000 ? "good" : "warning",
      },
      {
        label: "Cuentas", value: String(data.totalOrders ?? 0),
        hint: "Total de cuentas procesadas",
        comparisonPeriod: "período actual", accent: "emerald", status: "good",
      },
    ];
    const base: KpiItem[] = [
      {
        label: "Ventas",
        value: `$${(data.totalSales ?? 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
        hint: "Ventas acumuladas en el período",
        trend: fmt(t?.salesPct), comparisonPeriod: "vs ayer", accent: "gold",
        status: (data.totalSales ?? 0) > 40000 ? "good" : "warning",
      },
      {
        label: "Promedio cuenta",
        value: data.avgTicket != null ? `$${data.avgTicket.toFixed(0)}` : "$0",
        hint: "Valor promedio por cuenta",
        comparisonPeriod: "período actual", accent: "blue",
        status: (data.avgTicket ?? 0) > 150 ? "good" : "warning",
      },
      {
        label: "Cuentas", value: String(data.totalOrders ?? 0),
        hint: "Total de cuentas procesadas",
        trend: fmt(t?.ordersPct), comparisonPeriod: "vs ayer", accent: "emerald", status: "good",
      },
    ];
    if (mode === "medium") return base;
    return [...base, {
      label: "Descuentos dados",
      value: `$${(data.discountsGiven ?? 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
      hint: "Valor total de descuentos",
      comparisonPeriod: "acumulado", accent: "orange",
      status: (data.discountsGiven ?? 0) > 5000 ? "warning" : "good",
    }];
  }

  if (tab === "inventory") {
    const ls = inv?.lowStock  ?? 0;
    const os = inv?.outOfStock ?? 0;
    if (mode === "simple") return [{
      label: "Alertas stock", value: String(ls + os),
      hint: "Productos con stock crítico",
      comparisonPeriod: "actual", accent: "orange",
      status: (ls + os) > 0 ? "critical" : "good",
    }];
    const base: KpiItem[] = [
      {
        label: "Por agotarse", value: String(ls),
        hint: "Stock por debajo del mínimo",
        comparisonPeriod: "actual", accent: "orange",
        status: ls > 20 ? "critical" : ls > 10 ? "warning" : "good",
      },
      {
        label: "Sin stock", value: String(os),
        hint: "Productos sin disponibilidad",
        comparisonPeriod: "actual", accent: "orange",
        status: os > 0 ? "critical" : "good",
      },
    ];
    if (mode === "medium") return base;
    return [...base, {
      label: "Valor inventario",
      value: `$${(inv?.stockValue ?? 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
      hint: "Valor total en stock",
      comparisonPeriod: "actual", accent: "gold", status: "good",
    }];
  }

  return [];
}

/* ── KpiCard ─────────────────────────────────────────────────── */
const KpiCard = memo(function KpiCard({
  label, value, hint, trend, accent = "gold", comparisonPeriod, status, onClick,
}: KpiItem) {
  const a = ACCENT[accent] ?? ACCENT.gold;
  const trendUp   = trend?.direction === "up";
  const trendDown = trend?.direction === "down";

  const statusStyle = {
    good:     { border: "rgba(63,185,80,0.20)",  bg: "rgba(63,185,80,0.08)",  color: "#3FB950" },
    warning:  { border: "rgba(240,180,41,0.20)", bg: "rgba(240,180,41,0.08)", color: "#F0B429" },
    critical: { border: "rgba(248,81,73,0.20)",  bg: "rgba(248,81,73,0.08)",  color: "#F85149" },
  };
  const ss = statusStyle[status ?? "good"];

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 cursor-pointer relative"
      style={{
        background:  a.bg,
        border:      `1px solid ${a.border}`,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Dot de status */}
      {status && status !== "good" && (
        <div
          className="absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse"
          style={{ background: ss.color, boxShadow: `0 0 6px ${ss.color}` }}
        />
      )}

      {/* Label + trend */}
      <div className="flex justify-between items-start gap-2">
        <p className="text-xs font-bold text-[#566270] uppercase tracking-wide">{label}</p>
        {trend && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
            style={{
              color:      trendUp ? "#3FB950" : trendDown ? "#F85149" : "#8B949E",
              background: trendUp ? "rgba(63,185,80,0.12)" : trendDown ? "rgba(248,81,73,0.12)" : "rgba(139,148,158,0.12)",
            }}
          >
            {trend.text}
          </span>
        )}
      </div>

      {/* Valor */}
      <p className="text-3xl font-black tracking-tight mt-2" style={{ color: a.text }}>
        {value}
      </p>

      {/* Descripción */}
      <div className="mt-1.5 space-y-0.5">
        {hint && <p className="text-xs text-[#566270]">{hint}</p>}
        {comparisonPeriod && (
          <p className="text-[10px] text-[#3D444D] font-medium">{comparisonPeriod}</p>
        )}
      </div>

      {/* Aviso de status */}
      {status && status !== "good" && (
        <div
          className="mt-3 pt-2.5 border-t flex items-center gap-1.5 rounded-lg px-2 py-1"
          style={{ borderColor: ss.border, background: ss.bg }}
        >
          <AlertTriangle size={11} style={{ color: ss.color }} />
          <p className="text-[10px] font-semibold" style={{ color: ss.color }}>
            {status === "warning" ? "Requiere atención" : "Acción necesaria"}
          </p>
        </div>
      )}
    </div>
  );
});

/* ── DashboardKpiStrip ───────────────────────────────────────── */
export default function DashboardKpiStrip({ tab, data, mode, loading = false }: Props) {
  if (loading) {
    return (
      <div className={`grid gap-4 ${mode === "simple" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"}`}>
        <KpiSkeleton />
        <KpiSkeleton />
        {mode !== "simple" && <KpiSkeleton />}
      </div>
    );
  }

  const items = buildKpis(tab, data, mode);

  return (
    <motion.div
      layout
      className={`grid gap-4 ${
        items.length === 1 ? "grid-cols-1 max-w-sm" :
        items.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
        items.length === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
                             "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      }`}
    >
      <AnimatePresence mode="popLayout">
        {items.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
          >
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
