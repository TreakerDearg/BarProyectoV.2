"use client";

/**
 * DiscountStats — KPIs del día: total $, cantidad, promedio %.
 * REDISEÑO v3.0 — Slate Elegante
 */
import type { DiscountStatsData } from "../types/discounts";
import { TrendingUp, Activity, Percent } from "lucide-react";

interface Props {
  data:     DiscountStatsData;
  loading?: boolean;
}

const CARDS = [
  {
    key:   "todayTotal" as const,
    label: "Ahorro total hoy",
    sub:   "Descuentos aplicados",
    icon:  <TrendingUp size={18} />,
    color: "#3FB950",
    fmt:   (v: number) => `$${v.toLocaleString()}`,
  },
  {
    key:   "appliedCount" as const,
    label: "Descuentos aplicados",
    sub:   "Cantidad total",
    icon:  <Activity size={18} />,
    color: "#F0B429",
    fmt:   (v: number) => String(v),
  },
  {
    key:   "averagePercent" as const,
    label: "Promedio de descuento",
    sub:   "Porcentaje típico",
    icon:  <Percent size={18} />,
    color: "#388BFD",
    fmt:   (v: number) => `${(v ?? 0).toFixed(1)}%`,
  },
];

export default function DiscountStats({ data, loading }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {CARDS.map(({ key, label, sub, icon, color, fmt }) => (
        <div
          key={key}
          className="p-4 rounded-xl flex items-center gap-3"
          style={{ background: `${color}0D`, border: `1px solid ${color}30` }}
        >
          <div
            className="p-2.5 rounded-lg flex-shrink-0"
            style={{ background: `${color}18`, color }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#566270" }}>
              {label}
            </p>
            <p className="text-[10px]" style={{ color: "#3D444D" }}>{sub}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {loading ? (
              <div className="h-7 w-16 rounded-lg animate-pulse" style={{ background: "#21283A" }} />
            ) : (
              <p className="text-xl font-black" style={{ color: "#E6EDF3" }}>
                {fmt(data[key])}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
