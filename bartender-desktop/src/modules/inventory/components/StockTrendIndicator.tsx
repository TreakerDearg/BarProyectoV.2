"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  trend: 'up' | 'down' | 'stable';
  value?: number;
  label?: string;
  compact?: boolean;
}

export default function StockTrendIndicator({
  trend,
  value,
  label,
  compact = false
}: Props) {
  const trendConfig = {
    up: {
      icon: <TrendingUp size={compact ? 12 : 14} className="text-emerald-400" />,
      color: "text-emerald-400",
      bgColor: "bg-emerald/10",
      borderColor: "border-emerald/20",
      label: "Aumentando"
    },
    down: {
      icon: <TrendingDown size={compact ? 12 : 14} className="text-red-400" />,
      color: "text-red-400",
      bgColor: "bg-red/10",
      borderColor: "border-red/20",
      label: "Disminuyendo"
    },
    stable: {
      icon: <Minus size={compact ? 12 : 14} className="text-muted" />,
      color: "text-muted",
      bgColor: "bg-white/5",
      borderColor: "border-white/10",
      label: "Estable"
    }
  }[trend];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${trendConfig.bgColor}`}>
          {trendConfig.icon}
        </div>
        <div>
          <p className={`text-[10px] font-semibold ${trendConfig.color}`}>
            {trendConfig.label}
          </p>
          {value !== undefined && (
            <p className="text-[8px] text-muted">{value.toFixed(1)}%</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${trendConfig.borderColor} ${trendConfig.bgColor}`}>
      <div className={`p-2 rounded-lg ${trendConfig.bgColor}`}>
        {trendConfig.icon}
      </div>
      <div className="flex-1">
        <p className={`text-xs font-bold ${trendConfig.color}`}>
          {label || "Tendencia"}
        </p>
        {value !== undefined && (
          <p className="text-[10px] text-muted mt-0.5">
            {value > 0 ? '+' : ''}{value.toFixed(1)}% vs período anterior
          </p>
        )}
      </div>
    </div>
  );
}
