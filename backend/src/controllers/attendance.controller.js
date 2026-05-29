import mongoose from "mongoose";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import { logger } from "../config/logger.js";
import {
  ok, created, badRequest, notFound, conflict, forbidden,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   SAFE SELECT
========================================================= */
const safeUserSelect = "-password -refreshToken -loginAttempts -lockUntil";

/* =========================================================
   CHECK IN
========================================================= */
export const checkIn = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { shift, location, device } = req.body;

    if (!shift) {
      return badRequest(res, "Shift es obligatorio");
    }

    const user = await User.findById(userId);
    if (!user) return notFound(res, "Usuario no encontrado");

    // Verificar si ya tiene check-in hoy
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      user: userId,
      date: { $gte: startOfDay },
      checkOut: { $exists: false }
    });

    if (existingAttendance) {
      return conflict(res, "Ya tiene un check-in activo hoy");
    }

    // Verificar disponibilidad según horario
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const schedule = user.schedule?.[dayName];
    
    if (!schedule?.isAvailable) {
      return forbidden(res, "No está programado para trabajar hoy");
    }

    // Crear registro de asistencia
    const attendance = await Attendance.create({
      user: userId,
      shift,
      date: today,
      checkIn: {
        time: new Date(),
        location,
        device: device || req.get('user-agent'),
        ip: req.ip,
      },
      status: 'present',
    });

    // Actualizar estado del usuario
    await User.findByIdAndUpdate(userId, {
      "attendance.currentStatus": "checked-in",
      "attendance.lastCheckIn": new Date(),
      "attendance.currentShiftStart": new Date(),
      "attendance.thisMonth.present": 1,
    });

    logger.info(`[Attendance] Check-in: ${user.email} (${shift})`);

    return created(res, attendance, "Check-in registrado exitosamente");
  } catch (error) { throw error; }
};

/* =========================================================
   CHECK OUT
========================================================= */
export const checkOut = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { location, performance, notes } = req.body;

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: userId,
      date: { $gte: startOfDay },
      checkOut: { $exists: false }
    });

    if (!attendance) {
      return notFound(res, "No hay check-in activo para cerrar");
    }

    // Calcular horas trabajadas
    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkIn.time);
    const workedHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    // Determinar estado basado en horario
    let status = "present";
    if (workedHours < attendance.scheduledHours * 0.5) {
      status = "half-day";
    } else if (workedHours < attendance.scheduledHours * 0.75) {
      status = "early-departure";
    }

    // Actualizar registro de asistencia
    attendance.checkOut = {
      time: checkOutTime,
      location,
      device: req.get('user-agent'),
      ip: req.ip,
    };
    attendance.workedHours = parseFloat(workedHours.toFixed(2));
    attendance.status = status;
    attendance.overtimeHours = attendance.calculateOvertime();

    if (performance) {
      attendance.performance = { ...attendance.performance, ...performance };
    }

    if (notes) {
      attendance.notes.employee = notes;
    }

    await attendance.save();

    // Actualizar estado del usuario
    await User.findByIdAndUpdate(userId, {
      "attendance.currentStatus": "checked-out",
      "attendance.lastCheckOut": checkOutTime,
      "attendance.currentShiftStart": null,
      $inc: { 
        "attendance.totalMinutesWorked": Math.round(workedHours * 60),
        "attendance.thisMonth.totalHours": workedHours
      },
      $inc: { "performance.totalHours": workedHours }
    });

    logger.info(`[Attendance] Check-out: ${userId} (${workedHours}h)`);

    return ok(res, attendance, "Check-out registrado exitosamente");
  } catch (error) { throw error; }
};

/* =========================================================
   GET USER ATTENDANCE
========================================================= */
export const getUserAttendance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!isValidId(userId)) {
      return badRequest(res, "ID inválido");
    }

    const attendance = await Attendance.getUserAttendance(
      userId,
      startDate,
      endDate
    );

    return ok(res, attendance);
  } catch (error) { throw error; }
};

/* =========================================================
   GET TODAY'S ATTENDANCE
======================================================== */
export const getTodayAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const attendance = await Attendance.getDayAttendance(targetDate);

    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      onShift: attendance.filter(a => !a.checkOut?.time).length,
      totalHours: attendance.reduce((sum, a) => sum + (a.workedHours || 0), 0),
      employees: attendance
    };

    return ok(res, stats);
  } catch (error) { throw error; }
};

