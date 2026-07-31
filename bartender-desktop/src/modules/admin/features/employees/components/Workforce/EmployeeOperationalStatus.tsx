/**
 * EMPLOYEE OPERATIONAL STATUS
 * Estado operativo del personal en tiempo real
 */

"use client";

import { Circle, Wifi, Clock, Coffee, X, AlertCircle, UserX } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

export type OperationalStatus = "online" | "offline" | "on_shift" | "on_break" | "shift_ended" | "absent" | "suspended" | "inactive";

export function getOperationalStatus(employee: Employee): OperationalStatus {
  if (!employee.isActive) return "inactive";
  if (employee.lockedUntil && new Date(employee.lockedUntil) > new Date()) return "suspended";
  
  const attendance = employee.attendance as any;
  if (attendance?.currentStatus === "absent") return "absent";
  if (attendance?.currentStatus === "break") return "on_break";
  if (attendance?.currentStatus === "checked-in") return "on_shift";
  if (attendance?.currentStatus === "checked-out") return "shift_ended";
  
  // Si no tiene estado de asistencia, verificar si está en línea
  if (employee.activeSessions && employee.activeSessions > 0) return "online";
  
  return "offline";
}

export function getOperationalStatusConfig(status: OperationalStatus) {
  const configs: Record<OperationalStatus, { label: string; icon: any; color: string; bgColor: string }> = {
    online: {
      label: "En línea",
      icon: Wifi,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/20",
    },
    offline: {
      label: "Fuera de línea",
      icon: Circle,
      color: "text-gray-400",
      bgColor: "bg-gray-400/20",
    },
    on_shift: {
      label: "En turno",
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-400/20",
    },
    on_break: {
      label: "En descanso",
      icon: Coffee,
      color: "text-purple-400",
      bgColor: "bg-purple-400/20",
    },
    shift_ended: {
      label: "Turno finalizado",
      icon: X,
      color: "text-blue-400",
      bgColor: "bg-blue-400/20",
    },
    absent: {
      label: "Ausente",
      icon: AlertCircle,
      color: "text-red-400",
      bgColor: "bg-red-400/20",
    },
    suspended: {
      label: "Suspendido",
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-600/20",
    },
    inactive: {
      label: "Inactivo",
      icon: X,
      color: "text-gray-500",
      bgColor: "bg-gray-500/20",
    },
  };

  return configs[status];
}

export function EmployeeOperationalStatus({ employee }: Props) {
  const status = getOperationalStatus(employee);
  const config = getOperationalStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2" role="status" aria-label={`Estado operativo: ${config.label}`}>
      <div className={`p-2 rounded-lg ${config.bgColor}`}>
        <Icon size={14} className={config.color} aria-hidden="true" />
      </div>
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}
