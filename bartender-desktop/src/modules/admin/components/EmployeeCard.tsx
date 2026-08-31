/**
 * EmployeeCard — datos reales del modelo User.
 *
 * ANTES: métricas con Math.random() → datos falsos en cada render.
 * AHORA: datos del backend: performance.averageRating, attendance.thisMonth,
 *        shift asignado, attendance.currentStatus, lastLogin.
 */

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
  User as UserIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import type { User as UserType } from "../types/user";

// ── Tipos extendidos (campos del backend no en el tipo base) ──────

interface UserWithMetrics extends UserType {
  performance?: {
    averageRating?: number;
    totalHours?: number;
    shiftsCompleted?: number;
    totalSales?: number;
  };
  attendance?: {
    currentStatus?: "checked-in" | "checked-out" | "break" | "absent" | "late";
    thisMonth?: {
      present?: number;
      absent?: number;
      totalHours?: number;
    };
    lastCheckIn?: string;
    totalMinutesWorked?: number;
  };
}

interface Props {
  user: UserWithMetrics;
  onDeactivate: (id: string) => void;
  onActivate?: (id: string) => void;
  onInspect?: (user: UserType) => void;
}

// ── Helpers ───────────────────────────────────────────────────────

function getRelativeTime(date: string | undefined): string {
  if (!date) return "Sin actividad";
  const now  = new Date();
  const then = new Date(date);
  const ms   = now.getTime() - then.getTime();
  const min  = Math.floor(ms / 60_000);
  const h    = Math.floor(ms / 3_600_000);
  const d    = Math.floor(ms / 86_400_000);
  if (min < 60) return `Hace ${min}m`;
  if (h   < 24) return `Hace ${h}h`;
  if (d   <  7) return `Hace ${d}d`;
  return "Hace +7d";
}

function getTenureDays(createdAt: string | undefined): number {
  if (!createdAt) return 0;
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
}

const ATTENDANCE_STATUS: Record<string, { label: string; color: string; dot: string }> = {
  "checked-in":  { label: "En turno",    color: "text-emerald-400", dot: "bg-emerald-400" },
  break:         { label: "Descanso",    color: "text-amber-400",   dot: "bg-amber-400"   },
  "checked-out": { label: "Fuera",       color: "text-muted",       dot: "bg-white/20"    },
  absent:        { label: "Ausente",     color: "text-red",         dot: "bg-red"         },
  late:          { label: "Tarde",       color: "text-amber-400",   dot: "bg-amber-400"   },
};

const SHIFT_LABEL: Record<string, string> = {
  morning:   "Mañana",
  afternoon: "Tarde",
  night:     "Noche",
  event:     "Evento",
};

const ROLE_THEME: Record<string, {
  gradient: string; borderColor: string; textColor: string;
  iconBg: string; iconColor: string; glowBg: string;
}> = {
  admin:     { gradient: "from-amber-400/20 via-amber-500/15 to-purple-500/10",   borderColor: "border-amber-400/30",  textColor: "text-amber-400",  iconBg: "bg-amber-400/20",  iconColor: "text-amber-400",  glowBg: "bg-amber-400/20"   },
  bartender: { gradient: "from-cyan-400/20 via-blue-400/15 to-purple-500/10",    borderColor: "border-cyan-400/30",   textColor: "text-cyan-400",   iconBg: "bg-cyan-400/20",   iconColor: "text-cyan-400",   glowBg: "bg-cyan-400/20"    },
  waiter:    { gradient: "from-emerald-400/20 via-green-400/15 to-cyan-400/10",  borderColor: "border-emerald-400/30", textColor: "text-emerald-400", iconBg: "bg-emerald-400/20", iconColor: "text-emerald-400", glowBg: "bg-emerald-400/20" },
  kitchen:   { gradient: "from-orange-400/20 via-red-400/15 to-amber-400/10",    borderColor: "border-orange-400/30", textColor: "text-orange-400", iconBg: "bg-orange-400/20", iconColor: "text-orange-400", glowBg: "bg-orange-400/20"  },
  cashier:   { gradient: "from-purple-400/20 via-violet-400/15 to-pink-400/10",  borderColor: "border-purple-400/30", textColor: "text-purple-400", iconBg: "bg-purple-400/20", iconColor: "text-purple-400", glowBg: "bg-purple-400/20"  },
};

// ── Componente ────────────────────────────────────────────────────

