/**
 * OverviewStrip — 4 KPIs críticos en tira horizontal.
 * Siempre visible en los 3 modos.
 * Simple: solo valor. Standard: + trend. Advanced: + trend + benchmark.
 *
 * REDISEÑO v3.0 — Slate Elegante
 * Números grandes, color semántico claro, legible sin zoom.
 */
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, CalendarCheck, DollarSign, Clock,
  TrendingUp, TrendingDown,
} from "lucide-react";
import type { DashboardStats } from "../services/dashboardService";
import type { DashboardMode }  from "../store/dashboardUiStore";

interface Props {
  data:     DashboardStats;
  mode:     DashboardMode;
  loading?: boolean;
}

/* ── Configuración de acentos por tipo de KPI ───────────────── */
const ACCENT_CONFIG = {
  gold: {
    border: "border-[#F0B429]/30",
    bg:     "bg-[#F0B429]/8",
    text:   "text-[#F0B429]",
    icon:   "bg-[#F0B429]/15 text-[#F0B429]",
    trend_up:   "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/25",
    trend_down: "bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/25",
  },
  emerald: {
    border: "border-[#3FB950]/30",
    bg:     "bg-[#3FB950]/8",
    text:   "text-[#3FB950]",
    icon:   "bg-[#3FB950]/15 text-[#3FB950]",
    trend_up:   "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/25",
    trend_down: "bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/25",
  },
  blue: {
    border: "border-[#388BFD]/30",
    bg:     "bg-[#388BFD]/8",
    text:   "text-[#388BFD]",
    icon:   "bg-[#388BFD]/15 text-[#388BFD]",
    trend_up:   "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/25",
    trend_down: "bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/25",
  },
  orange: {
    border: "border-[#FF7B54]/30",
    bg:     "bg-[#FF7B54]/8",
    text:   "text-[#FF7B54]",
    icon:   "bg-[#FF7B54]/15 text-[#FF7B54]",
    trend_up:   "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/25",
    trend_down: "bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/25",
  },
} as const;

type AccentKey = keyof typeof ACCENT_CONFIG;

/* ── Skeleton ──────────────────────────────────────────────── */
function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#1C2333] p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#21283A]" />
        <div className="h-3 w-20 rounded-full bg-[#21283A]" />
      </div>
      <div className="h-10 w-24 rounded-xl bg-[#21283A] mb-2" />
      <div className="h-3 w-16 rounded-full bg-[#21283A]" />
    </div>
  );
}

/* ── KPI Card ──────────────────────────────────────────────── */
interface KpiCardProps {
  label:   string;
  value:   string;
  sub?:    string;
  trend?:  number | null;
  icon:    React.ReactNode;
  accent:  AccentKey;
  pulse?:  boolean;
  mode:    DashboardMode;
}

const KpiCard = memo(function KpiCard({
  label, value, sub, trend, icon, accent, pulse, mode,
}: KpiCardProps) {
  const a = ACCENT_CONFIG[accent];
  const showTrend = mode !== "simple" && trend != null && !Number.isNaN(trend);
  const trendUp   = (trend ?? 0) >= 0;

  return (
    <div
      className={`
        rounded-2xl border ${a.border} ${a.bg}
        p-6 flex flex-col gap-1 min-w-0 relative overflow-hidden
        transition-all duration-200 hover:shadow-lg
      `}
    >
      {/* Indicador de actividad */}
      {pulse && (
        <span
          className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${a.text} bg-current`}
          aria-hidden="true"
        >
          <span className="absolute inset-0 rounded-full bg-current animate-ping opacity-50" />
        </span>
      )}

      {/* Ícono + etiqueta */}
      <div className="flex items-center gap-2.5 mb-2">
        <span className={`p-2 rounded-lg ${a.icon} flex-shrink-0`}>
          {icon}
        </span>
        <p className="text-xs font-bold text-[#566270] uppercase tracking-wide truncate">
          {label}
        </p>
      </div>

      {/* Número principal — grande y claro */}
      <p className={`text-4xl font-black tracking-tight leading-none ${a.text}`}>
        {value}
      </p>

      {/* Sub-texto + tendencia */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {sub && (
          <p className="text-xs text-[#566270] truncate">{sub}</p>
        )}
        {showTrend && (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
            trendUp ? a.trend_up : a.trend_down
          }`}>
            {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trendUp ? "+" : ""}{trend}%
          </span>
        )}
      </div>
    </div>
  );
});

/* ── OverviewStrip ─────────────────────────────────────────── */
export default function OverviewStrip({ data, mode, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map((i) => <KpiSkeleton key={i} />)}
      </div>
    );
  }

  const activeOrders = data.activeOrdersCount ?? 0;
  const reservations = data.reservationsToday  ?? 0;
  const totalSales   = data.totalSales          ?? 0;
  const avgTime      = data.avgOrderTimeMin;

  const items: KpiCardProps[] = [
    {
      label:  "Pedidos activos",
      value:  String(activeOrders),
      sub:    activeOrders === 0
              ? "Sin pedidos en curso"
              : activeOrders === 1
              ? "1 pedido en curso"
              : `${activeOrders} en cocina o barra`,
      trend:  data.trends?.ordersPct ?? null,
      icon:   <ShoppingCart size={16} />,
      accent: "emerald",
      pulse:  activeOrders > 0,
      mode,
    },
    {
      label:  "Reservas hoy",
      value:  String(reservations),
      sub:    reservations === 0
              ? "Sin reservas para hoy"
              : `${reservations} confirmada${reservations > 1 ? "s" : ""}`,
      icon:   <CalendarCheck size={16} />,
      accent: "blue",
      mode,
    },
    {
      label:  "Ventas hoy",
      value:  `$${totalSales.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
      sub:    data.todayOrders
              ? `${data.todayOrders} cuenta${data.todayOrders > 1 ? "s" : ""}`
              : "Sin ventas registradas",
      trend:  data.trends?.salesPct ?? null,
      icon:   <DollarSign size={16} />,
      accent: "gold",
      mode,
    },
    {
      label:  "Tiempo espera",
      value:  avgTime != null ? `${avgTime} min` : "—",
      sub:    avgTime == null
              ? "Sin datos suficientes"
              : avgTime <= 10 ? "Excelente"
              : avgTime <= 20 ? "Aceptable"
              : "Revisar personal",
      icon:   <Clock size={16} />,
      accent: avgTime != null && avgTime > 20 ? "orange" : "gold",
      mode,
    },
  ];

  return (
    <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
          >
            <KpiCard {...item} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
