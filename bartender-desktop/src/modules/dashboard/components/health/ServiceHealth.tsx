"use client";

import type { DashboardStats } from "../../services/dashboardService";
import { Clock, ShieldCheck, ChefHat } from "lucide-react";
import "../../../../styles/dashboard-theme.css";

interface Props {
  data: DashboardStats;
}

export default function ServiceHealth({ data }: Props) {
  const kitchenLoad = data.kitchenLoad || 0;
  const barLoad = data.barLoad || 0;
  const activeOrders = data.activeOrdersCount || 0;

  // Convert loads (0-100) to 8-segment bars
  const kitchenSegments = Math.ceil((kitchenLoad / 100) * 8);
  const barSegments = Math.ceil((barLoad / 100) * 8);

  const isKitchenCritical = kitchenSegments > 6;
  const isBarCritical = barSegments > 6;

  // Calculate estimated wait time based on bar load
  const estimatedWaitTime = barLoad > 0 ? Math.ceil(barLoad / 10) : 0;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Kitchen Status */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className={`status-dot-fusion ${isKitchenCritical ? 'status-error-fusion' : 'status-success-fusion'}`} />
             <span className="text-xs font-semibold text-ivory">Cocina</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${isKitchenCritical ? 'border-red/20 text-red bg-red/5' : 'border-emerald-400/20 text-emerald-400 bg-emerald-400/5'}`}>
            {isKitchenCritical ? 'Muy ocupada' : 'Normal'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ChefHat size={14} className="text-muted" />
          <span className="text-sm text-muted">
            {activeOrders} {activeOrders === 1 ? 'orden' : 'órdenes'} en preparación
          </span>
        </div>
        <div className="flex gap-1.5 h-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-500 ${i <= kitchenSegments ? (isKitchenCritical ? 'bg-red shadow-red-glow' : 'bg-emerald-400 shadow-emerald-400/20') : 'bg-white/5'}`}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-[10px] text-muted">
           <span>Ocupación:</span>
           <span className="text-ivory font-semibold">{kitchenLoad}%</span>
        </div>
      </div>

      {/* Bar Status */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className={`status-dot-fusion ${isBarCritical ? 'status-error-fusion' : 'status-warning-fusion'}`} />
             <span className="text-xs font-semibold text-ivory">Barra</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${isBarCritical ? 'border-red/20 text-red bg-red/5' : 'border-gold/20 text-gold bg-gold/5'}`}>
            {isBarCritical ? 'Demora alta' : 'Rápido'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={14} className="text-muted" />
          <span className="text-sm text-muted">
            Tiempo espera: ~{estimatedWaitTime} min
          </span>
        </div>
        <div className="flex gap-1.5 h-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-500 ${i <= barSegments ? (isBarCritical ? 'bg-red shadow-red-glow' : 'bg-gold shadow-gold-glow') : 'bg-white/5'}`}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-[10px] text-muted">
           <span>Ocupación:</span>
           <span className="text-ivory font-semibold">{barLoad}%</span>
        </div>
      </div>

      {/* System Integrity */}
      <div className="mt-auto p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-muted">Sistema en línea</span>
         </div>
         <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
           <span className="text-[10px] font-semibold text-emerald-400">OK</span>
         </div>
      </div>
    </div>
  );
}
