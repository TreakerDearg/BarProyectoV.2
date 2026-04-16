"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ==============================
   TIPOS
============================== */
export interface SalesData {
  name: string; // Día o fecha (ej: "Lun", "Mar", "01/04")
  total: number;
}

interface SalesChartProps {
  data: SalesData[];
}

/* ==============================
   COMPONENTE
============================== */
export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="card h-[320px] p-4">
      <h2 className="mb-4 neon-text">Ventas Semanales</h2>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          {/* Cuadrícula */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.1)"
          />

          {/* Ejes */}
          <XAxis
            dataKey="name"
            stroke="#a1a1aa"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
          />
          <YAxis
            stroke="#a1a1aa"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #7c3aed",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value: number) => [`$${value}`, "Ventas"]}
          />

          {/* Línea */}
          <Line
            type="monotone"
            dataKey="total"
            stroke="#7c3aed"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}