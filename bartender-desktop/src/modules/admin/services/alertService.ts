/* =========================================================
   ALERT SERVICE
   Servicio para gestión de alertas configurables
========================================================= */

import { resolveBackendBaseUrl } from "../../../services/socketConfig";

const API_BASE = resolveBackendBaseUrl();

/* ================= TYPES ================= */
export interface AlertRule {
  _id?: string;
  name: string;
  description: string;
  enabled: boolean;
  condition: AlertCondition;
  actions: AlertAction[];
  channels: NotificationChannel[];
  priority: "low" | "medium" | "high" | "critical";
  cooldownMinutes: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AlertCondition {
  type: "threshold" | "rate" | "anomaly" | "custom";
  metric: string;
  operator: ">" | "<" | "=" | "!=" | ">=" | "<=";
  value: number;
  timeWindow?: string; // e.g., "5m", "1h", "1d"
  aggregation?: "sum" | "avg" | "max" | "min" | "count";
}

export interface AlertAction {
  type: "notify" | "log" | "webhook" | "email";
  config: Record<string, any>;
}

export type NotificationChannel = "in_app" | "email" | "sms" | "webhook" | "slack";

export interface AlertTrigger {
  _id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: string;
  metricValue: number;
  condition: AlertCondition;
  status: "active" | "acknowledged" | "resolved";
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface AlertStats {
  totalRules: number;
  activeRules: number;
  totalTriggers: number;
  activeTriggers: number;
  triggersByPriority: Record<string, number>;
  triggersToday: number;
  triggersThisWeek: number;
}

/* ================= API FUNCTIONS ================= */

/**
 * Obtener todas las reglas de alerta
 */
export async function getAlertRules(): Promise<AlertRule[]> {
  try {
    const response = await fetch(`${API_BASE}/api/alerts/rules`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener reglas de alerta");
    }

    const data = await response.json();
    return data.rules || [];
  } catch (error) {
    console.error("Error fetching alert rules:", error);
    return [];
  }
}

/**
 * Obtener una regla de alerta por ID
 */
export async function getAlertRuleById(id: string): Promise<AlertRule | null> {
  try {
    const response = await fetch(`${API_BASE}/api/alerts/rules/${id}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener regla de alerta");
    }

    const data = await response.json();
    return data.rule || null;
  } catch (error) {
    console.error("Error fetching alert rule:", error);
    return null;
  }
}

/**
 * Crear una nueva regla de alerta
 */
export async function createAlertRule(rule: Omit<AlertRule, "_id" | "createdAt" | "updatedAt">): Promise<AlertRule | null> {
  try {
    const response = await fetch(`${API_BASE}/api/alerts/rules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(rule),
    });

    if (!response.ok) {
      throw new Error("Error al crear regla de alerta");
    }

    const data = await response.json();
    return data.rule || null;
  } catch (error) {
    console.error("Error creating alert rule:", error);
    return null;
  }
}

/**
 * Actualizar una regla de alerta existente
 */
export async function updateAlertRule(id: string, rule: Partial<AlertRule>): Promise<AlertRule | null> {
  try {
    const response = await fetch(`${API_BASE}/api/alerts/rules/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(rule),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar regla de alerta");
    }

    const data = await response.json();
    return data.rule || null;
  } catch (error) {
    console.error("Error updating alert rule:", error);
    return null;
  }
}

/**
 * Eliminar una regla de alerta
 */
export async function deleteAlertRule(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/alerts/rules/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar regla de alerta");
    }

    return true;
  } catch (error) {
    console.error("Error deleting alert rule:", error);
    return false;
  }
}

/**
 * Activar/desactivar una regla de alerta
 */
export async function toggleAlertRule(id: string, enabled: boolean): Promise<AlertRule | null> {
  return updateAlertRule(id, { enabled });
}

/**
 * Obtener disparos de alerta (triggers)
 */
export async function getAlertTriggers(filters?: {
  ruleId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<AlertTrigger[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.ruleId) queryParams.append("ruleId", filters.ruleId);
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());

    const response = await fetch(`${API_BASE}/api/alerts/triggers?${queryParams}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener disparos de alerta");
    }

    const data = await response.json();
    return data.triggers || [];
  } catch (error) {
    console.error("Error fetching alert triggers:", error);
    return [];
  }
}

/**
 * Reconocer un disparo de alerta
 */
export async function acknowledgeAlertTrigger(triggerId: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/alerts/triggers/${triggerId}/acknowledge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ acknowledgedBy: userId }),
    });

    if (!response.ok) {
      throw new Error("Error al reconocer alerta");
    }

    return true;
  } catch (error) {
    console.error("Error acknowledging alert trigger:", error);
    return false;
  }
}

/**
 * Resolver un disparo de alerta
 */
