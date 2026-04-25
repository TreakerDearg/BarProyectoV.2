import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { SalesData } from "../../services/dashboardService";

interface Props {
  data: SalesData[];
}

export default function RevenueStreamChart({ data }: Props) {
  // Map data to match chart expectation, providing nice labels
  const chartData = data.map(d => ({
    time: new Date(d.date).toLocaleDateString("en-US", { weekday: 'short' }),
    sales: d.total
  })).reverse(); // Assuming backend sends descending, we want chronological left to right

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Revenue Stream</h3>
          <p className="text-xs text-gray-400">Weekly breakdown of sales performance</p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs px-3 py-1 bg-obsidian border border-obsidian/80 rounded text-gray-400 hover:text-white transition">Classic</button>
          <button className="text-xs px-3 py-1 bg-bar-gold/20 border border-bar-gold/30 rounded text-bar-gold">Premium</button>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A340" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4A340" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#08090C', borderColor: '#1F2937', borderRadius: '8px' }}
              itemStyle={{ color: '#D4A340' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#D4A340"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
