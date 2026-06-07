// components/OrdersChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function OrdersChart({ data }: { data: any[] }) {
  return (
    <div className="nebula-panel p-6">
      <h3 className="text-sm font-bold text-ivory mb-4">Pedidos por Hora</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="hour" tick={{ fill: "#a0a0a0", fontSize: 12 }} />
          <YAxis tick={{ fill: "#a0a0a0", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0c0a12",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            itemStyle={{ color: "#e0e0e0" }}
          />
          <Bar dataKey="orders" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}