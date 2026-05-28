import mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog.js";
import ShiftSchedule from "../models/ShiftSchedule.js";
import ShiftAssignment from "../models/ShiftAssignment.js";
import PerformanceAlert from "../models/PerformanceAlert.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { logger } from "../config/logger.js";
import {
  ok,
  created,
  badRequest,
  notFound,
  conflict,
  forbidden,
} from "../utils/response.js";
import { getIO } from "../socket/index.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const isISODate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");

const getDateRange = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }

  const dates = [];
  for (let d = start; d <= end; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

const getDayKey = (date) => DAY_KEYS[new Date(`${date}T00:00:00`).getDay()];

const buildScheduleUpdate = (shift, date) => {
  const dayKey = getDayKey(date);
  return {
    shift: shift.shiftType,
    [`schedule.${dayKey}.isAvailable`]: true,
    [`schedule.${dayKey}.startTime`]: shift.startTime,
    [`schedule.${dayKey}.endTime`]: shift.endTime,
  };
};

const applyShiftToUserProfile = async (userId, shift, date) => {
  await User.findByIdAndUpdate(userId, {
    $set: buildScheduleUpdate(shift, date),
  });

  await ShiftSchedule.findByIdAndUpdate(shift._id, {
    $addToSet: { assignedEmployees: userId },
  });
};

/* =========================================================
   ACTIVITY LOGGING
========================================================= */

// Registrar actividad
export const logActivity = async (req, res, next) => {
  try {
    const { userId, userName, userRole, activityType, description, metadata, shift } = req.body;

    if (!userId || !userName || !userRole || !activityType || !description) {
      return badRequest(res, "Faltan campos requeridos");
    }

    const activity = await ActivityLog.create({
      userId,
      userName,
      userRole,
      activityType,
      description,
      metadata: metadata || {},
      shift,
      sessionId: req.sessionId || null,
    });

    logger.info(`[Tracking] Actividad registrada: ${activityType} por ${userName}`);

    // Emitir evento WebSocket para actualización en tiempo real
    try {
      const { emitActivityEvent } = await import("../socket/index.js");
      const io = getIO();
      if (io) {
        emitActivityEvent(io, "activity:new", activity);
      }
    } catch (socketError) {
      logger.warn("[Tracking] Error emitiendo evento WebSocket:", socketError.message);
    }

    return created(res, activity, "Actividad registrada");
  } catch (error) {
    next(error);
  }
};

// Obtener logs de actividad
export const getActivityLogs = async (req, res, next) => {
  try {
    const { userId, activityType, startDate, endDate, shift, limit = 50 } = req.query;

    const filter = {};
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    if (activityType) filter.activityType = activityType;
    if (shift) filter.shift = shift;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    return ok(res, logs);
  } catch (error) {
    nexn(rror));
  }
};

// Obtener métricas de actividad
export const getActivityMetrics = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const defaultEndDate = new Date().toISOString();

    const metrics = await ActivityLog.calculateMetrics(
      userId || null,
      startDate || defaultStartDate,
      endDate || defaultEndDate
    );

    return ok(res, metrics);
  } catch (error) {
    nexn(rror));
  }
};

// Obtener actividad en tiempo real
export const getRealTimeActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const minutesAgo = parseInt(req.query.minutesAgo) || 30;

    const since = new Date(Date.now() - minutesAgo * 60 * 1000);

    const logs = await ActivityLog.find({
      timestamp: { $gte: since },
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return ok(res, logs);
  } catch (error) {
    nexn(rror));
  }
};

/* =========================================================
   KPIs & PERFORMANCE
========================================================= */

