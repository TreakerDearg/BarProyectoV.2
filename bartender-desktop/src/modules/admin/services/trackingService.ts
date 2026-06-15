import api from "../../../services/api";
import { getOrders } from "../../orders/services/orderService";
import { getTables } from "../../tables/services/tableService";
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

/* =========================================================
   INTEGRATED SHIFT METRICS (Orders + Tables)
========================================================= */

export interface IntegratedShiftMetrics extends ShiftMetrics {
  ordersData: {
    totalOrders: number;
    totalSales: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    topSellingItems: Array<{ name: string; quantity: number; revenue: number }>;
  };
  tablesData: {
    totalTables: number;
    activeTables: number;
    averageTableDuration: number;
    tablesByStatus: Record<string, number>;
    peakOccupancy: number;
  };
  employeeMetrics: Array<{
    userId: string;
    userName: string;
    ordersProcessed: number;
    salesGenerated: number;
    tablesServed: number;
    productivity: number;
  }>;
}

// Obtener métricas integradas de un turno específico
export const getIntegratedShiftMetrics = async (
  shiftType: string,
  date: string
): Promise<IntegratedShiftMetrics> => {
  try {
    // Obtener métricas base del turno
    const baseMetrics = await getShiftMetrics(shiftType, date);

    // Obtener datos de pedidos del período
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const orders = await getOrders();
    const tables = await getTables();

    // Filtrar pedidos por fecha y turno
    const shiftOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const orderHour = orderDate.getHours();
      const isSameDay = orderDate >= startDate && orderDate < endDate;

      // Determinar si el pedido pertenece al turno
      let isShiftMatch = false;
      if (shiftType === "morning" && orderHour >= 6 && orderHour < 12) isShiftMatch = true;
      if (shiftType === "afternoon" && orderHour >= 12 && orderHour < 18) isShiftMatch = true;
      if (shiftType === "night" && (orderHour >= 18 || orderHour < 6)) isShiftMatch = true;
      if (shiftType === "event") isShiftMatch = true;

      return isSameDay && isShiftMatch;
    });

    // Calcular métricas de pedidos
    const totalOrders = shiftOrders.length;
    const totalSales = shiftOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const ordersByStatus = shiftOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular items más vendidos
    const itemsMap = new Map<string, { quantity: number; revenue: number }>();
    shiftOrders.forEach(order => {
      order.items?.forEach(item => {
        const productName = typeof item.product === 'string' ? item.product : item.product?.name || 'Unknown';
        const existing = itemsMap.get(productName) || { quantity: 0, revenue: 0 };
        itemsMap.set(productName, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity)
        });
      });
    });

    const topSellingItems = Array.from(itemsMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Calcular métricas de mesas
    const shiftTables = tables.filter(table => {
      if (!table.updatedAt) return false;
      const tableDate = new Date(table.updatedAt);
      const tableHour = tableDate.getHours();
      const isSameDay = tableDate >= startDate && tableDate < endDate;

      let isShiftMatch = false;
      if (shiftType === "morning" && tableHour >= 6 && tableHour < 12) isShiftMatch = true;
      if (shiftType === "afternoon" && tableHour >= 12 && tableHour < 18) isShiftMatch = true;
      if (shiftType === "night" && (tableHour >= 18 || tableHour < 6)) isShiftMatch = true;
      if (shiftType === "event") isShiftMatch = true;

      return isSameDay && isShiftMatch;
    });

    const totalTables = shiftTables.length;
    const activeTables = shiftTables.filter(t => t.status === "occupied").length;
    const tablesByStatus = shiftTables.reduce((acc, table) => {
      acc[table.status] = (acc[table.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular duración promedio de mesa (simulado)
    const averageTableDuration = 45; // minutos

    // Calcular ocupación máxima (simulado)
    const peakOccupancy = Math.max(...Object.values(tablesByStatus), 0);

    // Calcular métricas por empleado (simulado basado en asignaciones)
    const assignments = await getShiftAssignments({ startDate: date, endDate: date });
    const employeeMetrics = assignments.map(assignment => ({
      userId: assignment.userId,
      userName: assignment.userName || "Empleado",
      ordersProcessed: Math.floor(Math.random() * 50) + 10,
      salesGenerated: Math.floor(Math.random() * 10000) + 2000,
      tablesServed: Math.floor(Math.random() * 20) + 5,
      productivity: Math.random() * 100
    }));

    return {
      ...baseMetrics,
      ordersData: {
        totalOrders,
        totalSales,
        averageOrderValue,
        ordersByStatus,
        topSellingItems
      },
      tablesData: {
        totalTables,
        activeTables,
        averageTableDuration,
        tablesByStatus,
        peakOccupancy
      },
      employeeMetrics
    };
  } catch (error) {
    console.error("Error fetching integrated shift metrics:", error);
    throw error;
  }
};

// Obtener métricas integradas en rango de fechas
export const getIntegratedShiftMetricsRange = async (
  shiftType: string,
  dateRange: { start: string; end: string }
): Promise<IntegratedShiftMetrics[]> => {
  const metrics: IntegratedShiftMetrics[] = [];
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    try {
      const dayMetrics = await getIntegratedShiftMetrics(shiftType, dateStr);
      metrics.push(dayMetrics);
    } catch (error) {
      console.error(`Error fetching metrics for ${dateStr}:`, error);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return metrics;
};

// Obtener métricas agrupadas por empleado
export const getEmployeeGroupedMetrics = async (
  dateRange: { startDate: string; endDate: string }
): Promise<Array<{
  userId: string;
  userName: string;
  totalShifts: number;
  totalOrders: number;
  totalSales: number;
  averageProductivity: number;
  shifts: Array<{
    date: string;
    shiftType: string;
    orders: number;
    sales: number;
    productivity: number;
  }>;
}>> => {
  try {
    const assignments = await getShiftAssignments(dateRange);
    const employeeMap = new Map<string, any>();

    for (const assignment of assignments) {
      const userId = assignment.userId;
      if (!employeeMap.has(userId)) {
        employeeMap.set(userId, {
          userId,
          userName: assignment.userName || "Empleado",
          totalShifts: 0,
          totalOrders: 0,
          totalSales: 0,
          productivitySum: 0,
          shifts: []
        });
      }

      const employee = employeeMap.get(userId);
      employee.totalShifts++;

      // Obtener métricas del turno
      try {
        const metrics = await getIntegratedShiftMetrics(assignment.shiftType as string, assignment.date);
        employee.totalOrders += metrics.ordersData.totalOrders;
        employee.totalSales += metrics.ordersData.totalSales;
        employee.productivitySum += metrics.employeeMetrics.find((e: any) => e.userId === userId)?.productivity || 0;

        employee.shifts.push({
          date: assignment.date,
          shiftType: assignment.shiftType,
          orders: metrics.ordersData.totalOrders,
          sales: metrics.ordersData.totalSales,
          productivity: metrics.employeeMetrics.find((e: any) => e.userId === userId)?.productivity || 0
        });
      } catch (error) {
        console.error(`Error fetching metrics for assignment ${assignment._id}:`, error);
      }
    }

    return Array.from(employeeMap.values()).map(employee => ({
      userId: employee.userId,
      userName: employee.userName,
      totalShifts: employee.totalShifts,
      totalOrders: employee.totalOrders,
      totalSales: employee.totalSales,
      averageProductivity: employee.totalShifts > 0 ? employee.productivitySum / employee.totalShifts : 0,
      shifts: employee.shifts
    }));
  } catch (error) {
    console.error("Error fetching employee grouped metrics:", error);
    return [];
  }
};

// Obtener métricas comparativas entre turnos
export const getComparativeShiftMetrics = async (
  dateRange: { start: string; end: string }
): Promise<{
  morning: IntegratedShiftMetrics | null;
  afternoon: IntegratedShiftMetrics | null;
  night: IntegratedShiftMetrics | null;
  comparison: {
    bestPerformingShift: string;
    totalOrders: { morning: number; afternoon: number; night: number };
    totalSales: { morning: number; afternoon: number; night: number };
    averageProductivity: { morning: number; afternoon: number; night: number };
  };
}> => {
  try {
    // Obtener métricas para cada tipo de turno
    const morningMetrics = await getIntegratedShiftMetricsRange("morning", dateRange);
    const afternoonMetrics = await getIntegratedShiftMetricsRange("afternoon", dateRange);
    const nightMetrics = await getIntegratedShiftMetricsRange("night", dateRange);

    // Agregar métricas por tipo de turno
    const aggregateMetrics = (metrics: IntegratedShiftMetrics[]) => {
      if (metrics.length === 0) return null;
      return {
        ordersData: {
          totalOrders: metrics.reduce((sum, m) => sum + m.ordersData.totalOrders, 0),
          totalSales: metrics.reduce((sum, m) => sum + m.ordersData.totalSales, 0),
          averageOrderValue: metrics.reduce((sum, m) => sum + m.ordersData.averageOrderValue, 0) / metrics.length,
          ordersByStatus: metrics.reduce((acc, m) => {
            Object.entries(m.ordersData.ordersByStatus).forEach(([status, count]) => {
              acc[status] = (acc[status] || 0) + count;
            });
            return acc;
          }, {} as Record<string, number>),
          topSellingItems: []
        },
        tablesData: {
          totalTables: metrics.reduce((sum, m) => sum + m.tablesData.totalTables, 0),
          activeTables: metrics.reduce((sum, m) => sum + m.tablesData.activeTables, 0),
          averageTableDuration: metrics.reduce((sum, m) => sum + m.tablesData.averageTableDuration, 0) / metrics.length,
          tablesByStatus: metrics.reduce((acc, m) => {
            Object.entries(m.tablesData.tablesByStatus).forEach(([status, count]) => {
              acc[status] = (acc[status] || 0) + count;
            });
            return acc;
          }, {} as Record<string, number>),
          peakOccupancy: Math.max(...metrics.map(m => m.tablesData.peakOccupancy))
        },
        employeeMetrics: []
      };
    };

    const morning = aggregateMetrics(morningMetrics);
    const afternoon = aggregateMetrics(afternoonMetrics);
    const night = aggregateMetrics(nightMetrics);

    // Determinar mejor turno
    const shiftSales = {
      morning: morning?.ordersData.totalSales || 0,
      afternoon: afternoon?.ordersData.totalSales || 0,
      night: night?.ordersData.totalSales || 0
    };

    const bestPerformingShift = Object.entries(shiftSales).sort((a, b) => b[1] - a[1])[0][0];

    return {
      morning: morningMetrics.length > 0 ? morningMetrics[0] : null,
      afternoon: afternoonMetrics.length > 0 ? afternoonMetrics[0] : null,
      night: nightMetrics.length > 0 ? nightMetrics[0] : null,
      comparison: {
        bestPerformingShift,
        totalOrders: {
          morning: morning?.ordersData.totalOrders || 0,
          afternoon: afternoon?.ordersData.totalOrders || 0,
          night: night?.ordersData.totalOrders || 0
        },
        totalSales: shiftSales,
        averageProductivity: {
          morning: morningMetrics.reduce((sum, m) => sum + (m.employeeMetrics[0]?.productivity || 0), 0) / morningMetrics.length || 0,
          afternoon: afternoonMetrics.reduce((sum, m) => sum + (m.employeeMetrics[0]?.productivity || 0), 0) / afternoonMetrics.length || 0,
          night: nightMetrics.reduce((sum, m) => sum + (m.employeeMetrics[0]?.productivity || 0), 0) / nightMetrics.length || 0
        }
      }
    };
  } catch (error) {
    console.error("Error fetching comparative shift metrics:", error);
    throw error;
  }
};
