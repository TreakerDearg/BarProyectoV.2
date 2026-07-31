/**
 * EMPLOYMENT HISTORY
 * Historial laboral completo del empleado
 */

"use client";

import { History, Briefcase, Award, AlertTriangle, Calendar, TrendingUp, Shield, UserPlus } from "lucide-react";

export type HistoryEventType = "hire" | "promotion" | "role_change" | "schedule_change" | "evaluation" | "sanction" | "permission_change" | "compliance_issue";

interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  date: Date;
  title: string;
  description: string;
  metadata?: {
    previousValue?: string;
    newValue?: string;
    evaluator?: string;
    reason?: string;
  };
}

interface Props {
  events: HistoryEvent[];
}

const EVENT_CONFIGS: Record<HistoryEventType, { label: string; icon: any; color: string; bgColor: string }> = {
  hire: {
    label: "Ingreso",
    icon: UserPlus,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20 border-emerald-500/30",
  },
  promotion: {
    label: "Promoción",
    icon: Award,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
  },
  role_change: {
    label: "Cambio de Rol",
    icon: Briefcase,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20 border-blue-500/30",
  },
  schedule_change: {
    label: "Cambio de Horario",
    icon: Calendar,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20 border-purple-500/30",
  },
  evaluation: {
    label: "Evaluación",
    icon: TrendingUp,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20 border-cyan-500/30",
  },
  sanction: {
    label: "Sanción",
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-500/20 border-red-500/30",
  },
  permission_change: {
    label: "Cambio de Permisos",
    icon: Shield,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20 border-pink-500/30",
  },
  compliance_issue: {
    label: "Incumplimiento",
    icon: AlertTriangle,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20 border-orange-500/30",
  },
};

export function EmploymentHistory({ events }: Props) {
  const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-500/20 rounded-xl">
          <History size={24} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Historial Laboral</h2>
          <p className="text-sm text-gray-400">Cronología completa del empleado</p>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="p-8 text-center">
          <History size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay eventos registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map((event, index) => {
            const config = EVENT_CONFIGS[event.type];
            const Icon = config.icon;

            return (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  {index < sortedEvents.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-700 mt-2" />
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`text-xs font-bold ${config.color} uppercase tracking-wider`}>
                        {config.label}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{event.title}</h3>
                    </div>
                    <span className="text-xs text-gray-400">
                      {event.date.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-2">{event.description}</p>

                  {event.metadata && (
                    <div className="space-y-1">
                      {event.metadata.previousValue && event.metadata.newValue && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400">Cambio:</span>
                          <span className="text-red-400 line-through">{event.metadata.previousValue}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-emerald-400">{event.metadata.newValue}</span>
                        </div>
                      )}
                      {event.metadata.evaluator && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400">Evaluador:</span>
                          <span className="text-white">{event.metadata.evaluator}</span>
                        </div>
                      )}
                      {event.metadata.reason && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400">Razón:</span>
                          <span className="text-white">{event.metadata.reason}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
