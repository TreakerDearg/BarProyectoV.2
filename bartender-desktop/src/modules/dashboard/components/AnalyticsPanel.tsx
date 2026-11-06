/**
 * AnalyticsPanel — Métricas analíticas para modo Advanced.
 * Gráfico de ventas por día + métricas de margen + descuentos.
 * No hardcodea ningún dato: todo viene de dashboardStats.
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import { memo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Percent, ReceiptText, Target } from "lucide-react";
import type { DashboardStats } from "../services/dashboardService";

interface Props {
  data:     DashboardStats;
  loading?: boolean;
}

/* ── Custom Tooltip ──────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#293042] border border-[#3D444D] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-[#8B949E] mb-2 font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-bold" style={{ color: p.color }}>
          {p.name}: {p.name === "Ventas"
            ? `$${Number(p.value).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

/* ── Metric chip ─────────────────────────────────────────────── */
const MetricChip = memo(function MetricChip({
  icon, label, value, sub, colorCls,
}: {
  icon:     React.ReactNode;
  label:    string;
  value:    string;
  sub?:     string;
  colorCls: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#21283A] border border-[#30363D]">
      <span className={`p-2 rounded-lg flex-shrink-0 ${colorCls}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-[#566270] uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-[#E6EDF3] mt-0.5">{value}</p>
        {sub && <p className="text-xs text-[#566270] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
});

/* ── Analytics Panel ─────────────────────────────────────────── */
export default function AnalyticsPanel({ data, loading = false }: Props) {
  const salesData = data.salesData ?? [];
  const hasSales  = salesData.some((d) => d.total > 0);

  const totalSales     = data.totalSales     ?? 0;
  const totalOrders    = data.totalOrders    ?? 0;
  const avgTicket      = data.avgTicket      ?? 0;
  const discounts      = data.discountsGiven ?? 0;
  const profitMargin   = (data as any).profitMargin  ?? null;
  const completionRate = (data as any).completionRate ?? null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-6 animate-pulse space-y-4">
        <div className="h-4 w-32 rounded-full bg-[#21283A]" />
        <div className="h-48 rounded-xl bg-[#21283A]" />
        <div className="grid grid-cols-2 gap-3">
          {[0,1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-[#21283A]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-6 space-y-5">
      <h3 className="text-xs font-black text-[#566270] uppercase tracking-[0.18em]">
        Análisis de ventas
      </h3>

      {/* Gráfico */}
      <div>
        {!hasSales ? (
          <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
            <TrendingUp size={28} className="text-[#30363D]" />
            <p className="text-sm text-[#566270]">Sin ventas registradas en el período</p>
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradVentasSlate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F0B429" stopOpacity={0.30} />
                    <stop offset="95%" stopColor="#F0B429" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.8)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#566270", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => {
                    const d = new Date(v + "T00:00:00");
                    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
                  }}
                />
                <YAxis
                  tick={{ fill: "#566270", fontSize: 11 }}
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
                  stroke="#F0B429"
                  strokeWidth={2.5}
                  fill="url(#gradVentasSlate)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#F0B429" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3">
        <MetricChip
          icon={<ReceiptText size={15} />}
          label="Promedio cuenta"
          value={avgTicket > 0 ? `$${avgTicket.toFixed(0)}` : "—"}
          sub={totalOrders > 0 ? `${totalOrders} cuenta${totalOrders > 1 ? "s" : ""}` : undefined}
          colorCls="bg-[#388BFD]/15 text-[#388BFD]"
        />
        <MetricChip
          icon={<Percent size={15} />}
          label="Descuentos dados"
          value={discounts > 0
            ? `$${discounts.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
            : "$0"}
          sub={discounts > 0 ? "del total de ventas" : "Sin descuentos"}
          colorCls={discounts > totalSales * 0.15
            ? "bg-[#FF7B54]/15 text-[#FF7B54]"
            : "bg-[#30363D] text-[#8B949E]"}
        />
        {profitMargin != null && (
          <MetricChip
            icon={<TrendingUp size={15} />}
            label="Margen de ganancia"
            value={`${profitMargin.toFixed(1)}%`}
            sub={profitMargin > 40 ? "Excelente" : profitMargin > 25 ? "Bueno" : "Revisar costos"}
            colorCls={
              profitMargin > 40 ? "bg-[#3FB950]/15 text-[#3FB950]" :
              profitMargin > 25 ? "bg-[#F0B429]/15 text-[#F0B429]" :
                                  "bg-[#FF7B54]/15 text-[#FF7B54]"
            }
          />
        )}
        {completionRate != null && (
          <MetricChip
            icon={<Target size={15} />}
            label="Tasa completadas"
            value={`${completionRate.toFixed(0)}%`}
            sub="pedidos completados"
            colorCls={completionRate > 90
              ? "bg-[#3FB950]/15 text-[#3FB950]"
              : "bg-[#FF7B54]/15 text-[#FF7B54]"}
          />
        )}
      </div>
    </div>
  );
}
