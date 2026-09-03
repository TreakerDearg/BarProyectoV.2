/**
 * OverviewStrip — 4 KPIs críticos en tira horizontal.
 * Siempre visible en los 3 modos.
 * Simple: solo valor. Standard: + trend. Advanced: + trend + benchmark.
 */
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, CalendarCheck, DollarSign, Clock, TrendingUp, TrendingDown,
} from "lucide-react";
import type { DashboardStats } from "../services/dashboardService";
import type { DashboardMode } from "../store/dashboardUiStore";

interface Props {
  data: DashboardStats;
  mode: DashboardMode;
  loading?: boolean;
}

// ── Skeleton ──────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-5 animate-pulse">
      <div className="h-3 w-20 rounded-full bg-white/10 mb-3" />
      <div className="h-8 w-24 rounded-xl bg-white/15 mb-2" />
      <div className="h-2.5 w-16 rounded-full bg-white/8" />
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────

interface KpiCardProps {
  label:   string;
  value:   string;
  sub?:    string;
  trend?:  number | null;
  icon:    React.ReactNode;
  accent:  "gold" | "emerald" | "violet" | "cyan" | "amber";
  pulse?:  boolean;
  mode:    DashboardMode;
}

const ACCENT = {
  gold:    { border: "border-gold/25",    bg: "bg-gold/8",    text: "text-gold",    icon: "bg-gold/15 text-gold"          },
  emerald: { border: "border-emerald-500/25", bg: "bg-emerald-500/8", text: "text-emerald-400", icon: "bg-emerald-500/15 text-emerald-400" },
  violet:  { border: "border-violet-500/25", bg: "bg-violet-500/8",  text: "text-violet-300",  icon: "bg-violet-500/15 text-violet-300"   },
  cyan:    { border: "border-cyan-500/25",    bg: "bg-cyan-500/8",    text: "text-cyan-400",    icon: "bg-cyan-500/15 text-cyan-400"       },
  amber:   { border: "border-amber-500/25",   bg: "bg-amber-500/8",   text: "text-amber-400",   icon: "bg-amber-500/15 text-amber-400"     },
};

const KpiCard = memo(function KpiCard({ label, value, sub, trend, icon, accent, pulse, mode }: KpiCardProps) {
  const a = ACCENT[accent];
  const showTrend = mode !== "simple" && trend != null && !Number.isNaN(trend);
  const trendUp   = (trend ?? 0) >= 0;

  return (
    <div className={`rounded-2xl border ${a.border} ${a.bg} p-5 flex flex-col gap-1 min-w-0 relative overflow-hidden`}>
      {/* pulse dot */}
      {pulse && (
        <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${a.text} bg-current animate-pulse`} aria-hidden="true" />
      )}

      {/* Icon + label */}
      <div className="flex items-center gap-2 mb-1">
        <span className={`p-1.5 rounded-lg ${a.icon} flex-shrink-0`}>{icon}</span>
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest truncate">{label}</p>
      </div>

      {/* Value */}
      <p className={`text-3xl font-extrabold tracking-tight leading-none ${a.text}`}>{value}</p>

      {/* Sub + trend row */}
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        {sub && <p className="text-[11px] text-muted/70 truncate">{sub}</p>}
        {showTrend && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            trendUp ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          }`}>
            {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trendUp ? "+" : ""}{trend}%
          </span>
        )}
      </div>
    </div>
  );
});

// ── OverviewStrip ─────────────────────────────────────────────────

export default function OverviewStrip({ data, mode, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0,1,2,3].map((i) => <KpiSkeleton key={i} />)}
      </div>
    );
  }

  const activeOrders  = data.activeOrdersCount ?? 0;
  const reservations  = data.reservationsToday  ?? 0;
  const totalSales    = data.totalSales          ?? 0;
  const avgTime       = data.avgOrderTimeMin;

  const items: KpiCardProps[] = [
    {
      label:  "Pedidos activos",
      value:  String(activeOrders),
      sub:    activeOrders === 0 ? "Sin pedidos en curso" : activeOrders === 1 ? "1 pedido en curso" : `${activeOrders} en cocina o barra`,
      trend:  data.trends?.ordersPct ?? null,
      icon:   <ShoppingCart size={14} />,
      accent: "emerald",
      pulse:  activeOrders > 0,
      mode,
    },
    {
      label:  "Reservas hoy",
      value:  String(reservations),
      sub:    reservations === 0 ? "Sin reservas para hoy" : `${reservations} confirmada${reservations > 1 ? "s" : ""}`,
      icon:   <CalendarCheck size={14} />,
      accent: "violet",
      mode,
    },
    {
      label:  "Ventas hoy",
      value:  `$${totalSales.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
      sub:    data.todayOrders ? `${data.todayOrders} cuenta${data.todayOrders > 1 ? "s" : ""}` : "Sin ventas registradas",
      trend:  data.trends?.salesPct ?? null,
      icon:   <DollarSign size={14} />,
      accent: "gold",
      mode,
    },
    {
      label:  "Tiempo espera",
      value:  avgTime != null ? `${avgTime} min` : "—",
      sub:    avgTime == null ? "Sin datos suficientes" : avgTime <= 10 ? "Excelente" : avgTime <= 20 ? "Aceptable" : "Revisar personal",
      icon:   <Clock size={14} />,
      accent: avgTime != null && avgTime > 20 ? "amber" : "cyan",
      mode,
    },
  ];

  return (
    <motion.div
      layout
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <KpiCard {...item} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