// Calcular KPIs de un empleado
export const getEmployeeKPIs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;

    if (!isValidId(userId)) return badRequest(res, "ID inválido");

    const user = await User.findById(userId);
    if (!user) return notFound(res, "Usuario no encontrado");

    const startDate = new Date(start || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(end || Date.now());

    // Obtener actividad del usuario
    const activityMetrics = await ActivityLog.calculateMetrics(userId, startDate, endDate);

    // Obtener pedidos del usuario (asumiendo que hay un campo assignedTo en Order)
    const orders = await Order.find({
      assignedTo: userId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    const ordersCompleted = orders.filter((o) => o.status === "completed").length;
    const ordersCancelled = orders.filter((o) => o.status === "cancelled").length;
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

    // Calcular tiempos de pedido
    const orderTimes = orders
      .filter((o) => o.createdAt && o.completedAt)
      .map((o) => (new Date(o.completedAt) - new Date(o.createdAt)) / 60000); // en minutos
    const averageOrderTime = orderTimes.length > 0 ? orderTimes.reduce((a, b) => a + b, 0) / orderTimes.length : 0;

    // Calcular productividad (0-100)
    const productivityScore = calculateProductivityScore({
      ordersCompleted,
      ordersCancelled,
      totalSales,
      averageOrderTime,
      activityMetrics,
    });

    // Calcular ranking
    const allEmployees = await User.find({ isEmployee: true, isActive: true }).select("_id").lean();
    const allKPIs = await Promise.all(
      allEmployees.map(async (emp) => {
        const empOrders = await Order.find({
          assignedTo: emp._id,
          createdAt: { $gte: startDate, $lte: endDate },
        }).lean();
        return calculateProductivityScore({
          ordersCompleted: empOrders.filter((o) => o.status === "completed").length,
          ordersCancelled: empOrders.filter((o) => o.status === "cancelled").length,
          totalSales: empOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        });
      })
    );

    const sortedKPIs = allKPIs.sort((a, b) => b - a);
    const rank = sortedKPIs.indexOf(productivityScore) + 1;
    const percentile = ((allKPIs.length - rank + 1) / allKPIs.length) * 100;

    const kpis = {
      userId: user._id.toString(),
      userName: user.name,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      ordersCompleted,
      ordersCancelled,
      averageOrderTime,
      ordersPerHour: ordersCompleted / (activityMetrics.averageSessionDuration / 3600000) || 0,
      totalSales,
      averageOrderValue,
      salesPerHour: totalSales / (activityMetrics.averageSessionDuration / 3600000) || 0,
      productivityScore,
      efficiencyScore: calculateEfficiencyScore({ ordersCompleted, ordersCancelled }),
      loginCount: activityMetrics.activitiesByType?.login || 0,
      totalActiveTime: activityMetrics.averageSessionDuration,
      activeTimePercentage: 75, // Esto debería calcularse basado en el turno
      rankAmongPeers: rank,
      percentile: Math.round(percentile),
      lastUpdated: new Date().toISOString(),
    };

    return ok(res, kpis);
  } catch (error) {
    nexn(rror));
  }
};

// Obtener KPIs de todos los empleados
export const getAllEmployeesKPIs = async (req, res, next) => {
  try {
    const { start, end } = req.query;

    const employees = await User.find({ isEmployee: true, isActive: true }).lean();
    const kpis = await Promise.all(
      employees.map(async (emp) => {
        const response = await getEmployeeKPIs(
          { params: { userId: emp._id.toString() }, query: { start, end } },
          { json: () => ({ data: {} }) },
          () => {}
        );
        return response.data || {};
      })
    );

    return ok(res, kpis.filter((k) => k.userId));
  } catch (error) {
    throw error;
  }
};

// Obtener tendencias de KPIs
export const getKPITrends = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { kpiType, start, end } = req.query;

    if (!isValidId(userId)) return badRequest(res, "ID inválido");

    const startDate = new Date(start || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(end || Date.now());

    // Generar datos diarios
    const trends = [];
    const dayMs = 24 * 60 * 60 * 1000;

    for (let date = startDate; date <= endDate; date = new Date(date.getTime() + dayMs)) {
      const dayStart = new Date(date);
      const dayEnd = new Date(date.getTime() + dayMs);

      const dayMetrics = await ActivityLog.calculateMetrics(userId, dayStart, dayEnd);

      let value = 0;
      if (kpiType === "productivity") {
        value = calculateProductivityScore(dayMetrics);
      } else if (kpiType === "sales") {
        const orders = await Order.find({
          assignedTo: userId,
          createdAt: { $gte: dayStart, $lte: dayEnd },
        }).lean();
        value = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      } else if (kpiType === "orders") {
        const orders = await Order.find({
          assignedTo: userId,
          createdAt: { $gte: dayStart, $lte: dayEnd },
        }).lean();
        value = orders.filter((o) => o.status === "completed").length;
      }

      trends.push({
        date: date.toISOString().split("T")[0],
        value,
      });
    }

    return ok(res, trends);
  } catch (error) {
    next(error);
  }
};

