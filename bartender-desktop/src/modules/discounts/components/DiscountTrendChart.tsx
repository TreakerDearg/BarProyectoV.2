"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendDataPoint {
  date: string;
  amount: number;
  count: number;
}

interface Props {
  data: TrendDataPoint[];
  loading?: boolean;
}

export default function DiscountTrendChart({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted text-sm">
        No hay datos disponibles
      </div>
    );
  }

  const maxAmount = Math.max(...data.map(d => d.amount));
  const minAmount = Math.min(...data.map(d => d.amount));
  const avgAmount = data.reduce((sum, d) => sum + d.amount, 0) / data.length;

  const lastAmount = data[data.length - 1].amount;
  const previousAmount = data.length > 1 ? data[data.length - 2].amount : lastAmount;
  const trend = lastAmount > previousAmount ? "up" : lastAmount < previousAmount ? "down" : "flat";

  return (
    <div className="space-y-4">
      {/* Header with trend indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-ivory uppercase tracking-wider">Tendencia (7 días)</h4>
          <p className="text-[10px] text-muted">Monto total de descuentos</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
          trend === "up" ? "bg-red-500/10 text-red-400" :
          trend === "down" ? "bg-emerald-500/10 text-emerald-400" :
          "bg-white/5 text-muted"
        }`}>
          {trend === "up" && <TrendingUp size={12} />}
          {trend === "down" && <TrendingDown size={12} />}
          {trend === "flat" && <Minus size={12} />}
          <span className="text-[10px] font-bold">
            {trend === "up" ? "+" : trend === "down" ? "-" : ""}{previousAmount > 0 ? ((lastAmount - previousAmount) / previousAmount * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="h-32 flex items-end gap-1">
        {data.map((point, index) => {
          const heightPercentage = maxAmount > 0 ? (point.amount / maxAmount) * 100 : 0;
          const isLast = index === data.length - 1;
          
          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center gap-1 group"
              title={`${point.date}: $${point.amount.toFixed(2)} (${point.count} descuentos)`}
            >
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isLast
                    ? 'bg-gradient-to-t from-violet-600 to-cyan-500'
                    : 'bg-violet-500/50 group-hover:bg-violet-500/70'
                }`}
                style={{ height: `${Math.max(4, heightPercentage)}%` }}
              />
              <span className="text-[8px] text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                {point.date.split('-').slice(1).join('/')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
        <div className="text-center">
          <p className="text-[8px] text-muted uppercase tracking-wider">Máximo</p>
          <p className="text-xs font-bold text-ivory">${maxAmount.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] text-muted uppercase tracking-wider">Promedio</p>
          <p className="text-xs font-bold text-ivory">${avgAmount.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] text-muted uppercase tracking-wider">Mínimo</p>
          <p className="text-xs font-bold text-ivory">${minAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
