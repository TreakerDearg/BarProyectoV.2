"use client";

import {
  Clock,
  Shield,
  User as UserIcon,
  Wine,
  UtensilsCrossed,
  ChefHat,
  CreditCard,
  Crown,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Pause,
  LogOut,
} from "lucide-react";
import type { User as UserType } from "../types/user";

interface Props {
  user: UserType;
  onInspect: (user: UserType) => void;
  onToggleStatus: (user: UserType) => void;
}

const ROLE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  admin: {
    label: "Administrador",
    icon: <Crown className="w-3.5 h-3.5 text-gold" />,
    badgeClass: "bg-gold/15 text-gold border-gold/30",
  },
  bartender: {
    label: "Bartender",
    icon: <Wine className="w-3.5 h-3.5 text-cyan" />,
    badgeClass: "bg-cyan/15 text-cyan border-cyan/30",
  },
  waiter: {
    label: "Mozo / Salón",
    icon: <UtensilsCrossed className="w-3.5 h-3.5 text-emerald" />,
    badgeClass: "bg-emerald/15 text-emerald border-emerald/30",
  },
  kitchen: {
    label: "Cocina",
    icon: <ChefHat className="w-3.5 h-3.5 text-amber" />,
    badgeClass: "bg-amber/15 text-amber border-amber/30",
  },
  cashier: {
    label: "Caja",
    icon: <CreditCard className="w-3.5 h-3.5 text-purple-400" />,
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
};

const SHIFT_LABELS: Record<string, { label: string; hours: string }> = {
  morning: { label: "Turno Mañana", hours: "08:00 - 16:00" },
  afternoon: { label: "Turno Tarde", hours: "16:00 - 00:00" },
  night: { label: "Turno Noche", hours: "20:00 - 04:00" },
  event: { label: "Turno Evento", hours: "Especial" },
};

export default function EmployeeCard({
  user,
  onInspect,
  onToggleStatus,
}: Props) {
  const roleCfg = ROLE_CONFIG[user.role] || {
    label: user.role || "Personal",
    icon: <UserIcon className="w-3.5 h-3.5 text-text-muted" />,
    badgeClass: "bg-surface-card text-text-muted border-border/60",
  };

  const shiftCfg = user.shift ? SHIFT_LABELS[user.shift] : null;

  // Real-time status from attendance
  const currentStatus = user.attendance?.currentStatus || "checked-out";
  const isCheckedIn = currentStatus === "checked-in";
  const isBreak = currentStatus === "break";
  const isAbsent = currentStatus === "absent";

  // Initial letters
  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Antigüedad en días / meses
  const tenureText = user.createdAt
    ? (() => {
        const days = Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) / 86_400_000
        );
        if (days < 30) return `${days} días`;
        const months = Math.floor(days / 30);
        return `${months} ${months === 1 ? "mes" : "meses"}`;
      })()
    : "Reciente";

  const totalMonthHours = user.attendance?.thisMonth?.totalHours || 0;
  const shiftsCount = user.attendance?.thisMonth?.present || 0;

  return (
    <div className="bg-surface-card border border-border/60 hover:border-border-strong rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Top Banner: Status Indicator & Quick Toggle */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar with live pulse badge */}
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-surface-dark border border-border/80 flex items-center justify-center text-sm font-bold text-gold font-mono shadow-inner">
              {initials}
            </div>
            {/* Status dot */}
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-surface-card flex items-center justify-center ${
                !user.isActive
                  ? "bg-text-muted/60"
                  : isCheckedIn
                  ? "bg-emerald shadow-[0_0_8px_rgba(63,185,80,0.6)]"
                  : isBreak
                  ? "bg-amber"
                  : "bg-surface-dark border border-border"
              }`}
              title={
                !user.isActive
                  ? "Inactivo"
                  : isCheckedIn
                  ? "En Turno Activo"
                  : isBreak
                  ? "En Descanso"
                  : "Fuera de Turno"
              }
            >
              {isCheckedIn && (
                <span className="w-1.5 h-1.5 rounded-full bg-surface-dark animate-ping" />
              )}
            </span>
          </div>

          {/* Name & Role */}
          <div className="space-y-0.5">
            <h3
              className="text-sm font-bold text-text-primary group-hover:text-gold transition-colors truncate max-w-[170px]"
              title={user.name}
            >
              {user.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${roleCfg.badgeClass}`}
              >
                {roleCfg.icon}
                {roleCfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Badge */}
        <div>
          {user.isActive ? (
            isCheckedIn ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald/15 text-emerald border border-emerald/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                En Turno
              </span>
            ) : isBreak ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber/15 text-amber border border-amber/30">
                <Pause className="w-2.5 h-2.5" />
                Descanso
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-dark text-text-muted border border-border/50">
                Fuera
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red/10 text-red border border-red/20">
              Inactivo
            </span>
          )}
        </div>
      </div>

      {/* Middle Info: Shift and Contact */}
      <div className="space-y-2.5 py-3 border-y border-border/40 text-xs">
        {/* Turno asignado */}
        <div className="flex items-center justify-between text-text-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            Turno Asignado:
          </span>
          <span className="font-semibold text-text-primary">
            {shiftCfg ? `${shiftCfg.label}` : "Sin turno fijo"}
          </span>
        </div>

        {/* Contacto Email */}
        <div className="flex items-center justify-between text-text-muted">
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-text-muted" />
            Email:
          </span>
          <span className="text-text-primary font-mono text-[11px] truncate max-w-[150px]">
            {user.email}
          </span>
        </div>

        {/* Antigüedad */}
        <div className="flex items-center justify-between text-text-muted">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            Antigüedad:
          </span>
          <span className="text-text-primary font-medium">
            {tenureText}
          </span>
        </div>
      </div>

      {/* Real Performance Ribbon */}
      <div className="grid grid-cols-2 gap-2 my-3 bg-surface-dark/60 rounded-xl p-2.5 border border-border/40 text-center">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted block font-semibold">
            Horas Mes
          </span>
          <span className="text-sm font-bold font-mono text-gold">
            {totalMonthHours > 0 ? `${totalMonthHours}h` : "Al día"}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted block font-semibold">
            Turnos Cumplidos
          </span>
          <span className="text-sm font-bold font-mono text-emerald">
            {shiftsCount > 0 ? `${shiftsCount}` : "0"}
          </span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => onInspect(user)}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-surface-dark hover:bg-gold hover:text-surface-dark text-text-primary border border-border/60 hover:border-gold transition-all flex items-center justify-center gap-1.5"
        >
          <span>Gestionar Ficha 360°</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onToggleStatus(user)}
          title={user.isActive ? "Desactivar acceso" : "Activar colaborador"}
          className={`p-2 rounded-xl border text-xs transition-colors ${
            user.isActive
              ? "bg-surface-dark text-text-muted hover:text-red hover:border-red/40 border-border/50"
              : "bg-emerald/15 text-emerald border-emerald/30 hover:bg-emerald/25"
          }`}
        >
          {user.isActive ? (
            <LogOut className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
