"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ==============================
   TIPOS
============================== */
export interface TopDrinkData {
  name: string;
  value: number;
}

interface TopDrinksChartProps {
  data: TopDrinkData[];
}

/* ==============================
   COLORES NEON
============================== */
const COLORS = [
  "#7c3aed", // Neon Purple
  "#22d3ee", // Neon Cyan
  "#f472b6", // Neon Pink
  "#facc15", // Neon Yellow
  "#4ade80", // Neon Green
];

/* ==============================
   COMPONENTE
============================== */
export default function TopDrinksChart({
  data,
}: TopDrinksChartProps) {
  return (
    <div className="card h-[320px] p-4">
      <h2 className="mb-4 neon-text">Top Bebidas</h2>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-zinc-400">
          No hay datos disponibles
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              innerRadius={50}
              paddingAngle={3}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #7c3aed",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => [
                `${value} ventas`,
                "Cantidad",
              ]}
            />

            <Legend
              wrapperStyle={{
                color: "#d4d4d8",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}