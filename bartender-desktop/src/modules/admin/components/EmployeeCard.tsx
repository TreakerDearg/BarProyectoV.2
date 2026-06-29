"use client";

import {
  Trash2,
  UserCheck,
  Zap,
  Activity,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  User
} from "lucide-react";
import { motion } from "framer-motion";
import type { User as UserType } from "../types/user";

interface Props {
  user: UserType;
  onDeactivate: (id: string) => void;
  onActivate?: (id: string) => void;
  onInspect?: (user: UserType) => void;
}

export default function EmployeeCard({
  user,
  onDeactivate,
  onActivate,
  onInspect
}: Props) {
  const isActive = user.isActive;
  
  // Calculate relative time for last activity
  const getRelativeTime = (date: Date | string | undefined) => {
    if (!date) return "Sin actividad";
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return "Hace +7d";
  };

  // Simulated metrics for the VIP aesthetic
  const metrics = {
    shifts: Math.floor(Math.random() * 150) + 50,
    performance: Math.floor(Math.random() * 20) + 80,
    reliability: "ELITE",
    lastActivity: getRelativeTime(user.lastLogin),
    tenure: user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000) : 0
  };

  // Role theme configuration with fused colors
  const roleTheme = {
    admin: {
      gradient: "from-amber-400/20 via-amber-500/15 to-purple-500/10",
      borderColor: "border-amber-400/30",
      textColor: "text-amber-400",
      iconBg: "bg-amber-400/20",
      iconColor: "text-amber-400"
    },
    bartender: {
      gradient: "from-cyan-400/20 via-blue-400/15 to-purple-500/10",
      borderColor: "border-cyan-400/30",
      textColor: "text-cyan-400",
      iconBg: "bg-cyan-400/20",
      iconColor: "text-cyan-400"
    },
    waiter: {
      gradient: "from-emerald-400/20 via-green-400/15 to-cyan-400/10",
      borderColor: "border-emerald-400/30",
      textColor: "text-emerald-400",
      iconBg: "bg-emerald-400/20",
      iconColor: "text-emerald-400"
    },
    kitchen: {
      gradient: "from-orange-400/20 via-red-400/15 to-amber-400/10",
      borderColor: "border-orange-400/30",
      textColor: "text-orange-400",
      iconBg: "bg-orange-400/20",
      iconColor: "text-orange-400"
    },
    cashier: {
      gradient: "from-purple-400/20 via-violet-400/15 to-pink-400/10",
      borderColor: "border-purple-400/30",
      textColor: "text-purple-400",
      iconBg: "bg-purple-400/20",
      iconColor: "text-purple-400"
    }
  };

  const theme = roleTheme[user.role as keyof typeof roleTheme] || roleTheme.waiter;

  return (
    <motion.div
      onClick={() => onInspect?.(user)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`
        group relative cursor-pointer
        rounded-2xl overflow-hidden transition-all duration-300
        bg-gradient-to-br ${theme.gradient} border ${theme.borderColor}
        ${isActive ? 'hover:shadow-2xl hover:shadow-amber-400/10' : 'opacity-60 grayscale'}
      `}
    >
      {/* Glow Effect */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${isActive ? 'bg-amber-400/20' : 'bg-red-400/10'}`} />

      {/* Hero Section */}
      <div className={`relative p-5 bg-gradient-to-r ${theme.gradient}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                <User size={28} className={theme.iconColor} />
              </div>
              {isActive && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-4 border-black/50 animate-pulse" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight uppercase leading-none">
                {user.name}
              </h3>
              <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mt-1">
                {user.email}
              </p>
            </div>
          </div>

          {/* Role Badge */}
          <div className={`px-3 py-1.5 rounded-lg border ${theme.iconBg} ${theme.borderColor} ${theme.textColor} text-[10px] font-bold uppercase tracking-wider`}>
            {user.role}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <Activity size={12} className="text-white/40" />
              <span className="text-[8px] text-white/40 uppercase tracking-wider">Performance</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold text-white">{metrics.performance}%</span>
              <TrendingUp size={12} className="text-emerald-400 mb-1" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <Clock size={12} className="text-white/40" />
              <span className="text-[8px] text-white/40 uppercase tracking-wider">Turnos</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold text-white">{metrics.shifts}</span>
              <span className="text-[8px] text-white/40 mb-1">OPS</span>
            </div>
          </div>
        </div>

        {/* Shift Info */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <Calendar size={14} className={theme.iconColor} />
            <div>
              <p className="text-[8px] text-white/40 uppercase tracking-wider">Turno</p>
              <p className="text-xs font-bold text-white uppercase">
                {user.shift || "Sin turno"}
              </p>
            </div>
          </div>
          {user.shift && (
            <div className="px-2 py-0.5 bg-emerald/10 border border-emerald/30 rounded text-[8px] font-bold text-emerald-400 uppercase">
              Activo
            </div>
          )}
        </div>

        {/* Last Activity */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Última actividad</span>
          <span className="font-bold text-white">{metrics.lastActivity}</span>
        </div>

        {/* Performance Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[9px] font-bold text-white/40 uppercase tracking-wider">
            <span className="flex items-center gap-1"><Award size={10} className={theme.iconColor} /> STATUS: {metrics.reliability}</span>
            <span>Tenure: {metrics.tenure}d</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400"
              style={{ width: `${metrics.performance}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onInspect?.(user); }}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400/20 to-purple-400/20 border border-amber-400/30 hover:border-amber-400/50 flex items-center justify-center gap-2 transition-all group/btn"
          >
            <Zap size={14} className="text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Auditoría</span>
            <ChevronRight size={12} className="text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
          </button>

          <div className="flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            {isActive ? (
              <button
                onClick={(e) => { e.stopPropagation(); onDeactivate(user._id); }}
                className="flex-1 h-10 rounded-xl bg-red/10 border border-red/30 flex items-center justify-center gap-2 text-red-400 hover:bg-red/20 transition-all"
              >
                <Trash2 size={14} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Desactivar</span>
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onActivate?.(user._id); }}
                className="flex-1 h-10 rounded-xl bg-emerald/10 border border-emerald/30 flex items-center justify-center gap-2 text-emerald-400 hover:bg-emerald/20 transition-all"
              >
                <UserCheck size={14} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Activar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}