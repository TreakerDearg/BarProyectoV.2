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
    <div className="bg-gray-900 p-4 rounded-xl">
      <h3 className="mb-4">Pedidos por Hora</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="orders" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}