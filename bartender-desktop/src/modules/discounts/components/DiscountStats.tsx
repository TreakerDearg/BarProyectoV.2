"use client";

import type { DiscountStatsData } from "../types/discounts";
import { TrendingUp, Activity, PiggyBank } from "lucide-react";

interface Props {
  data: DiscountStatsData;
  loading?: boolean;
}

export default function NebulaDiscountStats({ data, loading }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* TOTAL DEL DÍA */}
      <div className="p-4 rounded-xl transition-all hover:-translate-y-0.5" style={{
        background: 'rgba(18, 18, 25, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <TrendingUp size={24} className="text-emerald" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-0.5">
              Ahorro total hoy
            </div>
            <div className="text-xs text-white/50">
              Descuentos aplicados
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {loading ? (
            <div className="h-8 w-24 bg-white/10 animate-pulse rounded-lg" />
          ) : (
            `$${data.todayTotal.toLocaleString()}`
          )}
        </div>
      </div>

      {/* CANTIDAD APLICADA */}
      <div className="p-4 rounded-xl transition-all hover:-translate-y-0.5" style={{
        background: 'rgba(18, 18, 25, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-lg bg-gold/10 border border-gold/30">
            <Activity size={24} className="text-gold" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-0.5">
              Descuentos aplicados
            </div>
            <div className="text-xs text-white/50">
              Cantidad total
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {loading ? (
            <div className="h-8 w-16 bg-white/10 animate-pulse rounded-lg" />
          ) : (
            data.appliedCount
          )}
        </div>
      </div>

      {/* PROMEDIO DE DESCUENTO */}
      <div className="p-4 rounded-xl transition-all hover:-translate-y-0.5" style={{
        background: 'rgba(18, 18, 25, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-lg" style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <PiggyBank size={24} className="text-cyan" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-0.5">
              Promedio de descuento
            </div>
            <div className="text-xs text-white/50">
              Porcentaje típico
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {loading ? (
            <div className="h-8 w-20 bg-white/10 animate-pulse rounded-lg" />
          ) : (
            `${(data.averagePercent ?? 0).toFixed(1)}%`
          )}
        </div>
      </div>

    </div>
  );
}
