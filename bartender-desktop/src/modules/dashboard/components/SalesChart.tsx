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
      <div className="bg-gray-900 p-4 rounded-xl">
        <h3 className="mb-4">Ventas</h3>
        <div className="h-[300px] flex items-center justify-center text-muted text-sm">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <h3 className="mb-4">Ventas</h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#fbbf24"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}