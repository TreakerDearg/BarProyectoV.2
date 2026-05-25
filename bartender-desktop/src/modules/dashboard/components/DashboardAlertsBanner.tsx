"use client";

import { X, AlertTriangle } from "lucide-react";
import { useDashboardStore } from "../store/dashboardStore";

export default function DashboardAlertsBanner() {
  const alerts = useDashboardStore((s) => s.alerts);
  const dismissAlert = useDashboardStore((s) => s.dismissAlert);

  if (alerts.length === 0) return null;

  const top = alerts[0];
  const severityClass =
    top.severity === "high"
      ? "border-red/30 bg-red/10 text-red"
      : top.severity === "medium"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
        : "border-violet-400/20 bg-violet-500/10 text-violet-200";

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border ${severityClass}`}
      role="alert"
    >
      <div className="flex items-center gap-3 min-w-0">
        <AlertTriangle size={18} className="shrink-0" />
        <p className="text-sm font-medium truncate">{top.message}</p>
        {alerts.length > 1 && (
          <span className="text-xs opacity-70 shrink-0">
            +{alerts.length - 1} más
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismissAlert(top.id)}
        className="p-1 rounded-lg hover:bg-black/20 shrink-0"
        aria-label="Cerrar alerta"
      >
        <X size={16} />
      </button>
    </div>
  );
}