export default function EmployeeCard({ user, onDeactivate, onActivate, onInspect }: Props) {
  const isActive = user.isActive;
  const theme    = ROLE_THEME[user.role] ?? ROLE_THEME.waiter;

  // ── Métricas REALES del backend ───────────────────────────────
  // Performance (del campo user.performance en MongoDB)
  const avgRating      = user.performance?.averageRating ?? 0;
  const performancePct = Math.min(100, Math.round(avgRating * 20)); // rating 0–5 → 0–100%
  const shiftsCompleted = user.performance?.shiftsCompleted ?? user.attendance?.thisMonth?.present ?? 0;

  // Attendance del mes
  const presentDays = user.attendance?.thisMonth?.present ?? 0;
  const totalHours  = user.attendance?.thisMonth?.totalHours ?? user.performance?.totalHours ?? 0;

  // Estado de asistencia actual
  const currentStatusKey = user.attendance?.currentStatus ?? "checked-out";
  const attendanceStatus = ATTENDANCE_STATUS[currentStatusKey] ?? ATTENDANCE_STATUS["checked-out"];

  // Última actividad — usar lastCheckIn > lastLogin
  const lastActivity = getRelativeTime(user.attendance?.lastCheckIn ?? user.lastLogin);

  // Antigüedad en días
  const tenure = getTenureDays(user.createdAt);

  // Label de rendimiento basado en rating real
  const performanceLabel =
    avgRating >= 4.5 ? "ELITE"
    : avgRating >= 3.5 ? "PRO"
    : avgRating >= 2.5 ? "ESTABLE"
    : avgRating >  0   ? "EN PROGRESO"
    : "SIN DATOS";

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
        ${isActive ? "hover:shadow-2xl hover:shadow-amber-400/10" : "opacity-60 grayscale"}
      `}
    >
      {/* Glow hover */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${theme.glowBg}`} />

      {/* Hero */}
      <div className={`relative p-5 bg-gradient-to-r ${theme.gradient}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar con indicador de estado real */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={28} className={theme.iconColor} />
                )}
              </div>
              {/* Dot de estado de asistencia */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-black/50 ${attendanceStatus.dot} ${
                currentStatusKey === "checked-in" ? "animate-pulse" : ""
              }`} title={attendanceStatus.label} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight uppercase leading-none">
                {user.name}
              </h3>
              <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mt-1">
                {user.email}
              </p>
              {/* Estado de asistencia real */}
              <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${attendanceStatus.color}`}>
                {attendanceStatus.label}
              </p>
            </div>
          </div>

          {/* Role badge */}
          <div className={`px-3 py-1.5 rounded-lg border ${theme.iconBg} ${theme.borderColor} ${theme.textColor} text-[10px] font-bold uppercase tracking-wider`}>
            {user.role}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-4">

        {/* Métricas reales */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <Activity size={12} className="text-white/40" />
              <span className="text-[8px] text-white/40 uppercase tracking-wider">Performance</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold text-white">
                {avgRating > 0 ? `${avgRating.toFixed(1)}` : "—"}
              </span>
              {avgRating > 0 && <TrendingUp size={12} className="text-emerald-400 mb-1" />}
              {avgRating > 0 && <span className="text-[8px] text-white/40 mb-1">/5</span>}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <Clock size={12} className="text-white/40" />
              <span className="text-[8px] text-white/40 uppercase tracking-wider">Turnos/mes</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold text-white">{shiftsCompleted}</span>
              {totalHours > 0 && (
                <span className="text-[8px] text-white/40 mb-1">{Math.round(totalHours)}h</span>
              )}
            </div>
          </div>
        </div>

        {/* Turno asignado */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <Calendar size={14} className={theme.iconColor} />
            <div>
              <p className="text-[8px] text-white/40 uppercase tracking-wider">Turno asignado</p>
              <p className="text-xs font-bold text-white uppercase">
                {user.shift ? SHIFT_LABEL[user.shift] ?? user.shift : "Sin turno"}
              </p>
            </div>
          </div>
          {user.shift && (
            <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
              currentStatusKey === "checked-in"
                ? "bg-emerald-400/10 border border-emerald-400/30 text-emerald-400"
                : "bg-white/5 border border-white/10 text-white/40"
            }`}>
              {currentStatusKey === "checked-in" ? "En turno" : "Inactivo"}
            </div>
          )}
        </div>

        {/* Última actividad */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Última actividad</span>
          <span className="font-bold text-white">{lastActivity}</span>
        </div>

        {/* Barra de performance real */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[9px] font-bold text-white/40 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Award size={10} className={theme.iconColor} />
              STATUS: {performanceLabel}
            </span>
            <span>Antigüedad: {tenure}d</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400"
              style={{ width: performancePct > 0 ? `${performancePct}%` : "5%" }}
            />
          </div>
          {presentDays > 0 && (
            <p className="text-[9px] text-white/30 text-right">
              {presentDays} días presentes este mes
            </p>
          )}
        </div>

        {/* Acciones */}
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
                className="flex-1 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center gap-2 text-emerald-400 hover:bg-emerald-400/20 transition-all"
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
