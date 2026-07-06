"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { SalesData } from "../../services/dashboardService";

interface Props {
  data: SalesData[];
}

export default function RevenueStreamChart({ data }: Props) {
  const chartData = (data || []).map(d => ({
    time: d.date ? new Date(d.date).toLocaleDateString("es-ES", { weekday: 'short' }).toUpperCase() : '?',
    sales: d.total || 0
  }));

  // Find peak sales
  const peakSales = chartData.length > 0 ? Math.max(...chartData.map(d => d.sales)) : 0;
  const totalSales = chartData.reduce((sum, d) => sum + d.sales, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSalesGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.3)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              fontWeight={700}
              dy={15}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              fontWeight={700}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0E131B',
                border: '1px solid rgba(255,215,0,0.2)',
                borderRadius: '1.5rem',
                padding: '1.5rem'
              }}
              itemStyle={{
                color: '#FFD700',
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
              cursor={{ stroke: 'rgba(255,215,0,0.3)', strokeWidth: 2 }}
            />
            {/* Peak reference line */}
            {peakSales > 0 && (
              <ReferenceLine
                y={peakSales}
                stroke="#FFD700"
                strokeDasharray="3 3"
                label={{ value: "Pico", position: "top", fill: "#FFD700", fontSize: 11, fontWeight: 700 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#FFD700"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSalesGold)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Total sales summary */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Total del día:</span>
          <span className="text-lg font-bold text-gold">${totalSales.toLocaleString("es-MX")}</span>
        </div>
      </div>
    </div>
  );
}