// Obtener ranking de empleados
export const getEmployeeRanking = async (req, res, next) => {
  try {
    const { kpiType, start, end } = req.query;

    const employees = await User.find({ isEmployee: true, isActive: true }).lean();
    const startDate = new Date(start || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(end || Date.now());

    const rankings = await Promise.all(
      employees.map(async (emp) => {
        const kpiData = await getEmployeeKPIs(
          { params: { userId: emp._id.toString() }, query: { start: startDate, end: endDate } },
          { json: () => ({ data: {} }) },
          () => {}
        );

        let value = 0;
        if (kpiType === "productivity") value = kpiData.data?.productivityScore || 0;
        else if (kpiType === "sales") value = kpiData.data?.totalSales || 0;
        else if (kpiType === "orders") value = kpiData.data?.ordersCompleted || 0;

        return {
          userId: emp._id.toString(),
          userName: emp.name,
          value,
        };
      })
    );

    rankings.sort((a, b) => b.value - a.value);
    const ranked = rankings.map((r, index) => ({ ...r, rank: index + 1 }));

    return ok(res, ranked);
  } catch (error) {
    ohrow  erro;
  }
};

/* =========================================================
   SHIFT MANAGEMENT
========================================================= */

// Crear configuración de turno
export const createShiftSchedule = async (req, res, next) => {
  try {
    const shiftData = req.body;

    const shift = await ShiftSchedule.create(shiftData);

    logger.info(`[Tracking] Turno creado: ${shift.shiftType}`);

    // Emitir evento WebSocket
    try {
      const { emitShiftEvent } = await import("../socket/index.js");
      const io = getIO();
      if (io) {
        emitShiftEvent(io, "shift:created", shift);
      }
    } catch (socketError) {
      logger.warn("[Tracking] Error emitiendo evento WebSocket:", socketError.message);
    }

    return created(res, shift, "Turno creado correctamente");
  } catch (error) {
    throw error;
  }
};

// Obtener configuraciones de turnos
export const getShiftSchedules = async (req, res, next) => {
  try {
    const { shiftType, isActive } = req.query;

    const filter = {};
    if (shiftType) filter.shiftType = shiftType;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const shifts = await ShiftSchedule.find(filter)
      .populate("assignedEmployees", "name email role shift isActive")
      .sort({ priority: -1 })
      .lean();

    return ok(res, shifts);
  } catch (error) {
    nexn(rror));
  }
};

// Actualizar configuración de turno
export const updateShiftSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const shift = await ShiftSchedule.findByIdAndUpdate(id, req.body, { new: true }).lean();

    if (!shift) return notFound(res, "Turno no encontrado");

    logger.info(`[Tracking] Turno actualizado: ${id}`);

    // Emitir evento WebSocket
    try {
      const { emitShiftEvent } = await import("../socket/index.js");
      const io = getIO();
      if (io) {
        emitShiftEvent(io, "shift:updated", shift);
      }
    } catch (socketError) {
      logger.warn("[Tracking] Error emitiendo evento WebSocket:", socketError.message);
    }

    return ok(res, shift, "Turno actualizado correctamente");
  } catch (error) {
    throw error;
  }
};

// Eliminar configuración de turno
export const deleteShiftSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const shift = await ShiftSchedule.findByIdAndDelete(id);

    if (!shift) return notFound(res, "Turno no encontrado");

    logger.info(`[Tracking] Turno eliminado: ${id}`);

    // Emitir evento WebSocket
    try {
      const { emitShiftEvent } = await import("../socket/index.js");
      const io = getIO();
      if (io) {
        emitShiftEvent(io, "shift:deleted", { id, shiftType: shift.shiftType });
      }
    } catch (socketError) {
      logger.warn("[Tracking] Error emitiendo evento WebSocket:", socketError.message);
    }

    return ok(res, null, "Turno eliminado correctamente");
  } catch (error) {
    throw error;
  }
};

