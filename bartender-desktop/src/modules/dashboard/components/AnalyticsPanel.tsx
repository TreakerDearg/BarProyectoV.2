/**
 * AnalyticsPanel — Métricas analíticas para modo Advanced.
 * Gráfico de ventas por día + métricas de margen + descuentos.
 * No hardcodea ningún dato: todo viene de dashboardStats.
 */
import { memo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Percent, ReceiptText, Target } from "lucide-react";
import type { DashboardStats } from "../services/dashboardService";

interface Props {
  data:    DashboardStats;
  loading?: boolean;
}

// ── Custom Tooltip ────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-[11px] text-muted mb-2 font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-bold" style={{ color: p.color }}>
          {p.name}: {p.name === "Ventas" ? `$${Number(p.value).toLocaleString("es-AR", { maximumFractionDigits: 0 })}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Metric chip ───────────────────────────────────────────────────

const MetricChip = memo(function MetricChip({
  icon, label, value, sub, colorCls,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; colorCls: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-3/60 border border-white/8">
      <span className={`p-2 rounded-lg flex-shrink-0 ${colorCls}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{label}</p>
        <p className="text-base font-extrabold text-ivory">{value}</p>
        {sub && <p className="text-[10px] text-muted/60">{sub}</p>}
      </div>
    </div>
  );
});

// ── Analytics Panel ───────────────────────────────────────────────

export default function AnalyticsPanel({ data, loading = false }: Props) {
  const salesData   = data.salesData   ?? [];
  const hasSales    = salesData.some((d) => d.total > 0);

  // Métricas derivadas de los datos reales
  const totalSales     = data.totalSales     ?? 0;
  const totalOrders    = data.totalOrders    ?? 0;
  const avgTicket      = data.avgTicket      ?? 0;
  const discounts      = data.discountsGiven ?? 0;
  const profitMargin   = (data as any).profitMargin  ?? null;
  const completionRate = (data as any).completionRate ?? null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/8 bg-surface-3/50 p-5 animate-pulse space-y-4">
        <div className="h-4 w-32 rounded-full bg-white/10" />
        <div className="h-48 rounded-xl bg-white/8" />
        <div className="grid grid-cols-2 gap-3">
          {[0,1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-white/8" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-surface-3/50 p-5 space-y-5">
      <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em]">Análisis de ventas</h3>

      {/* Gráfico de ventas por día */}
      <div>
        {!hasSales ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted gap-2">
            <TrendingUp size={28} className="opacity-25" />
            <p className="text-xs">Sin ventas registradas en el período</p>
          </div>
        ) : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#D4A340" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#D4A340" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => {
                    const d = new Date(v + "T00:00:00");
                    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
                  }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={42}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Ventas"
                  stroke="#D4A340"
                  strokeWidth={2}
                  fill="url(#gradVentas)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#D4A340" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Métricas analíticas derivadas */}
      <div className="grid grid-cols-2 gap-2.5">
        <MetricChip
          icon={<ReceiptText size={14} />}
          label="Promedio cuenta"
          value={avgTicket > 0 ? `$${avgTicket.toFixed(0)}` : "—"}
          sub={totalOrders > 0 ? `${totalOrders} cuenta${totalOrders > 1 ? "s" : ""}` : undefined}
          colorCls="bg-cyan-500/15 text-cyan-400"
        />
        <MetricChip
          icon={<Percent size={14} />}
          label="Descuentos dados"
          value={discounts > 0 ? `$${discounts.toLocaleString("es-AR", { maximumFractionDigits: 0 })}` : "$0"}
          sub={discounts > 0 ? "del total de ventas" : "Sin descuentos"}
          colorCls={discounts > totalSales * 0.15 ? "bg-amber-500/15 text-amber-400" : "bg-white/8 text-muted"}
        />
        {profitMargin != null && (
          <MetricChip
            icon={<TrendingUp size={14} />}
            label="Margen de ganancia"
            value={`${profitMargin.toFixed(1)}%`}
            sub={profitMargin > 40 ? "Excelente" : profitMargin > 25 ? "Bueno" : "Revisar costos"}
            colorCls={profitMargin > 40 ? "bg-emerald-500/15 text-emerald-400" : profitMargin > 25 ? "bg-gold/15 text-gold" : "bg-amber-500/15 text-amber-400"}
          />
        )}
        {completionRate != null && (
          <MetricChip
            icon={<Target size={14} />}
            label="Tasa completadas"
            value={`${completionRate.toFixed(0)}%`}
            sub="pedidos completados"
            colorCls={completionRate > 90 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}
          />
        )}
      </div>
    </div>
  );
}
