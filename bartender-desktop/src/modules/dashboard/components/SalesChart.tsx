// components/SalesChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function SalesChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="nebula-panel p-6">
        <h3 className="text-sm font-bold text-ivory mb-4">Ventas</h3>
        <div className="h-[300px] flex items-center justify-center text-muted text-sm">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="nebula-panel p-6">
      <h3 className="text-sm font-bold text-ivory mb-4">Ventas</h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" tick={{ fill: "#a0a0a0", fontSize: 12 }} />
            <YAxis tick={{ fill: "#a0a0a0", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0c0a12",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#e0e0e0" }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#D4A340"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}