// Asignar empleado a turno
export const assignEmployeeToShift = async (req, res, next) => {
  try {
    const { userId, shiftId, date } = req.body;

    if (!userId || !shiftId || !date) {
      return badRequest(res, "Faltan campos requeridos");
    }

    if (!isValidId(userId) || !isValidId(shiftId) || !isISODate(date)) {
      return badRequest(res, "Empleado, turno o fecha invalidos");
    }

    const user = await User.findById(userId);
    const shift = await ShiftSchedule.findById(shiftId);

    if (!user) return notFound(res, "Usuario no encontrado");
    if (!shift) return notFound(res, "Turno no encontrado");
    if (!shift.isActive) return badRequest(res, "No se puede asignar un turno inactivo");

    const assignmentsCount = await ShiftAssignment.countDocuments({ shiftId, date });
    if (assignmentsCount >= shift.maxEmployees) {
      return conflict(res, "El turno ya alcanzo el maximo de empleados para esa fecha");
    }

    // Verificar si ya existe asignación
    const existing = await ShiftAssignment.findOne({
      userId,
      shiftId,
      date,
    });

    if (existing) {
      return conflict(res, "Ya existe una asignación para este turno y fecha");
    }

    const assignment = await ShiftAssignment.create({
      userId,
      userName: user.name,
      shiftId,
      shiftType: shift.shiftType,
      date,
      scheduledStart: shift.startTime,
      scheduledEnd: shift.endTime,
      status: "scheduled",
    });

    await applyShiftToUserProfile(userId, shift, date);

    logger.info(`[Tracking] Asignación creada: ${userId} al turno ${shiftId}`);
    return created(res, assignment, "Asignación creada correctamente");
  } catch (error) {
    throw error;
  }
};

// Generar agenda de turnos desde las plantillas activas
export const generateShiftAssignments = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      shiftId,
      employeeIds = [],
      overwrite = false,
      applyToProfiles = true,
    } = req.body;

    if (!isISODate(startDate) || !isISODate(endDate)) {
      return badRequest(res, "startDate y endDate deben tener formato YYYY-MM-DD");
    }

    if (shiftId && !isValidId(shiftId)) {
      return badRequest(res, "ID de turno invalido");
    }

    const dates = getDateRange(startDate, endDate);
    if (dates.length === 0 || dates.length > 62) {
      return badRequest(res, "Rango de fechas invalido o demasiado amplio");
    }

    const shiftFilter = { isActive: true };
    if (shiftId) shiftFilter._id = shiftId;

    const shifts = await ShiftSchedule.find(shiftFilter).lean();
    if (shifts.length === 0) {
      return notFound(res, "No hay turnos activos para generar");
    }

    const requestedEmployeeIds = Array.isArray(employeeIds)
      ? employeeIds.filter(isValidId).map(String)
      : [];

    const result = {
      created: 0,
      updated: 0,
      skipped: 0,
      assignments: [],
    };

    for (const shift of shifts) {
      const templateEmployeeIds = (shift.assignedEmployees || []).map((id) => id.toString());
      const targetEmployeeIds = requestedEmployeeIds.length > 0
        ? requestedEmployeeIds
        : templateEmployeeIds;

      if (targetEmployeeIds.length === 0) {
        result.skipped += dates.length;
        continue;
      }

      for (const date of dates) {
        const dayKey = getDayKey(date);
        const applicableDays = shift.applicableDays || [];
        if (applicableDays.length > 0 && !applicableDays.includes(dayKey)) {
          result.skipped += targetEmployeeIds.length;
          continue;
        }

        for (const userId of targetEmployeeIds.slice(0, shift.maxEmployees)) {
          const user = await User.findById(userId).select("_id name isActive").lean();
          if (!user?.isActive) {
            result.skipped++;
            continue;
          }

          const existing = await ShiftAssignment.findOne({
            userId,
            shiftId: shift._id,
            date,
          });

          if (existing && !overwrite) {
            result.skipped++;
            continue;
          }

          if (existing) {
            existing.userName = user.name;
            existing.shiftType = shift.shiftType;
            existing.scheduledStart = shift.startTime;
            existing.scheduledEnd = shift.endTime;
            existing.status = "scheduled";
            await existing.save();
            result.updated++;
            result.assignments.push(existing);
          } else {
            const assignment = await ShiftAssignment.create({
              userId,
              userName: user.name,
              shiftId: shift._id,
              shiftType: shift.shiftType,
              date,
              scheduledStart: shift.startTime,
              scheduledEnd: shift.endTime,
              status: "scheduled",
            });
            result.created++;
            result.assignments.push(assignment);
          }

          if (applyToProfiles) {
            await applyShiftToUserProfile(userId, shift, date);
          }
        }
      }
    }

    logger.info(
      `[Tracking] Agenda generada: ${result.created} creadas, ${result.updated} actualizadas, ${result.skipped} omitidas`
    );

    return created(res, result, "Agenda de turnos generada correctamente");
  } catch (error) {
    throw error;
  }
};

