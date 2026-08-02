/**
 * TRAINING SECTION
 * Sección de capacitación preparada para integración LMS
 */

"use client";

import { GraduationCap, Award, BookOpen, Clock, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";

export type TrainingType = "course" | "certification" | "internal" | "onboarding";
export type TrainingStatus = "completed" | "in_progress" | "pending" | "expired";

interface Training {
  id: string;
  type: TrainingType;
  name: string;
  description?: string;
  completionDate?: Date;
  certificateUrl?: string;
  status: TrainingStatus;
  score?: number;
  duration?: number;
  provider?: string;
  expiryDate?: Date;
}

interface Props {
  trainings: Training[];
  onAddTraining?: (training: Omit<Training, "id">) => void;
  onViewCertificate?: (trainingId: string) => void;
}

const TRAINING_TYPE_CONFIGS: Record<TrainingType, { label: string; icon: any; color: string }> = {
  course: {
    label: "Curso",
    icon: BookOpen,
    color: "text-blue-400",
  },
  certification: {
    label: "Certificación",
    icon: Award,
    color: "text-emerald-400",
  },
  internal: {
    label: "Capacitación Interna",
    icon: GraduationCap,
    color: "text-purple-400",
  },
  onboarding: {
    label: "Onboarding",
    icon: CheckCircle,
    color: "text-amber-400",
  },
};

const TRAINING_STATUS_CONFIGS: Record<TrainingStatus, { label: string; icon: any; color: string; bgColor: string }> = {
  completed: {
    label: "Completado",
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20 border-emerald-500/30",
  },
  in_progress: {
    label: "En Progreso",
    icon: Clock,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20 border-blue-500/30",
  },
  pending: {
    label: "Pendiente",
    icon: AlertTriangle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
  },
  expired: {
    label: "Vencido",
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-500/20 border-red-500/30",
  },
};

export function TrainingSection({ trainings, onAddTraining, onViewCertificate }: Props) {
  const completedTrainings = trainings.filter((t) => t.status === "completed");
  const inProgressTrainings = trainings.filter((t) => t.status === "in_progress");
  const pendingTrainings = trainings.filter((t) => t.status === "pending");
  const expiredTrainings = trainings.filter((t) => t.status === "expired");

  const totalTrainings = trainings.length;
  const completionRate = totalTrainings > 0 ? Math.round((completedTrainings.length / totalTrainings) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <GraduationCap size={24} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Capacitación</h2>
          <p className="text-sm text-gray-400">Formación y certificaciones</p>
        </div>
      </div>

      {/* Métricas de Capacitación */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{totalTrainings}</p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Completados</p>
          <p className="text-2xl font-bold text-emerald-400">{completedTrainings.length}</p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">En Progreso</p>
          <p className="text-2xl font-bold text-blue-400">{inProgressTrainings.length}</p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tasa de Completado</p>
          <p className="text-2xl font-bold text-purple-400">{completionRate}%</p>
        </div>
      </div>

      {/* Alertas de Capacitación */}
      {(pendingTrainings.length > 0 || expiredTrainings.length > 0) && (
        <div className="mb-6 space-y-2">
          {pendingTrainings.length > 0 && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" aria-hidden="true" />
              <span className="text-sm text-amber-400">
                {pendingTrainings.length} capacitación(es) pendiente(s)
              </span>
            </div>
          )}
          {expiredTrainings.length > 0 && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" aria-hidden="true" />
              <span className="text-sm text-red-400">
                {expiredTrainings.length} capacitación(es) vencida(s)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Lista de Capacitaciones */}
      <div className="space-y-3">
        {trainings.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay capacitaciones registradas
          </div>
        ) : (
          trainings.map((training) => {
            const typeConfig = TRAINING_TYPE_CONFIGS[training.type];
            const statusConfig = TRAINING_STATUS_CONFIGS[training.status];
            const TypeIcon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={training.id}
                className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                    <TypeIcon size={16} className={typeConfig.color} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{training.name}</h4>
                        {training.description && (
                          <p className="text-xs text-gray-400 mt-1">{training.description}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded ${statusConfig.bgColor}`}>
                        <StatusIcon size={12} className={statusConfig.color} aria-hidden="true" />
                        <span className={`text-[10px] font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400">
                      {training.completionDate && (
                        <span>
                          Completado: {new Date(training.completionDate).toLocaleDateString()}
                        </span>
                      )}
                      {training.score !== undefined && (
                        <span>Calificación: {training.score}/100</span>
                      )}
                      {training.duration && (
                        <span>Duración: {training.duration}h</span>
                      )}
                      {training.provider && (
                        <span>Proveedor: {training.provider}</span>
                      )}
                      {training.expiryDate && (
                        <span>
                          Vence: {new Date(training.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {training.certificateUrl && onViewCertificate && (
                    <button
                      onClick={() => onViewCertificate(training.id)}
                      className="p-2 hover:bg-blue-500/20 rounded transition-colors"
                      aria-label="Ver certificado"
                    >
                      <ExternalLink size={14} className="text-blue-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Nota de Integración LMS */}
      <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <ExternalLink size={14} className="text-blue-400" aria-hidden="true" />
          <p className="text-xs text-blue-400">
            Preparado para integración con sistema LMS para gestión de capacitaciones
          </p>
        </div>
      </div>
    </div>
  );
}
