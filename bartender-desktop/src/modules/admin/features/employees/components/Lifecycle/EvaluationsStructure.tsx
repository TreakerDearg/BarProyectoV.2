/**
 * EVALUATIONS STRUCTURE
 * Estructura preparada para evaluaciones de desempeño
 */

"use client";

import { Target, MessageSquare, Calendar, TrendingUp, Award, CheckCircle } from "lucide-react";

export type EvaluationPeriod = "monthly" | "quarterly" | "semi_annual" | "annual" | "special";
export type EvaluationStatus = "pending" | "in_progress" | "completed" | "archived";

interface Objective {
  id: string;
  description: string;
  target: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "missed";
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

interface Evaluation {
  id: string;
  period: EvaluationPeriod;
  startDate: Date;
  endDate: Date;
  overallScore?: number;
  objectives: Objective[];
  comments: Comment[];
  evaluator: string;
  evaluationDate?: Date;
  status: EvaluationStatus;
}

interface Props {
  evaluations: Evaluation[];
  onAddEvaluation?: (evaluation: Omit<Evaluation, "id">) => void;
  onViewEvaluation?: (evaluationId: string) => void;
}

const PERIOD_CONFIGS: Record<EvaluationPeriod, { label: string; icon: any; color: string }> = {
  monthly: {
    label: "Mensual",
    icon: Calendar,
    color: "text-blue-400",
  },
  quarterly: {
    label: "Trimestral",
    icon: Calendar,
    color: "text-emerald-400",
  },
  semi_annual: {
    label: "Semestral",
    icon: Calendar,
    color: "text-purple-400",
  },
  annual: {
    label: "Anual",
    icon: Calendar,
    color: "text-amber-400",
  },
  special: {
    label: "Especial",
    icon: Target,
    color: "text-red-400",
  },
};

const STATUS_CONFIGS: Record<EvaluationStatus, { label: string; icon: any; color: string; bgColor: string }> = {
  pending: {
    label: "Pendiente",
    icon: Calendar,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
  },
  in_progress: {
    label: "En Progreso",
    icon: TrendingUp,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20 border-blue-500/30",
  },
  completed: {
    label: "Completado",
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20 border-emerald-500/30",
  },
  archived: {
    label: "Archivado",
    icon: Award,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20 border-gray-500/30",
  },
};

export function EvaluationsStructure({ evaluations, onAddEvaluation, onViewEvaluation }: Props) {
  const completedEvaluations = evaluations.filter((e) => e.status === "completed");
  const pendingEvaluations = evaluations.filter((e) => e.status === "pending");
  const inProgressEvaluations = evaluations.filter((e) => e.status === "in_progress");

  const averageScore = completedEvaluations.length > 0
    ? completedEvaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0) / completedEvaluations.length
    : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <Award size={24} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Evaluaciones</h2>
          <p className="text-sm text-gray-400">Evaluaciones de desempeño</p>
        </div>
      </div>

      {/* Métricas de Evaluaciones */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{evaluations.length}</p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Completadas</p>
          <p className="text-2xl font-bold text-emerald-400">{completedEvaluations.length}</p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-amber-400">{pendingEvaluations.length}</p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Promedio</p>
          <p className="text-2xl font-bold text-purple-400">{averageScore.toFixed(1)}/5</p>
        </div>
      </div>

      {/* Alertas de Evaluaciones */}
      {pendingEvaluations.length > 0 && (
        <div className="mb-6 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-2">
          <Calendar size={16} className="text-amber-400" aria-hidden="true" />
          <span className="text-sm text-amber-400">
            {pendingEvaluations.length} evaluación(es) pendiente(s)
          </span>
        </div>
      )}

      {/* Lista de Evaluaciones */}
      <div className="space-y-3">
        {evaluations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay evaluaciones registradas
          </div>
        ) : (
          evaluations.map((evaluation) => {
            const periodConfig = PERIOD_CONFIGS[evaluation.period];
            const statusConfig = STATUS_CONFIGS[evaluation.status];
            const PeriodIcon = periodConfig.icon;
            const StatusIcon = statusConfig.icon;

            const completedObjectives = evaluation.objectives.filter((o) => o.status === "completed").length;
            const objectiveProgress = evaluation.objectives.length > 0
              ? Math.round((completedObjectives / evaluation.objectives.length) * 100)
              : 0;

            return (
              <div
                key={evaluation.id}
                className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                    <PeriodIcon size={16} className={periodConfig.color} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${periodConfig.color}`}>
                          {periodConfig.label}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">
                          {new Date(evaluation.startDate).toLocaleDateString()} - {new Date(evaluation.endDate).toLocaleDateString()}
                        </h4>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded ${statusConfig.bgColor}`}>
                        <StatusIcon size={12} className={statusConfig.color} aria-hidden="true" />
                        <span className={`text-[10px] font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Objetivos */}
                    {evaluation.objectives.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                          <span>Objetivos: {completedObjectives}/{evaluation.objectives.length}</span>
                          <span>{objectiveProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500"
                            style={{ width: `${objectiveProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Comentarios */}
                    {evaluation.comments.length > 0 && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <MessageSquare size={12} className="text-gray-400" aria-hidden="true" />
                        <span>{evaluation.comments.length} comentario(s)</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-2">
                      <span>Evaluador: {evaluation.evaluator}</span>
                      {evaluation.evaluationDate && (
                        <span>
                          Evaluado: {new Date(evaluation.evaluationDate).toLocaleDateString()}
                        </span>
                      )}
                      {evaluation.overallScore !== undefined && (
                        <span>Puntuación: {evaluation.overallScore}/5</span>
                      )}
                    </div>
                  </div>
                  {onViewEvaluation && (
                    <button
                      onClick={() => onViewEvaluation(evaluation.id)}
                      className="p-2 hover:bg-blue-500/20 rounded transition-colors"
                      aria-label="Ver evaluación"
                    >
                      <Target size={14} className="text-blue-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Nota de Implementación Futura */}
      <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-emerald-400" aria-hidden="true" />
          <p className="text-xs text-emerald-400">
            Estructura preparada para implementación completa de evaluaciones de desempeño
          </p>
        </div>
      </div>
    </div>
  );
}
