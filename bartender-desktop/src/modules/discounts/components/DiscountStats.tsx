"use client";

import type { DiscountStatsData } from "../types/discounts";
import { TrendingUp, Activity, Target, Zap } from "lucide-react";

interface Props {
  data: DiscountStatsData;
  loading?: boolean;
}

export default function DiscountStats({ data, loading }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* TOTAL TODAY */}
      <div className="glass-royale p-6 rounded-[2rem] border border-emerald-400/10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 opacity-20" />
        <div className="flex justify-between items-start">
           <p className="text-[9px] font-black text-muted uppercase tracking-[0.4em]">AHORRO TOTAL HOY</p>
           <TrendingUp size={16} className="text-emerald-400 opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-3xl font-black text-ivory tracking-tighter mt-4">
          {loading ? <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" /> : `-$${data.todayTotal.toLocaleString()}`}
        </p>
        <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
           <TrendingUp size={60} />
        </div>
      </div>

      {/* APPLIED COUNT */}
      <div className="glass-royale p-6 rounded-[2rem] border border-gold/10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gold opacity-20" />
        <div className="flex justify-between items-start">
           <p className="text-[9px] font-black text-muted uppercase tracking-[0.4em]">PROTOCOLOS ACTIVOS</p>
           <Activity size={16} className="text-gold opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-3xl font-black text-ivory tracking-tighter mt-4">
          {loading ? <div className="h-8 w-16 bg-white/5 animate-pulse rounded-lg" /> : data.appliedCount}
        </p>
        <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
           <Activity size={60} />
        </div>
      </div>

      {/* AVG PERCENT */}
      <div className="glass-royale p-6 rounded-[2rem] border border-cyan-400/10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 opacity-20" />
        <div className="flex justify-between items-start">
           <p className="text-[9px] font-black text-muted uppercase tracking-[0.4em]">PROMEDIO IMPACTO</p>
           <Target size={16} className="text-cyan-400 opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-3xl font-black text-ivory tracking-tighter mt-4">
          {loading ? <div className="h-8 w-20 bg-white/5 animate-pulse rounded-lg" /> : `${data.averagePercent.toFixed(1)}%`}
        </p>
        <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
           <Target size={60} />
        </div>
      </div>

    </div>
  );
}