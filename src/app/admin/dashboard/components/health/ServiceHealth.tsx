"use client";

import type { DashboardStats } from "../../services/dashboardService";
import { Zap, Flame, Activity, Clock, ShieldCheck, ShieldAlert } from "lucide-react";

interface Props {
  data: DashboardStats;
}

export default function ServiceHealth({ data }: Props) {
  const isPeak = data.kpis?.todayOrders > 100;
  const kitchenLoad = data.kitchenLoad || 0;
  const barLoad = data.barLoad || 0;

  // Convert loads (0-100) to 8-segment bars
  const kitchenSegments = Math.ceil((kitchenLoad / 100) * 8);
  const barSegments = Math.ceil((barLoad / 100) * 8);

  const isKitchenCritical = kitchenSegments > 6;
  const isBarCritical = barSegments > 6;

  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Kitchen Load */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full animate-pulse ${isKitchenCritical ? 'bg-red shadow-red-glow' : 'bg-emerald-400 shadow-emerald-400/20'}`} />
             <span className="text-[10px] font-black text-ivory uppercase tracking-widest">Carga de Cocina</span>
          </div>
          <span className={`text-[8px] px-3 py-1 rounded-full font-black tracking-widest border ${isKitchenCritical ? 'border-red/20 text-red bg-red/5' : 'border-emerald-400/20 text-emerald-400 bg-emerald-400/5'}`}>
            {isKitchenCritical ? 'CRÍTICO' : 'ÓPTIMO'}
          </span>
        </div>
        <div className="flex gap-2 h-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-500 ${i <= kitchenSegments ? (isKitchenCritical ? 'bg-red shadow-red-glow' : 'bg-emerald-400 shadow-emerald-400/20') : 'bg-white/5'}`}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-[9px] font-black text-muted uppercase tracking-widest">
           <span className="flex items-center gap-2"><Clock size={10} /> SATURACIÓN</span>
           <span className="text-ivory">{kitchenLoad}%</span>
        </div>
      </div>

      {/* Bar Queue */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full animate-pulse ${isBarCritical ? 'bg-red shadow-red-glow' : 'bg-gold shadow-gold-glow'}`} />
             <span className="text-[10px] font-black text-ivory uppercase tracking-widest">Fila de Barra</span>
          </div>
          <span className={`text-[8px] px-3 py-1 rounded-full font-black tracking-widest border ${isBarCritical ? 'border-red/20 text-red bg-red/5' : 'border-gold/20 text-gold bg-gold/5'}`}>
            {isBarCritical ? 'ATASCO' : 'FLUÍDO'}
          </span>
        </div>
        <div className="flex gap-2 h-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-500 ${i <= barSegments ? (isBarCritical ? 'bg-red shadow-red-glow' : 'bg-gold shadow-gold-glow') : 'bg-white/5'}`}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-[9px] font-black text-muted uppercase tracking-widest">
           <span className="flex items-center gap-2"><Zap size={10} /> SATURACIÓN</span>
           <span className="text-ivory">{barLoad}%</span>
        </div>
      </div>

      {/* System Integrity */}
      <div className="mt-auto p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[8px] font-black text-muted uppercase tracking-widest">Protocolos de Red OK</span>
         </div>
         <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">EN LÍNEA</span>
      </div>
    </div>
  );
}
