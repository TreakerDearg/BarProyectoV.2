/**
 * EMPLOYMENT STATUS
 * Gestión de estados laborales del empleado
 */

"use client";

import { UserPlus, Clock, CheckCircle, GraduationCap, Coffee, AlertTriangle, PauseCircle, LogOut, Archive } from "lucide-react";

export type EmploymentStatus = "candidate" | "pending" | "active" | "training" | "on_leave" | "suspended" | "temporary_leave" | "terminated" | "archived";

interface EmploymentStatusHistory {
  status: EmploymentStatus;
  changedAt: Date;
  changedBy: string;
  reason?: string;
}

interface Props {
  currentStatus: EmploymentStatus;
  history: EmploymentStatusHistory[];
  onStatusChange?: (newStatus: EmploymentStatus, reason?: string) => void;
}

const STATUS_CONFIGS: Record<EmploymentStatus, { label: string; icon: any; color: string; bgColor: string; description: string; allowedTransitions: EmploymentStatus[] }> = {
  candidate: {
    label: "Candidato",
    icon: UserPlus,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20 border-blue-500/30",
    description: "En proceso de selección",
    allowedTransitions: ["pending", "archived"],
  },
  pending: {
    label: "Pendiente de Incorporación",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
    description: "Aceptado, pendiente de incorporación",
    allowedTransitions: ["active", "training", "archived"],
  },
  active: {
    label: "Activo",
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20 border-emerald-500/30",
    description: "Empleado activo",
    allowedTransitions: ["training", "on_leave", "suspended", "temporary_leave", "terminated"],
  },
  training: {
    label: "En Capacitación",
    icon: GraduationCap,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20 border-purple-500/30",
    description: "En período de capacitación",
    allowedTransitions: ["active", "suspended", "terminated"],
  },
  on_leave: {
    label: "En Licencia",
    icon: Coffee,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20 border-cyan-500/30",
    description: "En licencia autorizada",
    allowedTransitions: ["active", "suspended", "terminated"],
  },
  suspended: {
    label: "Suspendido",
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-500/20 border-red-500/30",
    description: "Suspendido temporalmente",
    allowedTransitions: ["active", "terminated"],
  },
  temporary_leave: {
    label: "Baja Temporal",
    icon: PauseCircle,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20 border-orange-500/30",
    description: "Baja temporal por motivos personales",
    allowedTransitions: ["active", "terminated"],
  },
  terminated: {
    label: "Desvinculado",
    icon: LogOut,
    color: "text-red-500",
    bgColor: "bg-red-500/20 border-red-500/30",
    description: "Desvinculado de la organización",
    allowedTransitions: ["archived"],
  },
  archived: {
    label: "Archivado",
    icon: Archive,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20 border-gray-500/30",
    description: "Registro archivado",
    allowedTransitions: [],
  },
};

export function EmploymentStatus({ currentStatus, history, onStatusChange }: Props) {
  const config = STATUS_CONFIGS[currentStatus];
  const Icon = config.icon;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${config.bgColor}`}>
          <Icon size={24} className={config.color} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Estado Laboral</h2>
          <p className="text-sm text-gray-400">Gestión del ciclo de vida del empleado</p>
        </div>
      </div>

      {/* Estado Actual */}
      <div className={`p-4 rounded-xl border ${config.bgColor} mb-6`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
            Estado Actual
          </span>
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon size={16} className={config.color} aria-hidden="true" />
          </div>
        </div>
        <h3 className={`text-2xl font-bold ${config.color} mb-1`}>{config.label}</h3>
        <p className="text-sm text-gray-300">{config.description}</p>
      </div>

      {/* Transiciones Disponibles */}
      {config.allowedTransitions.length > 0 && onStatusChange && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-white mb-3">Cambiar Estado</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {config.allowedTransitions.map((transition) => {
              const transitionConfig = STATUS_CONFIGS[transition];
              const TransitionIcon = transitionConfig.icon;

              return (
                <button
                  key={transition}
                  onClick={() => onStatusChange(transition)}
                  className={`p-3 rounded-lg border transition-all hover:scale-105 ${transitionConfig.bgColor} hover:opacity-80`}
                  aria-label={`Cambiar a ${transitionConfig.label}`}
                >
                  <div className="flex items-center gap-2">
                    <TransitionIcon size={14} className={transitionConfig.color} aria-hidden="true" />
                    <span className={`text-xs font-medium ${transitionConfig.color}`}>
                      {transitionConfig.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Historial de Cambios */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3">Historial de Cambios</h4>
        {history.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No hay cambios de estado registrados
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry, index) => {
              const entryConfig = STATUS_CONFIGS[entry.status];
              const EntryIcon = entryConfig.icon;

              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${entryConfig.bgColor}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${entryConfig.bgColor}`}>
                      <EntryIcon size={14} className={entryConfig.color} aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${entryConfig.color}`}>
                          {entryConfig.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(entry.changedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Cambiado por: {entry.changedBy}
                      </p>
                      {entry.reason && (
                        <p className="text-[10px] text-gray-300 mt-1">
                          Razón: {entry.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>,</div>
  );
}
