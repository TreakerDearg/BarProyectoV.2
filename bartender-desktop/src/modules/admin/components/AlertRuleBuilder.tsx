"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X, Info } from "lucide-react";
import {
  type AlertRule,
  type AlertCondition,
  type AlertAction,
  type NotificationChannel,
  getAvailableMetrics,
  getAvailableOperators,
  getConditionTypes,
  getNotificationChannels,
} from "../services/alertService";

interface AlertRuleBuilderProps {
  initialRule?: AlertRule;
  onSubmit: (rule: Omit<AlertRule, "_id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  saving: boolean;
}

export default function AlertRuleBuilder({
  initialRule,
  onSubmit,
  onCancel,
  saving,
}: AlertRuleBuilderProps) {
  const [formData, setFormData] = useState<Omit<AlertRule, "_id" | "createdAt" | "updatedAt">>({
    name: initialRule?.name || "",
    description: initialRule?.description || "",
    enabled: initialRule?.enabled ?? true,
    condition: initialRule?.condition || {
      type: "threshold",
      metric: "orders.total",
      operator: ">",
      value: 100,
      timeWindow: "1h",
      aggregation: "sum",
    },
    actions: initialRule?.actions || [
      {
        type: "notify",
        config: {},
      },
    ],
    channels: initialRule?.channels || ["in_app"],
    priority: initialRule?.priority || "medium",
    cooldownMinutes: initialRule?.cooldownMinutes || 30,
  });

  const availableMetrics = getAvailableMetrics();
  const availableOperators = getAvailableOperators();
  const conditionTypes = getConditionTypes();
  const notificationChannels = getNotificationChannels();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateCondition = (updates: Partial<AlertCondition>) => {
    setFormData((prev) => ({
      ...prev,
      condition: { ...prev.condition, ...updates },
    }));
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const addAction = () => {
    setFormData((prev) => ({
      ...prev,
      actions: [...prev.actions, { type: "notify", config: {} }],
    }));
  };

  const removeAction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const updateAction = (index: number, updates: Partial<AlertAction>) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index ? { ...action, ...updates } : action
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ================= BASIC INFO ================= */}
      <div className="fused-nebula-panel p-5">
        <h3 className="text-sm font-bold text-fused-text-primary uppercase tracking-widest mb-4">
          Información Básica
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
              Nombre de la Regla
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="fused-input w-full"
              placeholder="Ej: Alerta de Ventas Altas"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="fused-input w-full h-20 resize-none"
              placeholder="Describe cuándo se debe activar esta alerta"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="fused-input w-full"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                Cooldown (minutos)
              </label>
              <input
                type="number"
                value={formData.cooldownMinutes}
                onChange={(e) => setFormData({ ...formData, cooldownMinutes: parseInt(e.target.value) || 0 })}
                className="fused-input w-full"
                min="0"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONDITION ================= */}
      <div className="fused-nebula-panel p-5">
        <h3 className="text-sm font-bold text-fused-text-primary uppercase tracking-widest mb-4">
          Condición de Disparo
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                Tipo de Condición
              </label>
              <select
                value={formData.condition.type}
                onChange={(e) => updateCondition({ type: e.target.value as any })}
                className="fused-input w-full"
              >
                {conditionTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                Métrica
              </label>
              <select
                value={formData.condition.metric}
                onChange={(e) => updateCondition({ metric: e.target.value })}
                className="fused-input w-full"
              >
                {availableMetrics.map((metric) => (
                  <option key={metric.key} value={metric.key}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                Operador
              </label>
              <select
                value={formData.condition.operator}
                onChange={(e) => updateCondition({ operator: e.target.value as any })}
                className="fused-input w-full"
              >
                {availableOperators.map((op) => (
                  <option key={op.key} value={op.key}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                Valor
              </label>
              <input
                type="number"
                value={formData.condition.value}
                onChange={(e) => updateCondition({ value: parseFloat(e.target.value) || 0 })}
                className="fused-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                Ventana de Tiempo
              </label>
              <select
                value={formData.condition.timeWindow || ""}
                onChange={(e) => updateCondition({ timeWindow: e.target.value })}
                className="fused-input w-full"
              >
                <option value="">Sin ventana</option>
                <option value="5m">5 minutos</option>
                <option value="15m">15 minutos</option>
                <option value="30m">30 minutos</option>
                <option value="1h">1 hora</option>
                <option value="6h">6 horas</option>
                <option value="1d">1 día</option>
                <option value="1w">1 semana</option>
              </select>
            </div>
          </div>

          {formData.condition.type !== "threshold" && (
            <div>
              <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                Agregación
              </label>
              <select
                value={formData.condition.aggregation || "sum"}
                onChange={(e) => updateCondition({ aggregation: e.target.value as any })}
                className="fused-input w-full"
              >
                <option value="sum">Suma</option>
                <option value="avg">Promedio</option>
                <option value="max">Máximo</option>
                <option value="min">Mínimo</option>
                <option value="count">Conteo</option>
              </select>
            </div>
          )}

          <div className="bg-fused-bg-tertiary rounded-lg p-3 border border-fused-glass-border">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-fused-gold mt-0.5 flex-shrink-0" />
              <p className="text-xs text-fused-text-secondary">
                La alerta se disparará cuando: <span className="text-fused-text-primary font-semibold">
                  {formData.condition.metric} {formData.condition.operator} {formData.condition.value}
                </span>
                {formData.condition.timeWindow && ` en los últimos ${formData.condition.timeWindow}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= NOTIFICATION CHANNELS ================= */}
      <div className="fused-nebula-panel p-5">
        <h3 className="text-sm font-bold text-fused-text-primary uppercase tracking-widest mb-4">
          Canales de Notificación
        </h3>
        <div className="flex flex-wrap gap-3">
          {notificationChannels.map((channel) => (
            <button
              key={channel.key}
              type="button"
              onClick={() => toggleChannel(channel.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                formData.channels.includes(channel.key)
                  ? "bg-fused-gold/10 border-fused-gold/30 text-fused-gold"
                  : "bg-white/5 border-fused-glass-border text-fused-text-muted hover:text-fused-text-primary"
              }`}
            >
              {channel.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="fused-nebula-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-fused-text-primary uppercase tracking-widest">
            Acciones Adicionales
          </h3>
          <button
            type="button"
            onClick={addAction}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-fused-violet/10 border border-fused-violet/20 text-fused-violet hover:bg-fused-violet/20 transition-all"
          >
            <Plus size={14} />
            Agregar Acción
          </button>
        </div>

        {formData.actions.length === 0 ? (
          <p className="text-sm text-fused-text-tertiary text-center py-4">
            No hay acciones adicionales configuradas
          </p>
        ) : (
          <div className="space-y-3">
            {formData.actions.map((action, index) => (
              <div key={index} className="bg-fused-bg-tertiary rounded-lg p-4 border border-fused-glass-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                        Tipo de Acción
                      </label>
                      <select
                        value={action.type}
                        onChange={(e) => updateAction(index, { type: e.target.value as any })}
                        className="fused-input w-full"
                      >
                        <option value="notify">Notificar</option>
                        <option value="log">Registrar en Log</option>
                        <option value="webhook">Webhook</option>
                        <option value="email">Email</option>
                      </select>
                    </div>

                    {action.type === "webhook" && (
                      <div>
                        <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                          URL del Webhook
                        </label>
                        <input
                          type="url"
                          value={action.config.url || ""}
                          onChange={(e) =>
                            updateAction(index, {
                              config: { ...action.config, url: e.target.value },
                            })
                          }
                          className="fused-input w-full"
                          placeholder="https://example.com/webhook"
                        />
                      </div>
                    )}

                    {action.type === "email" && (
                      <div>
                        <label className="block text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                          Destinatarios (separados por coma)
                        </label>
                        <input
                          type="text"
                          value={action.config.recipients || ""}
                          onChange={(e) =>
                            updateAction(index, {
                              config: { ...action.config, recipients: e.target.value },
                            })
                          }
                          className="fused-input w-full"
                          placeholder="admin@example.com, manager@example.com"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-fused-text-muted hover:text-red-400 transition-all flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-fused-glass-border">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-fused-glass-border text-fused-text-muted hover:text-fused-text-primary hover:border-fused-gold/30 transition-all"
          disabled={saving}
        >
          <X size={16} />
          Cancelar
        </button>
        <button
          type="submit"
          className="fused-btn-gold flex items-center gap-2 px-6 py-2.5"
          disabled={saving || !formData.name || !formData.description}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-fused-bg-primary border-t-transparent rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Check size={16} />
              Guardar Regla
            </>
          )}
        </button>
      </div>
    </form>
  );
}
