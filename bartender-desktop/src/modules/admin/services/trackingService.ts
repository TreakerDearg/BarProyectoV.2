import api from "../../../services/api";
import type {
  ActivityLog,
  ActivityMetrics,
  EmployeeKPIs,
  KPITrend,
  ShiftSchedule,
  ShiftAssignment,
  ShiftMetrics,
  PerformanceAlert,
  EmployeePerformanceReport,
  ShiftAnalysisReport,
  ActivityType
} from "../types/tracking";

export type {
  ActivityLog,
  ActivityMetrics,
  EmployeeKPIs,
  KPITrend,
  ShiftSchedule,
  ShiftAssignment,
  ShiftMetrics,
  PerformanceAlert,
  EmployeePerformanceReport,
  ShiftAnalysisReport,
  ActivityType
};

/* =========================================================
   HELPERS
========================================================= */
const unwrap = (res: any) => res?.data?.data ?? res?.data ?? [];

/* =========================================================
   ACTIVITY LOGGING
========================================================= */

// Registrar actividad
export const logActivity = async (activity: {
  userId: string;
  userName: string;
  userRole: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  shift?: string;
}) => {
  const res = await api.post("/tracking/activity", activity);
  return unwrap(res);
};

// Obtener logs de actividad
export const getActivityLogs = async (filters?: {
  userId?: string;
  activityType?: ActivityType;
  startDate?: string;
  endDate?: string;
  shift?: string;
  limit?: number;
}): Promise<ActivityLog[]> => {
  const res = await api.get("/tracking/activity", { params: filters });
  return unwrap(res);
};

// Obtener métricas de actividad
export const getActivityMetrics = async (userId?: string): Promise<ActivityMetrics> => {
  const endpoint = userId ? `/tracking/activity/${userId}/metrics` : "/tracking/activity/metrics";
  const res = await api.get(endpoint);
  return unwrap(res);
};

// Obtener actividad en tiempo real
export const getRealTimeActivity = async (): Promise<ActivityLog[]> => {
  const res = await api.get("/tracking/activity/realtime");
  return unwrap(res);
};

/* =========================================================
   EMPLOYEE KPIs
========================================================= */

// Obtener KPIs de un empleado
export const getEmployeeKPIs = async (
  userId: string,
  period: { start: string; end: string }
): Promise<EmployeeKPIs> => {
  const res = await api.get(`/tracking/kpis/${userId}`, { params: period });
  return unwrap(res);
};

// Obtener KPIs de todos los empleados
export const getAllEmployeesKPIs = async (
  period: { start: string; end: string }
): Promise<EmployeeKPIs[]> => {
  const res = await api.get("/tracking/kpis", { params: period });
  return unwrap(res);
};

// Obtener tendencias de KPIs
export const getKPITrends = async (
  userId: string,
  kpiType: "productivity" | "sales" | "orders",
  period: { start: string; end: string }
): Promise<KPITrend[]> => {
  const res = await api.get(`/tracking/kpis/${userId}/trends/${kpiType}`, { params: period });
  return unwrap(res);
};

// Obtener ranking de empleados
export const getEmployeeRanking = async (
  kpiType: "productivity" | "sales" | "orders",
  period: { start: string; end: string }
): Promise<Array<{ userId: string; userName: string; value: number; rank: number }>> => {
  const res = await api.get("/tracking/kpis/ranking", { params: { ...period, kpiType } });
  return unwrap(res);
};

/* =========================================================
   SHIFT MANAGEMENT
========================================================= */

// Crear configuración de turno
export const createShiftSchedule = async (schedule: Partial<ShiftSchedule>) => {
  const res = await api.post("/tracking/shifts/schedules", schedule);
  return unwrap(res);
};

// Obtener todas las configuraciones de turnos
export const getShiftSchedules = async (): Promise<ShiftSchedule[]> => {
  const res = await api.get("/tracking/shifts/schedules");
  return unwrap(res);
};

// Actualizar configuración de turno
export const updateShiftSchedule = async (id: string, schedule: Partial<ShiftSchedule>) => {
  const res = await api.put(`/tracking/shifts/schedules/${id}`, schedule);
  return unwrap(res);
};

// Eliminar configuración de turno
export const deleteShiftSchedule = async (id: string) => {
  const res = await api.delete(`/tracking/shifts/schedules/${id}`);
  return unwrap(res);
};

// Asignar empleado a turno
export const assignEmployeeToShift = async (assignment: {
  userId: string;
  shiftId: string;
  date: string;
}): Promise<ShiftAssignment> => {
  const res = await api.post("/tracking/shifts/assignments", assignment);
  return unwrap(res);
};

export const generateShiftAssignments = async (payload: {
  startDate: string;
  endDate: string;
  shiftId?: string;
  employeeIds?: string[];
  overwrite?: boolean;
  applyToProfiles?: boolean;
}): Promise<{
  created: number;
  updated: number;
  skipped: number;
  assignments: ShiftAssignment[];
}> => {
  const res = await api.post("/tracking/shifts/assignments/generate", payload);
  return unwrap(res);
};

