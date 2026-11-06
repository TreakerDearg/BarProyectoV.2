"use client";

/**
 * RevenueStreamChart — Gráfico de área de ventas por período.
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import type { SalesData } from "../../services/dashboardService";
import { TrendingUp } from "lucide-react";

interface Props {
  data: SalesData[];
}

/* ── Tooltip personalizado ─────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#293042] border border-[#3D444D] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-[#8B949E] mb-1.5 font-semibold">{label}</p>
      <p className="text-sm font-bold text-[#F0B429]">
        ${Number(payload[0]?.value ?? 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
};

export default function RevenueStreamChart({ data }: Props) {
  const chartData = Array.isArray(data) && data.length > 0
    ? data.map((d) => ({
        time:  d.date
          ? new Date(d.date).toLocaleDateString("es-AR", { weekday: "short" }).toUpperCase()
          : "?",
        sales: d.total || 0,
      }))
    : [];

  const peakSales  = chartData.length > 0 ? Math.max(...chartData.map((d) => d.sales)) : 0;
  const totalSales = chartData.reduce((sum, d) => sum + d.sales, 0);

  /* Sin datos */
  if (chartData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-14 h-14 rounded-full bg-[#21283A] flex items-center justify-center border border-[#30363D]">
          <TrendingUp size={28} className="text-[#30363D]" />
        </div>
        <p className="text-sm font-semibold text-[#566270]">Sin datos de ventas</p>
        <p className="text-xs text-[#3D444D] text-center max-w-xs">
          El gráfico se actualizará cuando haya ventas registradas en el período.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ minHeight: 200 }}>
      {/* Gráfico */}
      <div className="flex-1" style={{ minHeight: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 16, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSalesSlate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F0B429" stopOpacity={0.30} />
                <stop offset="95%" stopColor="#F0B429" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.8)" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#30363D"
              tick={{ fill: "#566270", fontSize: 11, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              stroke="#30363D"
              tick={{ fill: "#566270", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              width={40}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(240,180,41,0.3)", strokeWidth: 1.5 }} />

            {/* Línea de pico */}
            {peakSales > 0 && (
              <ReferenceLine
                y={peakSales}
                stroke="rgba(240,180,41,0.35)"
                strokeDasharray="4 4"
                label={{
                  value:    "Pico",
                  position: "right",
                  fill:     "#F0B429",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="sales"
              stroke="#F0B429"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gradSalesSlate)"
              dot={false}
              activeDot={{ r: 5, fill: "#F0B429", stroke: "#293042", strokeWidth: 2 }}
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-[#30363D] flex items-center justify-between">
        <span className="text-xs text-[#566270]">Total del período:</span>
        <span className="text-lg font-bold text-[#F0B429]">
          ${totalSales.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}
