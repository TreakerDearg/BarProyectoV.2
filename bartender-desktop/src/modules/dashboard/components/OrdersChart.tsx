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
    <div className="nebula-panel p-6 min-w-0">
      <h3 className="text-sm font-bold text-ivory mb-4">Pedidos por Hora</h3>

      <div className="w-full min-w-0" style={{ height: 300, minHeight: 250 }}>
        <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={250}>
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
    </div>
  );
}