export async function resolveAlertTrigger(triggerId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/alerts/triggers/${triggerId}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al resolver alerta");
    }

    return true;
  } catch (error) {
    console.error("Error resolving alert trigger:", error);
    return false;
  }
}

/**
 * Obtener estadísticas de alertas
 */
export async function getAlertStats(): Promise<AlertStats> {
  try {
    const response = await fetch(`${API_BASE}/api/alerts/stats`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener estadísticas de alertas");
    }

    const data = await response.json();
    return data.stats || {
      totalRules: 0,
      activeRules: 0,
      totalTriggers: 0,
      activeTriggers: 0,
      triggersByPriority: {},
      triggersToday: 0,
      triggersThisWeek: 0,
    };
  } catch (error) {
    console.error("Error fetching alert stats:", error);
    return {
      totalRules: 0,
      activeRules: 0,
      totalTriggers: 0,
      activeTriggers: 0,
      triggersByPriority: {},
      triggersToday: 0,
      triggersThisWeek: 0,
    };
  }
}

/**
 * Probar una regla de alerta
 */
export async function testAlertRule(rule: AlertRule): Promise<{ success: boolean; message: string; triggered?: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/api/alerts/rules/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(rule),
    });

    if (!response.ok) {
      throw new Error("Error al probar regla de alerta");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error testing alert rule:", error);
    return { success: false, message: "Error al probar regla de alerta" };
  }
}

/* ================= HELPER FUNCTIONS ================= */

/**
 * Obtener métricas disponibles para alertas
 */
export function getAvailableMetrics(): Array<{ key: string; label: string; description: string; unit?: string }> {
  return [
    { key: "orders.total", label: "Total de Pedidos", description: "Número total de pedidos en el período", unit: "pedidos" },
    { key: "orders.value", label: "Valor de Pedidos", description: "Valor total de pedidos en el período", unit: "MXN" },
    { key: "orders.average", label: "Promedio de Pedidos", description: "Valor promedio por pedido", unit: "MXN" },
    { key: "tables.active", label: "Mesas Activas", description: "Número de mesas actualmente ocupadas", unit: "mesas" },
    { key: "tables.waiting", label: "Mesas en Espera", description: "Número de mesas en lista de espera", unit: "mesas" },
    { key: "employees.active", label: "Empleados Activos", description: "Número de empleados en turno activo", unit: "empleados" },
    { key: "shift.sales", label: "Ventas del Turno", description: "Ventas totales del turno actual", unit: "MXN" },
    { key: "shift.orders", label: "Pedidos del Turno", description: "Pedidos totales del turno actual", unit: "pedidos" },
    { key: "inventory.low", label: "Inventario Bajo", description: "Productos con stock bajo", unit: "productos" },
    { key: "cashier.balance", label: "Balance de Caja", description: "Balance actual de caja", unit: "MXN" },
  ];
}

/**
 * Obtener operadores disponibles
 */
export function getAvailableOperators(): Array<{ key: string; label: string; description: string }> {
  return [
    { key: ">", label: "Mayor que", description: "El valor es mayor que el umbral" },
    { key: "<", label: "Menor que", description: "El valor es menor que el umbral" },
    { key: "=", label: "Igual a", description: "El valor es igual al umbral" },
    { key: "!=", label: "Diferente de", description: "El valor es diferente del umbral" },
    { key: ">=", label: "Mayor o igual", description: "El valor es mayor o igual al umbral" },
    { key: "<=", label: "Menor o igual", description: "El valor es menor o igual al umbral" },
  ];
}

/**
 * Obtener tipos de condición disponibles
 */
export function getConditionTypes(): Array<{ key: string; label: string; description: string }> {
  return [
    { key: "threshold", label: "Umbral", description: "Se activa cuando el valor cruza el umbral" },
    { key: "rate", label: "Tasa", description: "Se activa cuando la tasa de cambio supera el umbral" },
    { key: "anomaly", label: "Anomalía", description: "Detecta valores anómalos basados en historial" },
    { key: "custom", label: "Personalizado", description: "Condición personalizada con expresión" },
  ];
}

/**
 * Obtener canales de notificación disponibles
 */
export function getNotificationChannels(): Array<{ key: NotificationChannel; label: string; description: string; icon: string }> {
  return [
    { key: "in_app", label: "En App", description: "Notificación dentro de la aplicación", icon: "bell" },
    { key: "email", label: "Email", description: "Notificación por correo electrónico", icon: "mail" },
    { key: "sms", label: "SMS", description: "Notificación por mensaje de texto", icon: "message-square" },
    { key: "webhook", label: "Webhook", description: "Envío a URL personalizada", icon: "link" },
    { key: "slack", label: "Slack", description: "Notificación a canal de Slack", icon: "hash" },
  ];
}
