"use client";

import { 
  Trash2, 
  Shield, 
  UserCheck, 
  UserX, 
  Zap, 
  Activity, 
  Clock, 
  Target, 
  Briefcase,
  Star,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import type { User } from "../types/user";

interface Props {
  user: User;
  onDeactivate: (id: string) => void;
  onActivate?: (id: string) => void;
  onInspect?: (user: User) => void;
}

export default function EmployeeCard({
  user,
  onDeactivate,
  onActivate,
  onInspect
}: Props) {
  const isActive = user.isActive;
  
  // Simulated metrics for the VIP aesthetic
  const metrics = {
    shifts: Math.floor(Math.random() * 150) + 50,
    performance: Math.floor(Math.random() * 20) + 80,
    reliability: "ELITE",
    lastShift: "HACE 4h"
  };

  const roleColors: any = {
    admin: "text-gold bg-gold/5 border-gold/20 shadow-gold-glow",
    bartender: "text-cyan-400 bg-cyan-400/5 border-cyan-400/20 shadow-cyan-400/10",
    waiter: "text-emerald-400 bg-emerald-400/5 border-emerald-400/20 shadow-emerald-400/10",
    chef: "text-red-400 bg-red-400/5 border-red-400/20 shadow-red-400/10"
  };

  const activeTheme = roleColors[user.role] || roleColors.waiter;

  return (
    <div 
      onClick={() => onInspect?.(user)}
      className={`
        group relative cursor-pointer
        rounded-[2.5rem] p-8 space-y-7
        border border-white/5
        bg-surface-2 overflow-hidden transition-all duration-500
        hover:translate-y-[-8px] hover:shadow-royale
        ${isActive ? 'hover:border-gold/30' : 'border-red/20 opacity-70'}
      `}
    >
      
      {/* ATMOSPHERIC GLOW */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-700 opacity-0 group-hover:opacity-100 ${isActive ? 'bg-gold/10' : 'bg-red/10'}`} />

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl bg-surface-3 border border-white/10 flex items-center justify-center text-ivory shadow-inner overflow-hidden`}>
              <div className="absolute inset-0 bg-grad-gold opacity-10 group-hover:opacity-20 transition-opacity" />
              <Briefcase size={28} className="text-muted group-hover:text-gold transition-colors" />
            </div>
            {isActive && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-lime rounded-full border-4 border-surface-2 animate-pulse-slow" />
            )}
          </div>
          <div>
            <h3 className="font-black text-2xl text-ivory tracking-tighter uppercase leading-none truncate max-w-[180px]">
              {user.name}
            </h3>
            <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em] mt-1">
              {user.email}
            </p>
          </div>
        </div>

        <div className={`badge ${activeTheme} text-[8px] px-3 py-1.5 rounded-xl font-black tracking-widest`}>
          {user.role.toUpperCase()}
        </div>
      </div>

      {/* ================= TACTICAL STATS ================= */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-surface-3/50 p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[8px] text-muted font-black uppercase tracking-widest">PERFORMANCE</p>
            <Activity size={12} className="text-gold" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-ivory leading-none">{metrics.performance}%</span>
            <TrendingUp size={14} className="text-lime mb-0.5" />
          </div>
        </div>
        <div className="bg-surface-3/50 p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[8px] text-muted font-black uppercase tracking-widest">TURNOS TOTALES</p>
            <Clock size={12} className="text-muted" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-ivory leading-none">{metrics.shifts}</span>
            <p className="text-[8px] text-muted font-black mb-0.5">OPS</p>
          </div>
        </div>
      </div>

      {/* ================= PERFORMANCE BAR ================= */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-center text-[9px] font-black text-muted uppercase tracking-[0.2em]">
          <span className="flex items-center gap-2"><Award size={12} className="text-gold" /> STATUS: {metrics.reliability}</span>
          <span>PROGRESO NIVEL 4</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
          <div 
            className="h-full bg-grad-gold rounded-full shadow-gold-glow transition-all duration-1000"
            style={{ width: `${metrics.performance}%` }}
          />
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex flex-col gap-3 relative z-10">
        <button
          onClick={() => onInspect?.(user)}
          className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-gold/5 hover:border-gold/30 transition-all group/btn"
        >
          <Zap size={16} className="text-gold" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-ivory">AUDITORÍA DE PERSONAL</span>
          <ChevronRight size={14} className="text-gold group-hover/btn:translate-x-1 transition-transform" />
        </button>
        
        <div className="flex gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          {isActive ? (
            <button
              onClick={(e) => { e.stopPropagation(); onDeactivate(user._id); }}
              className="flex-1 h-14 rounded-2xl bg-red/5 border border-red/10 flex items-center justify-center gap-3 text-red/60 hover:text-red hover:bg-red/20 transition-all"
            >
              <Trash2 size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">DESACTIVAR</span>
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onActivate?.(user._id); }}
              className="flex-1 h-14 rounded-2xl bg-emerald-400/5 border border-emerald-400/10 flex items-center justify-center gap-3 text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-400/20 transition-all"
            >
              <UserCheck size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">RE-ACTIVAR</span>
            </button>
          )}
        </div>
      </div>

      {/* CASINO DECOR */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Shield size={120} />
      </div>
    </div>
  );
}