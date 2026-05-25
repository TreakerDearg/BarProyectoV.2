"use client";

import {
  Trash2,
  Shield,
  UserCheck,
  Zap,
  Activity,
  Clock,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar
} from "lucide-react";
import type { User } from "../types/user";
import "../styles/luxury-theme.css";

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
    admin: "text-[#d4af37] bg-[#d4af37]/5 border-[#d4af37]/20 shadow-gold-glow",
    bartender: "text-[#00d4ff] bg-[#00d4ff]/5 border-[#00d4ff]/20 shadow-neon",
    waiter: "text-[#00ff88] bg-[#00ff88]/5 border-[#00ff88]/20",
    chef: "text-[#ff4757] bg-[#ff4757]/5 border-[#ff4757]/20"
  };

  const activeTheme = roleColors[user.role] || roleColors.waiter;

  return (
    <div 
      onClick={() => onInspect?.(user)}
      className={`
        group relative cursor-pointer
        glass-card p-8 space-y-7
        overflow-hidden transition-all duration-500
        hover:translate-y-[-8px]
        ${isActive ? 'hover:border-[#d4af37]/30' : 'border-[#ff4757]/20 opacity-70'}
        animate-fade-in-up
      `}
    >
      
      {/* ATMOSPHERIC GLOW */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-700 opacity-0 group-hover:opacity-100 ${isActive ? 'bg-[#d4af37]/10' : 'bg-[#ff4757]/10'}`} />

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl glass-card flex items-center justify-center overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-gold opacity-10 group-hover:opacity-20 transition-opacity" />
              <Briefcase size={28} className="text-[#a0a0b0] group-hover:text-[#d4af37] transition-colors" />
            </div>
            {isActive && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00ff88] rounded-full border-4 border-[#12121a] animate-pulse-slow" />
            )}
          </div>
          <div>
            <h3 className="font-black text-2xl text-[#ffffff] tracking-tighter uppercase leading-none truncate max-w-[180px]" style={{ fontFamily: 'var(--font-display)' }}>
              {user.name}
            </h3>
            <p className="text-[10px] text-[#a0a0b0] font-black uppercase tracking-[0.3em] mt-1">
              {user.email}
            </p>
          </div>
        </div>

        <div className={`text-[8px] px-3 py-1.5 rounded-xl font-black tracking-widest ${activeTheme}`}>
          {user.role.toUpperCase()}
        </div>
      </div>

      {/* ================= TACTICAL STATS ================= */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="metric-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[8px] text-[#a0a0b0] font-black uppercase tracking-widest">PERFORMANCE</p>
            <Activity size={12} className="text-[#d4af37]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-[#ffffff] leading-none">{metrics.performance}%</span>
            <TrendingUp size={14} className="text-[#00ff88] mb-0.5" />
          </div>
        </div>
        <div className="metric-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[8px] text-[#a0a0b0] font-black uppercase tracking-widest">TURNOS TOTALES</p>
            <Clock size={12} className="text-[#a0a0b0]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-[#ffffff] leading-none">{metrics.shifts}</span>
            <p className="text-[8px] text-[#a0a0b0] font-black mb-0.5">OPS</p>
          </div>
        </div>
      </div>

      {/* ================= SHIFT AUDIT INFO ================= */}
      <div className="metric-card p-4 flex items-center justify-between relative z-10 border border-[#d4af37]/10 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <Calendar size={14} className="text-[#d4af37]" />
          </div>
          <div>
            <p className="text-[8px] text-[#a0a0b0] font-black uppercase tracking-widest mb-1">HORARIO ASIGNADO</p>
            <p className="text-xs font-bold text-white tracking-wide uppercase">
              {user.shift ? `Turno ${user.shift}` : "Sin turno fijo"}
            </p>
          </div>
        </div>
        {user.shift && (
          <div className="px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded text-[9px] font-black text-[#00ff88] uppercase tracking-wider">
            Activo
          </div>
        )}
      </div>

      {/* ================= PERFORMANCE BAR ================= */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-center text-[9px] font-black text-[#a0a0b0] uppercase tracking-[0.2em]">
          <span className="flex items-center gap-2"><Award size={12} className="text-[#d4af37]" /> STATUS: {metrics.reliability}</span>
          <span>PROGRESO NIVEL 4</span>
        </div>
        <div className="h-2 w-full bg-[#0a0a0f]/40 rounded-full overflow-hidden border border-white/5 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${metrics.performance}%`,
              background: 'var(--gradient-gold)',
              boxShadow: 'var(--shadow-gold)'
            }}
          />
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex flex-col gap-3 relative z-10">
        <button
          onClick={() => onInspect?.(user)}
          className="w-full h-14 rounded-2xl glass-card luxury-button flex items-center justify-center gap-3 group/btn"
        >
          <Zap size={16} className="text-[#d4af37]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ffffff]">AUDITORÍA DE PERSONAL</span>
          <ChevronRight size={14} className="text-[#d4af37] group-hover/btn:translate-x-1 transition-transform" />
        </button>

        <div className="flex gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          {isActive ? (
            <button
              onClick={(e) => { e.stopPropagation(); onDeactivate(user._id); }}
              className="flex-1 h-14 rounded-2xl glass-card flex items-center justify-center gap-3 text-[#ff4757]/60 hover:text-[#ff4757] transition-all"
            >
              <Trash2 size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">DESACTIVAR</span>
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onActivate?.(user._id); }}
              className="flex-1 h-14 rounded-2xl glass-card flex items-center justify-center gap-3 text-[#00ff88]/60 hover:text-[#00ff88] transition-all"
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