// Obtener asignaciones de turnos
export const getShiftAssignments = async (filters?: {
  userId?: string;
  shiftId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<ShiftAssignment[]> => {
  const res = await api.get("/tracking/shifts/assignments", { params: filters });
  return unwrap(res);
};

// Actualizar asignación de turno
export const updateShiftAssignment = async (
  id: string,
  assignment: Partial<ShiftAssignment>
) => {
  const res = await api.put(`/tracking/shifts/assignments/${id}`, assignment);
  return unwrap(res);
};

// Registrar entrada/salida de turno
export const registerShiftAttendance = async (
  assignmentId: string,
  type: "clock_in" | "clock_out",
  timestamp?: string
) => {
  const res = await api.post(`/tracking/shifts/assignments/${assignmentId}/attendance`, {
    type,
    timestamp: timestamp || new Date().toISOString()
  });
  return unwrap(res);
};

/* =========================================================
   SHIFT METRICS
========================================================= */

// Obtener métricas de un turno específico
export const getShiftMetrics = async (
  shiftType: string,
  date: string
): Promise<ShiftMetrics> => {
  const res = await api.get(`/tracking/shifts/metrics/${shiftType}/${date}`);
  return unwrap(res);
};

// Obtener métricas de turnos en un rango de fechas
export const getShiftMetricsRange = async (
  shiftType: string,
  dateRange: { start: string; end: string }
): Promise<ShiftMetrics[]> => {
  const res = await api.get(`/tracking/shifts/metrics/${shiftType}`, { params: dateRange });
  return unwrap(res);
};

// Obtener todas las métricas de turnos
export const getAllShiftsMetrics = async (
  dateRange: { start: string; end: string }
): Promise<ShiftMetrics[]> => {
  const res = await api.get("/tracking/shifts/metrics", { params: dateRange });
  return unwrap(res);
};

// Obtener horas pico de actividad por turno
export const getPeakHoursByShift = async (
  shiftType: string,
  dateRange: { start: string; end: string }
): Promise<{ hour: string; activityLevel: number }[]> => {
  const res = await api.get(`/tracking/shifts/peak-hours/${shiftType}`, { params: dateRange });
  return unwrap(res);
};

/* =========================================================
   ALERTS & NOTIFICATIONS
========================================================= */

// Obtener alertas de rendimiento
export const getPerformanceAlerts = async (filters?: {
  userId?: string;
  alertType?: string;
  severity?: string;
  isResolved?: boolean;
  limit?: number;
}): Promise<PerformanceAlert[]> => {
  const res = await api.get("/tracking/alerts", { params: filters });
  return unwrap(res);
};

// Crear alerta manual
export const createPerformanceAlert = async (alert: Partial<PerformanceAlert>) => {
  const res = await api.post("/tracking/alerts", alert);
  return unwrap(res);
};

// Resolver alerta
export const resolveAlert = async (alertId: string, notes?: string) => {
  const res = await api.patch(`/tracking/alerts/${alertId}/resolve`, { notes });
  return unwrap(res);
};

/* =========================================================
   REPORTS & ANALYTICS
========================================================= */

// Generar reporte de rendimiento de empleado
export const generateEmployeeReport = async (
  userId: string,
  period: { start: string; end: string }
): Promise<EmployeePerformanceReport> => {
  const res = await api.post(`/tracking/reports/employee/${userId}`, period);
  return unwrap(res);
};

// Generar reporte de análisis de turnos
export const generateShiftAnalysisReport = async (
  shiftType: string,
  dateRange: { start: string; end: string }
): Promise<ShiftAnalysisReport> => {
  const res = await api.post(`/tracking/reports/shift/${shiftType}`, dateRange);
  return unwrap(res);
};

// Obtener resumen de rendimiento general
export const getPerformanceSummary = async (
  period: { start: string; end: string }
): Promise<{
  totalEmployees: number;
  averageProductivity: number;
  totalSales: number;
  totalOrders: number;
  topPerformers: Array<{ userId: string; userName: string; score: number }>;
  areasForImprovement: string[];
}> => {
  const res = await api.get("/tracking/reports/summary", { params: period });
  return unwrap(res);
};

/* =========================================================
   REAL-TIME TRACKING HELPERS
========================================================= */

// Iniciar sesión de tracking para empleado actual
export const startTrackingSession = async (userId: string) => {
  await logActivity({
    userId,
    userName: "", // Se llenará en el backend
    userRole: "", // Se llenará en el backend
    activityType: "login",
    description: "Usuario inició sesión",
    shift: getCurrentShift()
  });
};

// Finalizar sesión de tracking para empleado actual
export const endTrackingSession = async (userId: string, _sessionId?: string) => {
  await logActivity({
    userId,
    userName: "",
    userRole: "",
    activityType: "logout",
    description: "Usuario cerró sesión",
    shift: getCurrentShift()
  });
};

// Obtener turno actual basado en la hora
export const getCurrentShift = (): "morning" | "afternoon" | "night" | "event" => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 24) return "night";
  return "night";
};
