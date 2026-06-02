"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { DiscountReason } from "../types/discounts";

const REASON_LABELS: Record<DiscountReason, string> = {
  WAIT_TIME: "Tiempo de espera",
  QUALITY_ISSUE: "Problema de calidad",
  COMP: "Cortesía",
  EMPLOYEE: "Empleado",
  OTHER: "Otro",
};

const REASON_COLORS: Record<DiscountReason, string> = {
  WAIT_TIME: "#8b5cf6", // violet
  QUALITY_ISSUE: "#ef4444", // red
  COMP: "#f59e0b", // amber
  EMPLOYEE: "#3b82f6", // blue
  OTHER: "#6b7280", // gray
};

interface ReasonData {
  reason: DiscountReason;
  count: number;
  amount: number;
}

interface Props {
  data: Record<string, { count: number; amount: number }>;
  loading?: boolean;
}

export default function DiscountReasonPieChart({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const chartData: ReasonData[] = Object.entries(data)
    .filter(([_, value]) => value.count > 0)
    .map(([reason, value]) => ({
      reason: reason as DiscountReason,
      count: value.count,
      amount: value.amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted text-sm">
        No hay datos disponibles
      </div>
    );
  }

  const totalAmount = chartData.reduce((sum, d) => sum + d.amount, 0);
  const totalCount = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h4 className="text-xs font-bold text-ivory uppercase tracking-wider">Por Razón</h4>
        <p className="text-[10px] text-muted">Distribución de descuentos por motivo</p>
      </div>

      {/* Pie Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="reason"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={REASON_COLORS[entry.reason]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: DiscountReason) => [
                `$${value.toFixed(2)}`,
                REASON_LABELS[name] || name,
              ]}
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {chartData.map((entry) => {
          const percentage = totalAmount > 0 ? (entry.amount / totalAmount) * 100 : 0;
          return (
            <div
              key={entry.reason}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: REASON_COLORS[entry.reason] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-ivory truncate">
                  {REASON_LABELS[entry.reason] || entry.reason}
                </p>
                <p className="text-[8px] text-muted">
                  {entry.count} descuento{entry.count !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-ivory">${entry.amount.toFixed(2)}</p>
                <p className="text-[8px] text-muted">{percentage.toFixed(1)}%</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="pt-2 border-t border-white/10 flex justify-between text-[10px]">
        <span className="text-muted">Total</span>
        <span className="font-bold text-ivory">${totalAmount.toFixed(2)} ({totalCount})</span>
      </div>
    </div>
  );
}
