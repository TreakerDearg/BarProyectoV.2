/**
 * UNIFIED TIMELINE
 * Línea de tiempo unificada del empleado
 */

"use client";

import { History, Briefcase, Shield, Calendar, Clock, Activity, UserPlus, Award, AlertTriangle, FileText, Coffee } from "lucide-react";

export type TimelineEventType = 
  | "role_change" 
  | "permission_change" 
  | "session" 
  | "attendance" 
  | "profile_update" 
  | "status_change" 
  | "document_upload" 
  | "training_complete" 
  | "evaluation" 
  | "request" 
  | "vacation" 
  | "leave";

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: Date;
  title: string;
  description: string;
  metadata?: {
    previousValue?: string;
    newValue?: string;
    author?: string;
    location?: string;
  };
}

interface Props {
  events: TimelineEvent[];
}

const EVENT_CONFIGS: Record<TimelineEventType, { label: string; icon: any; color: string; bgColor: string }> = {
  role_change: {
    label: "Cambio de Rol",
    icon: Briefcase,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20 border-blue-500/30",
  },
  permission_change: {
    label: "Cambio de Permisos",
    icon: Shield,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20 border-purple-500/30",
  },
  session: {
    label: "Sesión",
    icon: Shield,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20 border-cyan-500/30",
  },
  attendance: {
    label: "Asistencia",
    icon: Calendar,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20 border-emerald-500/30",
  },
  profile_update: {
    label: "Actualización de Perfil",
    icon: UserPlus,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
  },
  status_change: {
    label: "Cambio de Estado",
    icon: Award,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20 border-pink-500/30",
  },
  document_upload: {
    label: "Documento",
    icon: FileText,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20 border-indigo-500/30",
  },
  training_complete: {
    label: "Capacitación",
    icon: Award,
    color: "text-teal-400",
    bgColor: "bg-teal-500/20 border-teal-500/30",
  },
  evaluation: {
    label: "Evaluación",
    icon: Award,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20 border-orange-500/30",
  },
  request: {
    label: "Solicitud",
    icon: FileText,
    color: "text-lime-400",
    bgColor: "bg-lime-500/20 border-lime-500/30",
  },
  vacation: {
    label: "Vacaciones",
    icon: Coffee,
    color: "text-sky-400",
    bgColor: "bg-sky-500/20 border-sky-500/30",
  },
  leave: {
    label: "Licencia",
    icon: Coffee,
    color: "text-rose-400",
    bgColor: "bg-rose-500/20 border-rose-500/30",
  },
};

export function UnifiedTimeline({ events }: Props) {
  const sortedEvents = [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const dateKey = event.timestamp.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-500/20 rounded-xl">
          <History size={24} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Línea de Tiempo Unificada</h2>
          <p className="text-sm text-gray-400">Historial completo del empleado</p>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="p-8 text-center">
          <History size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay eventos registrados</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
            <div key={dateKey}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                {new Date(dateKey).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="space-y-3">
                {dayEvents.map((event, index) => {
                  const config = EVENT_CONFIGS[event.type];
                  const Icon = config.icon;

                  return (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <Icon size={16} className={config.color} aria-hidden="true" />
                        </div>
                        {index < dayEvents.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-700 mt-2" />
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                              {config.label}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1">{event.title}</h4>
                          </div>
                          <span className="text-xs text-gray-400">
                            {event.timestamp.toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
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
                            {event.metadata.author && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-400">Autor:</span>
                                <span className="text-white">{event.metadata.author}</span>
                              </div>
                            )}
                            {event.metadata.location && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-400">Ubicación:</span>
                                <span className="text-white">{event.metadata.location}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
