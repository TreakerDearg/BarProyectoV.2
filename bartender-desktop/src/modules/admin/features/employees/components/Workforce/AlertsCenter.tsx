/**
 * ALERTS CENTER
 * Centro de alertas inteligentes para gestión del personal
 */

"use client";

import { AlertTriangle, Clock, User, Shield, Activity, X, Check } from "lucide-react";

export type AlertType = "no_shift" | "multiple_absences" | "excess_hours" | "suspicious_session" | "low_performance" | "permission_change" | "compliance_issue";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  employeeId?: string;
  employeeName?: string;
  timestamp: Date;
  isResolved: boolean;
  metadata?: Record<string, any>;
}

interface Props {
  alerts: Alert[];
  onResolve?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  onAlertClick?: (alert: Alert) => void;
}

const ALERT_CONFIGS: Record<AlertType, { label: string; icon: any; color: string }> = {
  no_shift: {
    label: "Sin Turno Asignado",
    icon: Clock,
    color: "text-amber-400",
  },
  multiple_absences: {
    label: "Múltiples Ausencias",
    icon: X,
    color: "text-red-400",
  },
  excess_hours: {
    label: "Horas Excesivas",
    icon: Clock,
    color: "text-orange-400",
  },
  suspicious_session: {
    label: "Sesión Sospechosa",
    icon: Shield,
    color: "text-purple-400",
  },
  low_performance: {
    label: "Rendimiento Bajo",
    icon: Activity,
    color: "text-red-400",
  },
  permission_change: {
    label: "Cambio de Permisos",
    icon: Shield,
    color: "text-blue-400",
  },
  compliance_issue: {
    label: "Incumplimiento",
    icon: AlertTriangle,
    color: "text-red-400",
  },
};

const SEVERITY_CONFIGS: Record<AlertSeverity, { label: string; bgColor: string; borderColor: string }> = {
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

export function AlertsCenter({ alerts, onResolve, onDismiss, onAlertClick }: Props) {
  const unresolvedAlerts = alerts.filter((alert) => !alert.isResolved);
  const resolvedAlerts = alerts.filter((alert) => alert.isResolved);

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 rounded-xl">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Centro de Alertas</h2>
            <p className="text-sm text-gray-400">Notificaciones inteligentes del sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {unresolvedAlerts.length} pendientes
          </span>
        </div>
      </div>

      {/* Alertas No Resueltas */}
      {unresolvedAlerts.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-bold text-white mb-3">Alertas Pendientes</h3>
          {unresolvedAlerts.map((alert) => (
            <AlertCard
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
            <AlertCard
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
          <Check size={48} className="text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-400">No hay alertas activas</p>
          <p className="text-sm text-gray-500 mt-2">Todo está funcionando correctamente</p>
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert, onResolve, onDismiss, onClick }: { alert: Alert; onResolve?: (id: string) => void; onDismiss?: (id: string) => void; onClick?: (alert: Alert) => void }) {
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
          <Icon size={16} className={alert.isResolved ? "text-gray-400" : config.color} />
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
          {alert.employeeName && (
            <div className="flex items-center gap-2 mt-2">
              <User size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400">{alert.employeeName}</span>
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
              <Check size={14} className="text-emerald-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss?.(alert.id);
              }}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
              aria-label="Descartar alerta"
            >
              <X size={14} className="text-red-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