/* =========================================================
   GET ATTENDANCE STATS
======================================================== */
export const getAttendanceStats = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    const stats = await Attendance.getAttendanceStats(startDate, endDate);

    return ok(res, stats);
  } catch (error) { throw error; }
};

/* =========================================================
   UPDATE ATTENDANCE (ADMIN ONLY)
========================================================= */
export const updateAttendance = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    const { status, isApproved, notes, performance } = req.body;

    if (!isValidId(attendanceId)) {
      return badRequest(res, "ID inválido");
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return notFound(res, "Registro de asistencia no encontrado");
    }

    const updates = {};
    if (status) updates.status = status;
    if (isApproved !== undefined) {
      updates.isApproved = isApproved;
      updates.approvedBy = req.user._id;
      updates.approvedAt = new Date();
    }
    if (notes) updates.notes = { ...attendance.notes, supervisor: notes };
    if (performance) updates.performance = { ...attendance.performance, ...performance };

    Object.assign(attendance, updates);
    await attendance.save();

    logger.info(`[Attendance] Updated: ${attendanceId} by ${req.user.email}`);

    return ok(res, attendance, "Asistencia actualizada exitosamente");
  } catch (error) { throw error; }
};

/* =========================================================
   REQUEST LEAVE
========================================================= */
export const requestLeave = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate) {
      return badRequest(res, "Tipo, fecha inicio y fin son obligatorios");
    }

    const user = await User.findById(userId);
    if (!user) {
      return notFound(res, "Usuario no encontrado");
    }

    // Verificar balance de días disponibles
    const leaveBalance = user.attendance?.leaveBalance || {};
    const availableDays = leaveBalance[type] || 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const requestedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (requestedDays > availableDays) {
      return badRequest(res, `No tienes suficientes días disponibles. Disponibles: ${availableDays}, Solicitados: ${requestedDays}`);
    }

    // Agregar solicitud de licencia
    const leaveRequest = {
      type,
      startDate: start,
      endDate: end,
      reason,
      status: "pending",
    };

    await User.findByIdAndUpdate(userId, {
      $push: { "attendance.leaveRequests": leaveRequest }
    });

    logger.info(`[Attendance] Leave requested: ${userId} (${type}, ${requestedDays} days)`);

    return created(res, leaveRequest, "Solicitud de licencia enviada");
  } catch (error) { throw error; }
};

/* =========================================================
   APPROVE/REJECT LEAVE (ADMIN ONLY)
========================================================= */
export const handleLeaveRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { requestId, status } = req.body;

    if (!requestId || !status || !["approved", "rejected"].includes(status)) {
      return badRequest(res, "Request ID y status válidos son obligatorios");
    }

    const user = await User.findById(userId);
    if (!user) {
      return notFound(res, "Usuario no encontrado");
    }

    const leaveRequest = user.attendance?.leaveRequests?.id(requestId);
    if (!leaveRequest) {
      return notFound(res, "Solicitud de licencia no encontrada");
    }

    if (leaveRequest.status !== "pending") {
      return badRequest(res, "Esta solicitud ya fue procesada");
    }

    if (status === "approved") {
      // Calcular días y descontar del balance
      const start = new Date(leaveRequest.startDate);
      const end = new Date(leaveRequest.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      await User.findByIdAndUpdate(userId, {
        $inc: { [`attendance.leaveBalance.${leaveRequest.type}`]: -days },
        $set: {
          "attendance.leaveRequests.$[elem]._id": requestId,
          "attendance.leaveRequests.$[elem].status": "approved",
          "attendance.leaveRequests.$[elem].approvedBy": req.user._id,
          "attendance.leaveRequests.$[elem].approvedAt": new Date(),
        }
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        $set: {
          "attendance.leaveRequests.$[elem]._id": requestId,
          "attendance.leaveRequests.$[elem].status": "rejected",
          "attendance.leaveRequests.$[elem].approvedBy": req.user._id,
          "attendance.leaveRequests.$[elem].approvedAt": new Date(),
        }
      });
    }

    logger.info(`[Attendance] Leave ${status}: ${userId} request ${requestId}`);

    return ok(res, { status }, `Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'}`);
  } catch (error) { throw error; }
};