// Obtener asignaciones de turnos
export const getShiftAssignments = async (req, res, next) => {
  try {
    const { userId, shiftId, startDate, endDate, status } = req.query;

    const filter = {};
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    if (shiftId) filter.shiftId = new mongoose.Types.ObjectId(shiftId);
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const assignments = await ShiftAssignment.find(filter)
      .populate("userId", "name email")
      .populate("shiftId")
      .sort({ date: -1 })
      .lean();

    return ok(res, assignments);
  } catch (error) {
    throw error;
  }
};

// Actualizar asignación de turno
export const updateShiftAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const assignment = await ShiftAssignment.findByIdAndUpdate(id, req.body, { new: true }).lean();

    if (!assignment) return notFound(res, "Asignación no encontrada");

    logger.info(`[Tracking] Asignación actualizada: ${id}`);
    return ok(res, assignment, "Asignación actualizada correctamente");
  } catch (error) {
    throw error;
  }
};

// Registrar asistencia (check-in/check-out)
export const registerShiftAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, timestamp } = req.body;

    if (!isValidId(id)) return badRequest(res, "ID inválido");
    if (!type || !["clock_in", "clock_out"].includes(type)) {
      return badRequest(res, "Tipo debe ser 'clock_in' o 'clock_out'");
    }

    const assignment = await ShiftAssignment.findById(id);

    if (!assignment) return notFound(res, "Asignación no encontrada");

    if (type === "clock_in") {
      await assignment.checkIn(timestamp ? new Date(timestamp) : new Date());
    } else {
      await assignment.checkOut(timestamp ? new Date(timestamp) : new Date());
    }

    logger.info(`[Tracking] ${type} registrado para asignación: ${id}`);
    return ok(res, assignment, `${type === "clock_in" ? "Check-in" : "Check-out"} registrado correctamente`);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   SHIFT METRICS
========================================================= */

