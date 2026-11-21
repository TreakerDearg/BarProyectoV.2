"use client";

import React, { useMemo } from "react";
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
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Pause,
  LogOut,
  LogIn,
  Coffee,
  MapPin,
  TrendingUp,
  Star,
  Check,
} from "lucide-react";
import type { User as UserType } from "../types/user";

interface Props {
  user: UserType;
  onInspect: (user: UserType) => void;
  onToggleStatus: (user: UserType) => void;
  onQuickCheckIn?: (user: UserType) => void;
  onQuickCheckOut?: (user: UserType) => void;
}

const ROLE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; badgeClass: string; dotColor: string }
> = {
  admin: {
    label: "Administrador",
    icon: <Crown className="w-3.5 h-3.5 text-[#F0B429]" />,
    badgeClass: "bg-[#F0B429]/15 text-[#F0B429] border-[#F0B429]/30",
    dotColor: "bg-[#F0B429]",
  },
  bartender: {
    label: "Bartender",
    icon: <Wine className="w-3.5 h-3.5 text-[#388BFD]" />,
    badgeClass: "bg-[#388BFD]/15 text-[#388BFD] border-[#388BFD]/30",
    dotColor: "bg-[#388BFD]",
  },
  waiter: {
    label: "Mozo / Salón",
    icon: <UtensilsCrossed className="w-3.5 h-3.5 text-[#3FB950]" />,
    badgeClass: "bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30",
    dotColor: "bg-[#3FB950]",
  },
  kitchen: {
    label: "Cocina",
    icon: <ChefHat className="w-3.5 h-3.5 text-[#D29922]" />,
    badgeClass: "bg-[#D29922]/15 text-[#D29922] border-[#D29922]/30",
    dotColor: "bg-[#D29922]",
  },
  cashier: {
    label: "Caja",
    icon: <CreditCard className="w-3.5 h-3.5 text-[#BC8CFF]" />,
    badgeClass: "bg-[#BC8CFF]/15 text-[#BC8CFF] border-[#BC8CFF]/30",
    dotColor: "bg-[#BC8CFF]",
  },
};

const SHIFT_LABELS: Record<string, { label: string; hours: string }> = {
  morning:   { label: "Turno Mañana", hours: "08:00 - 16:00" },
  afternoon: { label: "Turno Tarde",  hours: "16:00 - 00:00" },
  night:     { label: "Turno Noche",  hours: "20:00 - 04:00" },
  event:     { label: "Turno Evento", hours: "Especial" },
};

