"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { SalesData } from "../../services/dashboardService";

interface Props {
  data: SalesData[];
}

export default function RevenueStreamChart({ data }: Props) {
  const chartData = (data || []).map(d => ({
    time: d.date ? new Date(d.date).toLocaleDateString("es-ES", { weekday: 'short' }).toUpperCase() : '?',
    sales: d.total || 0
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSalesGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A340" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D4A340" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              fontWeight={900}
              dy={15}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              fontWeight={900}
              tickFormatter={(val) => `$${val}`} 
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#0E131B', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '1.5rem',
                padding: '1.5rem'
              }}
              itemStyle={{ 
                color: '#D4A340', 
                fontSize: '12px', 
                fontWeight: 900,
                textTransform: 'uppercase'
              }}
              cursor={{ stroke: 'rgba(212,163,64,0.2)', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#D4A340"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorSalesGold)"
              animationDuration={2000}
              shadow="0 0 20px rgba(212,163,64,0.3)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
