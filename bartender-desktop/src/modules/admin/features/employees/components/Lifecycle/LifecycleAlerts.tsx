/**
 * LIFECYCLE ALERTS
 * Centro de alertas administrativas para Employee Lifecycle
 */

"use client";

import { FileText, GraduationCap, Clock, Shield, AlertTriangle, Calendar, CheckCircle, XCircle } from "lucide-react";

export type LifecycleAlertType = 
  | "expired_document" 
  | "pending_training" 
  | "excess_hours" 
  | "inconsistent_permissions" 
  | "failed_login_attempts" 
  | "unassigned_shift";

export type LifecycleAlertSeverity = "low" | "medium" | "high" | "critical";

interface LifecycleAlert {
  id: string;
  type: LifecycleAlertType;
  severity: LifecycleAlertSeverity;
  message: string;
  description?: string;
  timestamp: Date;
  isResolved: boolean;
  metadata?: {
    documentName?: string;
    trainingName?: string;
    hoursWorked?: number;
    permissionName?: string;
    attemptCount?: number;
    shiftDate?: string;
  };
}

interface Props {
  alerts: LifecycleAlert[];
  onResolve?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  onAlertClick?: (alert: LifecycleAlert) => void;
}

const ALERT_CONFIGS: Record<LifecycleAlertType, { label: string; icon: any; color: string }> = {
  expired_document: {
    label: "Documentación Vencida",
    icon: FileText,
    color: "text-red-400",
  },
  pending_training: {
    label: "Capacitación Pendiente",
    icon: GraduationCap,
    color: "text-amber-400",
  },
  excess_hours: {
    label: "Exceso de Horas",
    icon: Clock,
    color: "text-orange-400",
  },
  inconsistent_permissions: {
    label: "Permisos Inconsistentes",
    icon: Shield,
    color: "text-purple-400",
  },
  failed_login_attempts: {
    label: "Intentos Fallidos",
    icon: AlertTriangle,
    color: "text-red-400",
  },
  unassigned_shift: {
    label: "Turno Sin Asignar",
    icon: Calendar,
    color: "text-cyan-400",
  },
};

const SEVERITY_CONFIGS: Record<LifecycleAlertSeverity, { label: string; bgColor: string; borderColor: string }> = {
  low: {
    label: "Baja",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  medium: {
    label: "Media",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  high: {
    label: "Alta",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  critical: {
    label: "Crítica",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
};

export function LifecycleAlerts({ alerts, onResolve, onDismiss, onAlertClick }: Props) {
  const unresolvedAlerts = alerts.filter((alert) => !alert.isResolved);
  const resolvedAlerts = alerts.filter((alert) => alert.isResolved);

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-500/20 rounded-xl">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Centro de Alertas</h2>
          <p className="text-sm text-gray-400">Alertas administrativas del ciclo de vida</p>
        </div>
      </div>

      {/* Alertas No Resueltas */}
      {unresolvedAlerts.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-bold text-white mb-3">Alertas Pendientes</h3>
          {unresolvedAlerts.map((alert) => (
            <LifecycleAlertCard
              key={alert.id}
              alert={alert}
              onResolve={onResolve}
              onDismiss={onDismiss}
              onClick={onAlertClick}
            />
          ))}
        </div>
      )}

      {/* Alertas Resueltas */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white mb-3">Alertas Resueltas</h3>
          {resolvedAlerts.map((alert) => (
            <LifecycleAlertCard
              key={alert.id}
              alert={alert}
              onResolve={onResolve}
              onDismiss={onDismiss}
              onClick={onAlertClick}
            />
          ))}
        </div>
      )}

      {/* Sin Alertas */}
      {alerts.length === 0 && (
        <div className="p-8 text-center">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-400">No hay alertas activas</p>
          <p className="text-sm text-gray-500 mt-2">Todo está funcionando correctamente</p>
        </div>
      )}
    </div>
  );
}

function LifecycleAlertCard({ alert, onResolve, onDismiss, onClick }: { alert: LifecycleAlert; onResolve?: (id: string) => void; onDismiss?: (id: string) => void; onClick?: (alert: LifecycleAlert) => void }) {
  const config = ALERT_CONFIGS[alert.type];
  const severityConfig = SEVERITY_CONFIGS[alert.severity];
  const Icon = config.icon;

  return (
    <div
      onClick={() => onClick?.(alert)}
      className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
        alert.isResolved
          ? "bg-gray-700/20 border-gray-600/30 opacity-60"
          : severityConfig.bgColor + " " + severityConfig.borderColor
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${alert.isResolved ? "bg-gray-600/30" : "bg-gray-700/50"}`}>
          <Icon size={16} className={alert.isResolved ? "text-gray-400" : config.color} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold ${alert.isResolved ? "text-gray-400" : "text-white"}`}>
              {config.label}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded ${
              alert.isResolved
                ? "bg-gray-600/30 text-gray-400"
                : severityConfig.bgColor + " " + severityConfig.borderColor.replace("border", "text")
            }`}>
              {severityConfig.label}
            </span>
          </div>
          <p className={`text-sm ${alert.isResolved ? "text-gray-400" : "text-white"}`}>
            {alert.message}
          </p>
          {alert.description && (
            <p className="text-xs text-gray-400 mt-1">{alert.description}</p>
          )}
          {alert.metadata && (
            <div className="mt-2 space-y-1">
              {alert.metadata.documentName && (
                <div className="text-[10px] text-gray-400">
                  Documento: {alert.metadata.documentName}
                </div>
              )}
              {alert.metadata.trainingName && (
                <div className="text-[10px] text-gray-400">
                  Capacitación: {alert.metadata.trainingName}
                </div>
              )}
              {alert.metadata.hoursWorked !== undefined && (
                <div className="text-[10px] text-gray-400">
                  Horas trabajadas: {alert.metadata.hoursWorked}h
                </div>
              )}
              {alert.metadata.permissionName && (
                <div className="text-[10px] text-gray-400">
                  Permiso: {alert.metadata.permissionName}
                </div>
              )}
              {alert.metadata.attemptCount !== undefined && (
                <div className="text-[10px] text-gray-400">
                  Intentos: {alert.metadata.attemptCount}
                </div>
              )}
              {alert.metadata.shiftDate && (
                <div className="text-[10px] text-gray-400">
                  Fecha del turno: {alert.metadata.shiftDate}
                </div>
              )}
            </div>
          )}
          <p className="text-[10px] text-gray-500 mt-1">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        {!alert.isResolved && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve?.(alert.id);
              }}
              className="p-1 hover:bg-emerald-500/20 rounded transition-colors"
              aria-label="Resolver alerta"
            >
              <CheckCircle size={14} className="text-emerald-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss?.(alert.id);
              }}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
              aria-label="Descartar alerta"
            >
              <XCircle size={14} className="text-red-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