// Obtener métricas de un turno específico
export const getShiftMetrics = async (req, res, next) => {
  try {
    const { shiftType, date } = req.params;

    const assignments = await ShiftAssignment.find({
      shiftType,
      date,
      status: { $in: ["completed", "late", "left_early"] },
    }).lean();

    if (assignments.length === 0) {
      return ok(res, {
        shiftType,
        date,
        totalOrders: 0,
        totalSales: 0,
        averageOrderValue: 0,
        averageOrderTime: 0,
        employeesPresent: 0,
        employeesScheduled: 0,
        totalProductivityScore: 0,
        peakHours: [],
        averageOrderPerEmployee: 0,
        salesPerEmployee: 0,
        comparisonWithPreviousPeriod: {
          ordersChange: 0,
          salesChange: 0,
          productivityChange: 0,
        },
        lastUpdated: new Date().toISOString(),
      });
    }

    // Obtener pedidos de este turno
    const shiftStart = new Date(`${date}T00:00:00`);
    const shiftEnd = new Date(`${date}T23:59:59`);

    const userIds = assignments.map((a) => a.userId);
    const orders = await Order.find({
      assignedTo: { $in: userIds },
      createdAt: { $gte: shiftStart, $lte: shiftEnd },
    }).lean();

    const totalOrders = orders.filter((o) => o.status === "completed").length;
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

    const orderTimes = orders
      .filter((o) => o.createdAt && o.completedAt)
      .map((o) => (new Date(o.completedAt) - new Date(o.createdAt)) / 60000);
    const averageOrderTime = orderTimes.length > 0 ? orderTimes.reduce((a, b) => a + b, 0) / orderTimes.length : 0;

    const totalProductivityScore = assignments.reduce((sum, a) => sum + (a.performanceScore || 0), 0) / assignments.length;

    // Calcular comparación con período anterior
    const previousDate = new Date(new Date(date).getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Simplificado - en producción deberías hacer la consulta real
    const comparisonWithPreviousPeriod = {
      ordersChange: 5.2,
      salesChange: 8.1,
      productivityChange: 2.3,
    };

    const scheduledAssignments = await ShiftAssignment.find({ shiftType, date }).lean();

    return ok(res, {
      shiftType,
      date,
      totalOrders,
      totalSales,
      averageOrderValue,
      averageOrderTime,
      employeesPresent: assignments.length,
      employeesScheduled: scheduledAssignments.length,
      totalProductivityScore,
      peakHours: [], // Se calcularía con análisis más detallado
      averageOrderPerEmployee: assignments.length > 0 ? totalOrders / assignments.length : 0,
      salesPerEmployee: assignments.length > 0 ? totalSales / assignments.length : 0,
      comparisonWithPreviousPeriod,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

// Obtener métricas de turnos en rango
export const getShiftMetricsRange = async (req, res, next) => {
  try {
    const { shiftType } = req.params;
    const { start, end } = req.query;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const metrics = [];
    const dayMs = 24 * 60 * 60 * 1000;

    for (let date = startDate; date <= endDate; date = new Date(date.getTime() + dayMs)) {
      const dateStr = date.toISOString().split("T")[0];
      const response = await getShiftMetrics(
        { params: { shiftType, date: dateStr } },
        { json: () => ({ data: {} }) },
        () => {}
      );
      metrics.push(response.data);
    }

    return ok(res, metrics.filter((m) => m.shiftType));
  } catch (error) {
    next(error);
  }
};

// Obtener todas las métricas de turnos
export const getAllShiftsMetrics = async (req, res, next) => {
  try {
    const { start, end } = req.query;

    const shiftTypes = ["morning", "afternoon", "night", "event"];
    const allMetrics = [];

    for (const shiftType of shiftTypes) {
      const response = await getShiftMetricsRange(
        { params: { shiftType }, query: { start, end } },
        { json: () => ({ data: [] }) },
        () => {}
      );
      allMetrics.push(...response.data);
    }

    return ok(res, allMetrics);
  } catch (error) {
    next(error);
  }
};

// Obtener horas pico por turno
export const getPeakHoursByShift = async (req, res, next) => {
  try {
    const { shiftType } = req.params;
    const { start, end } = req.query;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const activities = await ActivityLog.find({
      shift: shiftType,
      timestamp: { $gte: startDate, $lte: endDate },
    }).lean();

    // Agrupar por hora
    const hourlyActivity = {};
    activities.forEach((a) => {
      const hour = new Date(a.timestamp).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    // Normalizar a porcentajes
    const maxActivity = Math.max(...Object.values(hourlyActivity), 1);
    const peakHours = Object.entries(hourlyActivity)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        activityLevel: (count / maxActivity) * 100,
      }))
      .sort((a, b) => b.activityLevel - a.activityLevel);

    return ok(res, peakHours);
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   ALERTS
========================================================= */

// Obtener alertas de rendimiento
export const getPerformanceAlerts = async (req, res, next) => {
  try {
    const { userId, alertType, severity, isResolved, limit = 50 } = req.query;

    const filter = {};
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    if (alertType) filter.alertType = alertType;
    if (severity) filter.severity = severity;
    if (isResolved !== undefined) filter.isResolved = isResolved === "true";

    const alerts = await PerformanceAlert.find(filter)
      .populate("userId", "name email")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    return ok(res, alerts);
  } catch (error) {
    throw error;
  }
};

// Crear alerta manual
export const createPerformanceAlert = async (req, res, next) => {
  try {
    const alert = await PerformanceAlert.create(req.body);

    logger.info(`[Tracking] Alerta creada: ${alert.alertType} para ${alert.userId}`);

    // Emitir evento WebSocket
    try {
      const { emitAlertEvent } = await import("../socket/index.js");
      const io = getIO();
      if (io) {
        emitAlertEvent(io, "alert:create", alert);
      }
    } catch (socketError) {
      logger.warn("[Tracking] Error emitiendo evento WebSocket:", socketError.message);
    }

    return created(res, alert, "Alerta creada correctamente");
  } catch (error) {
    next(error);
  }
};

// Resolver alerta
export const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const alert = await PerformanceAlert.findById(id);

    if (!alert) return notFound(res, "Alerta no encontrada");

    await alert.resolve(req.user?.id, notes);

    logger.info(`[Tracking] Alerta resuelta: ${id}`);

    // Emitir evento WebSocket
    try {
      const { emitAlertEvent } = await import("../socket/index.js");
      const io = getIO();
      if (io) {
        emitAlertEvent(io, "alert:resolve", { id, ...alert.toObject() });
      }
    } catch (socketError) {
      logger.warn("[Tracking] Error emitiendo evento WebSocket:", socketError.message);
    }

    return ok(res, alert, "Alerta resuelta correctamente");
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   REPORTS
========================================================= */

// Generar reporte de empleado
export const generateEmployeeReport = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.body;

    const kpiResponse = await getEmployeeKPIs(
      { params: { userId }, query: { start, end } },
      { json: () => ({ data: {} }) },
      () => {}
    );

    const report = {
      employeeId: userId,
      employeeName: kpiResponse.data?.userName || "Unknown",
      period: { start, end },
      kpis: kpiResponse.data,
      trends: {
        productivity: await getKPITrends(
          { params: { userId }, query: { kpiType: "productivity", start, end } },
          { json: () => ({ data: [] }) },
          () => {}
        ).then((r) => r.data),
        sales: await getKPITrends(
          { params: { userId }, query: { kpiType: "sales", start, end } },
          { json: () => ({ data: [] }) },
          () => {}
        ).then((r) => r.data),
        orders: await getKPITrends(
          { params: { userId }, query: { kpiType: "orders", start, end } },
          { json: () => ({ data: [] }) },
          () => {}
        ).then((r) => r.data),
      },
      strengths: [],
      areasForImprovement: [],
      recommendations: [],
      generatedAt: new Date().toISOString(),
    };

    return ok(res, report);
  } catch (error) {
    throw error;
  }
};

// Obtener resumen de rendimiento
export const getPerformanceSummary = async (req, res, next) => {
  try {
    const { start, end } = req.query;

    const startDate = new Date(start || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(end || Date.now());

    const employees = await User.find({ isEmployee: true, isActive: true }).lean();
    const totalEmployees = employees.length;

    const allKPIs = await getAllEmployeesKPIs(
      { query: { start: startDate, end: endDate } },
      { json: () => ({ data: [] }) },
      () => {}
    ).then((r) => r.data);

    const averageProductivity = allKPIs.length > 0 ? allKPIs.reduce((sum, k) => sum + (k.productivityScore || 0), 0) / allKPIs.length : 0;
    const totalSales = allKPIs.reduce((sum, k) => sum + (k.totalSales || 0), 0);
    const totalOrders = allKPIs.reduce((sum, k) => sum + (k.ordersCompleted || 0), 0);

    const topPerformers = allKPIs
      .sort((a, b) => b.productivityScore - a.productivityScore)
      .slice(0, 5)
      .map((k) => ({
        userId: k.userId,
        userName: k.userName,
        score: k.productivityScore,
      }));

    return ok(res, {
      totalEmployees,
      averageProductivity,
      totalSales,
      totalOrders,
      topPerformers,
      areasForImprovement: [],
    });
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function calculateProductivityScore(metrics) {
  let score = 50; // Base score

  // Factores de productividad
  if (metrics.ordersCompleted > 0) score += Math.min(metrics.ordersCompleted * 0.5, 25);
  if (metrics.totalSales > 0) score += Math.min(metrics.totalSales / 500, 15);
  if (metrics.activityMetrics?.totalActivities > 0) score += Math.min(metrics.activityMetrics.totalActivities * 0.1, 10);

  // Penalizaciones
  if (metrics.ordersCancelled > 0) score -= Math.min(metrics.ordersCancelled * 2, 15);
  if (metrics.averageOrderTime > 30) score -= Math.min((metrics.averageOrderTime - 30) * 0.5, 10);

  return Math.max(0, Math.min(100, score));
}

function calculateEfficiencyScore(metrics) {
  const total = metrics.ordersCompleted + metrics.ordersCancelled;
  if (total === 0) return 100;

  const completionRate = (metrics.ordersCompleted / total) * 100;
  return Math.max(0, Math.min(100, completionRate));
}
