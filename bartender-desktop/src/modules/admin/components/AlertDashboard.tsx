"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Filter, AlertTriangle, Loader2 } from "lucide-react";
import {
  getAlertTriggers,
  acknowledgeAlertTrigger,
  resolveAlertTrigger,
  type AlertTrigger,
} from "../services/alertService";

export default function AlertDashboard() {
  const [triggers, setTriggers] = useState<AlertTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch triggers
  const fetchTriggers = async () => {
    setLoading(true);
    try {
      const data = await getAlertTriggers({
        status: filterStatus !== "all" ? filterStatus : undefined,
      });
      setTriggers(data);
    } catch (error) {
      console.error("Error fetching alert triggers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggers();
  }, [filterStatus]);

  // Handle acknowledge
  const handleAcknowledge = async (triggerId: string) => {
    try {
      await acknowledgeAlertTrigger(triggerId, "current_user");
      await fetchTriggers();
    } catch (error) {
      console.error("Error acknowledging trigger:", error);
      alert("Error al reconocer alerta");
    }
  };

  // Handle resolve
  const handleResolve = async (triggerId: string) => {
    try {
      await resolveAlertTrigger(triggerId);
      await fetchTriggers();
    } catch (error) {
      console.error("Error resolving trigger:", error);
      alert("Error al resolver alerta");
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-500/20 border-red-500/30 text-red-400";
      case "acknowledged":
        return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400";
      case "resolved":
        return "bg-green-500/20 border-green-500/30 text-green-400";
      default:
        return "bg-fused-bg-tertiary border-fused-glass-border text-fused-text-secondary";
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activa";
      case "acknowledged":
        return "Reconocida";
      case "resolved":
        return "Resuelta";
      default:
        return status;
    }
  };

  // Filter triggers
  const filteredTriggers = triggers;

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-fused-violet/10 border border-fused-violet/20">
            <Bell size={20} className="text-fused-violet" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-fused-text-primary">Historial de Alertas</h2>
            <p className="text-xs text-fused-text-secondary">Monitoreo de disparos de alertas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-fused-glass-border">
            <Filter size={14} className="text-fused-text-muted" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs text-fused-text-primary border-none outline-none cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="acknowledged">Reconocidas</option>
              <option value="resolved">Resueltas</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= TRIGGERS LIST ================= */}
      {loading ? (
        <div className="fused-glass-card p-8 text-center">
          <Loader2 size={32} className="text-fused-text-muted mx-auto animate-spin" />
          <p className="text-fused-text-muted text-sm mt-2">Cargando historial de alertas...</p>
        </div>
      ) : filteredTriggers.length === 0 ? (
        <div className="fused-glass-card p-8 text-center">
          <Bell size={48} className="text-fused-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-fused-text-primary mb-2">No hay alertas registradas</h3>
          <p className="text-fused-text-secondary text-sm">
            {filterStatus === "all"
              ? "No hay disparos de alerta en el historial"
              : `No hay alertas con estado "${getStatusLabel(filterStatus)}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTriggers.map((trigger) => (
            <div key={trigger._id} className="fused-nebula-panel p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-fused-violet/10 border border-fused-violet/20">
                      <AlertTriangle size={16} className="text-fused-violet" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-fused-text-primary">
                          {trigger.ruleName}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadge(
                            trigger.status
                          )}`}
                        >
                          {getStatusLabel(trigger.status)}
                        </span>
                      </div>
                      <p className="text-xs text-fused-text-secondary">
                        {new Date(trigger.triggeredAt).toLocaleString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="bg-fused-bg-tertiary rounded-lg p-3 border border-fused-glass-border">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-fused-text-tertiary">Valor:</span>
                      <span className="text-fused-text-primary font-semibold">
                        {trigger.metricValue}
                      </span>
                      <span className="text-fused-text-tertiary">|</span>
                      <span className="text-fused-text-tertiary">Condición:</span>
                      <span className="text-fused-text-primary font-mono text-xs">
                        {trigger.condition.metric} {trigger.condition.operator}{" "}
                        {trigger.condition.value}
                      </span>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="flex items-center gap-4 text-xs text-fused-text-tertiary">
                    {trigger.acknowledgedAt && (
                      <div className="flex items-center gap-1">
                        <Check size={12} />
                        <span>Reconocida: {new Date(trigger.acknowledgedAt).toLocaleString("es-MX")}</span>
                      </div>
                    )}
                    {trigger.resolvedAt && (
                      <div className="flex items-center gap-1">
                        <Check size={12} />
                        <span>Resuelta: {new Date(trigger.resolvedAt).toLocaleString("es-MX")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {trigger.status === "active" && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(trigger._id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all"
                      >
                        <Check size={14} />
                        Reconocer
                      </button>
                      <button
                        onClick={() => handleResolve(trigger._id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all"
                      >
                        <Check size={14} />
                        Resolver
                      </button>
                    </>
                  )}
                  {trigger.status === "acknowledged" && (
                    <button
                      onClick={() => handleResolve(trigger._id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all"
                    >
                      <Check size={14} />
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