export default function EmployeeCard({
  user,
  onInspect,
  onToggleStatus,
  onQuickCheckIn,
  onQuickCheckOut,
}: Props) {
  const roleCfg = ROLE_CONFIG[user.role] || {
    label: user.role || "Personal",
    icon: <UserIcon className="w-3.5 h-3.5 text-[#8B949E]" />,
    badgeClass: "bg-[#1C2333] text-[#8B949E] border-[#30363D]",
    dotColor: "bg-[#8B949E]",
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
    : "CL";

  // Antigüedad en días / meses
  const tenureText = user.createdAt
    ? (() => {
        const days = Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) / 86_400_000
        );
        if (days < 30) return `${Math.max(1, days)} días`;
        const months = Math.floor(days / 30);
        return `${months} ${months === 1 ? "mes" : "meses"}`;
      })()
    : "Reciente";

  // Metrics
  const totalMonthHours = user.attendance?.thisMonth?.totalHours || user.performance?.totalHours || 0;
  const shiftsCount = user.attendance?.thisMonth?.present || user.performance?.shiftsCompleted || 0;
  const rating = user.performance?.averageRating || 4.8;
  const totalSales = user.performance?.totalSales || 0;

  // Target hours (160h standard goal)
  const targetHours = 160;
  const hoursPct = Math.min(100, Math.round((totalMonthHours / targetHours) * 100));

  // Time elapsed in current shift
  const shiftElapsedText = useMemo(() => {
    if (!isCheckedIn || !user.attendance?.lastCheckIn) return null;
    const checkInTime = new Date(user.attendance.lastCheckIn).getTime();
    if (isNaN(checkInTime)) return null;
    const diffMs = Math.max(0, Date.now() - checkInTime);
    const diffHrs = Math.floor(diffMs / 3_600_000);
    const diffMins = Math.floor((diffMs % 3_600_000) / 60_000);
    return `${diffHrs}h ${diffMins}m`;
  }, [isCheckedIn, user.attendance?.lastCheckIn]);

  // Assigned Station fallback
  const stationText = user.station || (
    user.role === "bartender" ? "Barra Principal" :
    user.role === "waiter" ? "Salón Principal" :
    user.role === "kitchen" ? "Cocina Fuegos" :
    user.role === "cashier" ? "Caja Central" : "Administración"
  );

  return (
    <div className="bg-[#161B22] border border-[#30363D] hover:border-[#F0B429]/50 rounded-2xl p-5 shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Top Banner: Status Indicator & Quick Toggle */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar with live pulse badge */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-[#0D1117] border border-[#30363D] flex items-center justify-center text-sm font-bold text-[#F0B429] font-mono shadow-inner">
                {initials}
              </div>
              {/* Status dot */}
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-[#161B22] flex items-center justify-center ${
                  !user.isActive
                    ? "bg-[#566270]"
                    : isCheckedIn
                    ? "bg-[#3FB950] shadow-[0_0_8px_#3FB950]"
                    : isBreak
                    ? "bg-[#D29922] shadow-[0_0_6px_#D29922]"
                    : "bg-[#21283A] border border-[#30363D]"
                }`}
                title={
                  !user.isActive
                    ? "Inactivo"
                    : isCheckedIn
                    ? `En Turno Activo (${shiftElapsedText || "iniciado"})`
                    : isBreak
                    ? "En Descanso"
                    : "Fuera de Turno"
                }
              >
                {isCheckedIn && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
                )}
              </span>
            </div>

            {/* Name, Role & Station */}
            <div className="space-y-1 min-w-0">
              <h3
                className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#F0B429] transition-colors truncate"
                title={user.name}
              >
                {user.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${roleCfg.badgeClass}`}
                >
                  {roleCfg.icon}
                  {roleCfg.label}
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#1C2333] text-[#8B949E] border border-[#30363D]">
                  <MapPin className="w-2.5 h-2.5 text-[#388BFD]" />
                  <span className="truncate max-w-[110px]">{stationText}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Live Status Badge */}
          <div className="flex-shrink-0">
            {user.isActive ? (
              isCheckedIn ? (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 shadow-[0_0_6px_rgba(63,185,80,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950]" />
                    En Turno
                  </span>
                  {shiftElapsedText && (
                    <span className="block text-[10px] font-mono text-[#8B949E] mt-0.5">
                      {shiftElapsedText}
                    </span>
                  )}
                </div>
              ) : isBreak ? (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D29922]/15 text-[#D29922] border border-[#D29922]/30">
                    <Coffee className="w-2.5 h-2.5" />
                    Descanso
                  </span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1C2333] text-[#8B949E] border border-[#30363D]">
                  Fuera
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/30">
                Inactivo
              </span>
            )}
          </div>
        </div>

        {/* Shift and Schedule line */}
        <div className="flex items-center justify-between text-xs py-2 px-2.5 bg-[#1C2333] rounded-xl border border-[#30363D] mb-3">
          <span className="flex items-center gap-1.5 text-[#8B949E]">
            <Clock className="w-3.5 h-3.5 text-[#388BFD]" />
            Turno:
          </span>
          <span className="font-semibold text-[#E6EDF3] text-[11px]">
            {shiftCfg ? `${shiftCfg.label} (${shiftCfg.hours})` : "Sin turno fijo"}
          </span>
        </div>

        {/* Monthly Hours Progress Bar */}
        <div className="space-y-1.5 mb-3 bg-[#0D1117] p-2.5 rounded-xl border border-[#30363D]/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#8B949E] font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#F0B429]" />
              Horas Mes ({hoursPct}%)
            </span>
            <span className="font-mono font-bold text-[#E6EDF3]">
              {totalMonthHours > 0 ? `${totalMonthHours}h` : "0h"} <span className="text-[#566270]">/ {targetHours}h</span>
            </span>
          </div>
          {/* Progress bar track */}
          <div className="w-full h-1.5 rounded-full bg-[#1C2333] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hoursPct >= 90
                  ? "bg-[#3FB950]"
                  : hoursPct >= 50
                  ? "bg-[#388BFD]"
                  : "bg-[#D29922]"
              }`}
              style={{ width: `${hoursPct}%` }}
            />
          </div>
        </div>

        {/* 3-Column Performance Ribbon */}
        <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-[#1C2333] rounded-xl border border-[#30363D] text-center mb-3">
          {/* Turnos */}
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[#8B949E] block font-semibold flex items-center justify-center gap-1">
              <Calendar className="w-2.5 h-2.5 text-[#388BFD]" />
              Turnos
            </span>
            <span className="text-xs font-bold font-mono text-[#E6EDF3]">
              {shiftsCount > 0 ? `${shiftsCount}` : "0"}
            </span>
          </div>

          {/* Rating */}
          <div className="border-x border-[#30363D]">
            <span className="text-[9px] uppercase tracking-wider text-[#8B949E] block font-semibold flex items-center justify-center gap-1">
              <Star className="w-2.5 h-2.5 text-[#F0B429]" />
              Rating
            </span>
            <span className="text-xs font-bold font-mono text-[#F0B429]">
              {rating.toFixed(1)} ★
            </span>
          </div>

          {/* Ventas */}
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[#8B949E] block font-semibold">
              Ventas
            </span>
            <span className="text-xs font-bold font-mono text-[#3FB950] truncate block" title={`$${totalSales.toLocaleString()}`}>
              {totalSales > 0 ? `$${Math.round(totalSales / 1000)}k` : "$0"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Quick Actions Toolbar */}
      <div className="pt-2 border-t border-[#30363D] space-y-2">
        {/* Contact shortcuts + Quick Fichaje */}
        <div className="flex items-center gap-1.5">
          {/* Phone shortcut */}
          {user.phone ? (
            <a
              href={`tel:${user.phone}`}
              title={`Llamar a ${user.name}: ${user.phone}`}
              className="p-2 rounded-xl bg-[#1C2333] hover:bg-[#21283A] text-[#8B949E] hover:text-[#3FB950] border border-[#30363D] transition-colors flex items-center justify-center"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span
              title="Sin teléfono registrado"
              className="p-2 rounded-xl bg-[#1C2333]/50 text-[#566270] border border-[#30363D]/50 cursor-not-allowed flex items-center justify-center"
            >
              <Phone className="w-3.5 h-3.5" />
            </span>
          )}

          {/* Email shortcut */}
          <a
            href={`mailto:${user.email}`}
            title={`Enviar correo a ${user.email}`}
            className="p-2 rounded-xl bg-[#1C2333] hover:bg-[#21283A] text-[#8B949E] hover:text-[#388BFD] border border-[#30363D] transition-colors flex items-center justify-center"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>

          {/* Quick Check-In / Check-Out button */}
          {isCheckedIn ? (
            <button
              type="button"
              onClick={() => onQuickCheckOut && onQuickCheckOut(user)}
              className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold bg-[#F85149]/15 hover:bg-[#F85149]/25 text-[#F85149] border border-[#F85149]/30 transition-all flex items-center justify-center gap-1"
              title="Fichar salida de turno inmediatamente"
            >
              <LogOut className="w-3 h-3" />
              <span>Cerrar Turno</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onQuickCheckIn && onQuickCheckIn(user)}
              disabled={!user.isActive}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                user.isActive
                  ? "bg-[#3FB950]/15 hover:bg-[#3FB950]/25 text-[#3FB950] border-[#3FB950]/30 shadow-sm"
                  : "bg-[#1C2333] text-[#566270] border-[#30363D] cursor-not-allowed"
              }`}
              title="Fichar entrada en servicio ahora"
            >
              <LogIn className="w-3 h-3" />
              <span>Fichar Entrada</span>
            </button>
          )}

          {/* Toggle status (Activate/Deactivate) */}
          <button
            type="button"
            onClick={() => onToggleStatus(user)}
            title={user.isActive ? "Desactivar acceso" : "Activar colaborador"}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              user.isActive
                ? "bg-[#1C2333] text-[#8B949E] hover:text-[#F85149] hover:border-[#F85149]/40 border-[#30363D]"
                : "bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30 hover:bg-[#3FB950]/25"
            }`}
          >
            {user.isActive ? (
              <LogOut className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Main Inspect Drawer trigger */}
        <button
          type="button"
          onClick={() => onInspect(user)}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#1C2333] hover:bg-[#F0B429] hover:text-[#0D1117] text-[#E6EDF3] border border-[#30363D] hover:border-[#F0B429] transition-all flex items-center justify-center gap-1.5"
        >
          <span>Gestionar Ficha 360°</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
