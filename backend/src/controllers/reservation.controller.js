import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Table       from "../models/Table.js";
import { io }      from "../server.js";
import { logger }  from "../config/logger.js";
import { startServiceSession } from "../services/tableSession.service.js";
import {
  ok, created, badRequest, notFound,
} from "../utils/response.js";

const isValidId   = (id)    => mongoose.Types.ObjectId.isValid(id);
const parseDate   = (value) => { const d = new Date(value); return isNaN(d.getTime()) ? null : d; };

const ACTIVE_STATUSES  = ["pending", "confirmed", "seated"];
const VALID_STATUSES   = ["pending", "confirmed", "seated", "completed", "cancelled", "no-show"];

const POPULATE_TABLE = "number capacity status location";

/* =========================================================
   SOCKET HELPERS
========================================================= */
const emitReservation = (event, payload) => io.emit(event, payload);

const emitTableUpdate = async (tableId) => {
  const table = await Table.findById(tableId).lean();
  if (table) io.emit("table:update", table);
};

/* =========================================================
   GET ALL (with Pagination & Search)
========================= */
export const getReservations = async (req, res, next) => {
  try {
    const { status, date, search, page = 1, limit = 100 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: start, $lte: end };
    }

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } }
      ];
    }

    const total = await Reservation.countDocuments(filter);
    const reservations = await Reservation.find(filter)
      .populate("tableId", POPULATE_TABLE)
      .sort({ startTime: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    return ok(res, {
      reservations,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) { throw error; }
};

/* =========================================================
   GET ONE
========================================================= */
export const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const reservation = await Reservation.findById(id)
      .populate("tableId", POPULATE_TABLE)
      .lean();

    if (!reservation) return notFound(res, "Reserva no encontrada");
    return ok(res, reservation);
  } catch (error) { throw error; }
};

/* =========================================================
   CREATE RESERVATION (con auto-asignación de mesa)
========================================================= */
export const createReservation = async (req, res, next) => {
  try {
    const now = new Date();

    const { 
      customerName, customerPhone, customerEmail, startTime, endTime, 
      guests, tableId, notes, source, isVIP, deposit 
    } = req.body;

    const start = parseDate(startTime);
    const end   = parseDate(endTime);

    if (!start || !end) return badRequest(res, "startTime y endTime deben ser fechas válidas");
    if (!guests || guests < 1) return badRequest(res, "guests debe ser al menos 1");
    if (end <= start) return badRequest(res, "endTime debe ser posterior a startTime");
    if (!customerName || !customerPhone) return badRequest(res, "customerName y customerPhone son obligatorios");

    let assignedTable = null;

    /* ─── Mesa manual ─── */
    if (tableId) {
      if (!isValidId(tableId)) return badRequest(res, "ID de mesa inválido");

      const table = await Table.findById(tableId);
      if (!table) return notFound(res, "Mesa no encontrada");
      if (table.capacity < guests) return badRequest(res, `Mesa #${table.number} no tiene capacidad para ${guests} personas`);

      const isAvailable = await Reservation.isTableAvailable(tableId, start, end);
      if (!isAvailable) return badRequest(res, `Mesa #${table.number} no está disponible en ese horario`);

      assignedTable = table._id;
    } else {
      /* ─── Auto-asignación MEJORADA ─── */
      const tables = await Table.find({
        capacity: { $gte: guests },
        status:   { $ne: "maintenance" },
      }).sort({ capacity: 1 }).lean();

      // Scoring system para selección óptima
      const scoredTables = [];

      for (const table of tables) {
        const isAvailable = await Reservation.isTableAvailable(table._id, start, end);
        if (!isAvailable) continue;

        // Calcular score basado en múltiples factores
        let score = 0;

        // 1. Capacidad óptima (preferir mesas con capacidad justa suficiente)
        const capacityDiff = table.capacity - guests;
        if (capacityDiff === 0) score += 50; // Perfect fit
        else if (capacityDiff <= 2) score += 30; // Close fit
        else if (capacityDiff <= 4) score += 10; // Acceptable fit

        // 2. Preferencia de ubicación (interior > outdoor > bar para reservas)
        if (table.location === "indoor") score += 20;
        else if (table.location === "outdoor") score += 10;
        else if (table.location === "bar") score += 5;

        // 3. Rotación (evitar mesas usadas recientemente)
        if (table.lastSessionClosedAt) {
          const hoursSinceLastUse = (now - new Date(table.lastSessionClosedAt).getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastUse > 2) score += 15; // Mesa descansada
          else if (hoursSinceLastUse > 1) score += 5;
        }

        // 4. Performance histórico (mesas con buen revenue tienen prioridad)
        if (table.totalPayments > 0) {
          score += Math.min(10, table.totalPayments / 100); // Bonus por uso
        }

        scoredTables.push({
          table: table._id,
          score,
          tableData: table,
        });
      }

      // Seleccionar mesa con mayor score
      scoredTables.sort((a, b) => b.score - a.score);
      assignedTable = scoredTables[0]?.table || null;
    }

    if (!assignedTable) return badRequest(res, "No hay mesas disponibles para el horario y número de personas seleccionados");

    const reservation = await Reservation.create({
      customerName, customerPhone,
      customerEmail: customerEmail || "",
      guests: Number(guests), 
      startTime: start, 
      endTime: end,
      tableId: assignedTable,
      notes: notes || "",
      source: source || "admin",
      status: "pending",
      isVIP: Boolean(isVIP),
      deposit: Number(deposit || 0),
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    });

    const populated = await reservation.populate("tableId", POPULATE_TABLE);

    /* ─── ACTUALIZAR MESA INMEDIATAMENTE ─── */
    // Marcar la mesa como reserved desde el momento de creación
    await Table.findByIdAndUpdate(assignedTable, {
      status: "reserved",
      currentReservation: reservation._id,
      reservationStart: start,
      reservationEnd: end,
    });

    emitReservation("reservation:created", populated);
    await emitTableUpdate(assignedTable);

    logger.info(`[Reservation] Creada: ${customerName} → Mesa ${assignedTable} → ${new Date(start).toLocaleString()}`);
    return created(res, populated, "Reserva creada correctamente");
  } catch (error) { throw error; }
};

/* =========================================================
   UPDATE STATUS
========================================================= */
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!isValidId(id)) return badRequest(res, "ID inválido");
    if (!VALID_STATUSES.includes(status)) {
      return badRequest(res, `Estado inválido. Válidos: ${VALID_STATUSES.join(", ")}`);
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) return notFound(res, "Reserva no encontrada");

    if (status === "seated") {
      if (!reservation.tableId) {
        return badRequest(res, "Asigna una mesa antes de sentar a los clientes");
      }
      try {
        await startServiceSession(reservation.tableId.toString(), {
          reservationId: reservation._id.toString(),
        });
      } catch (err) {
        if (err.code === "badRequest") return badRequest(res, err.message);
        if (err.code === "notFound") return notFound(res, err.message);
        throw err;
      }
      const populated = await Reservation.findById(id).populate(
        "tableId",
        POPULATE_TABLE
      );
      emitReservation("reservation:update", populated);
      logger.info(`[Reservation] Status → seated: ${id}`);
      return ok(res, populated, "Clientes sentados — mesa lista para pedidos");
    }

    if (status === "cancelled") await reservation.cancel();
    else {
      reservation.status = status;
      await reservation.save();
    }

    /* ─── Actualizar mesa ─── */
    if (reservation.tableId) {
      const tableUpdate = {};

      if (status === "confirmed") {
        tableUpdate.status = "reserved";
        tableUpdate.currentReservation = reservation._id;
        tableUpdate.reservationStart = reservation.startTime;
        tableUpdate.reservationEnd = reservation.endTime;
      }

      if (["cancelled", "no-show", "completed"].includes(status)) {
        tableUpdate.status = "available";
        tableUpdate.currentReservation = null;
        tableUpdate.reservationStart = null;
        tableUpdate.reservationEnd = null;
        tableUpdate.currentSessionId = null; // Clear session if exists
      }

      if (status === "pending") {
        // Si vuelve a pending, mantener reserved pero limpiar session
        tableUpdate.status = "reserved";
        tableUpdate.currentReservation = reservation._id;
        tableUpdate.reservationStart = reservation.startTime;
        tableUpdate.reservationEnd = reservation.endTime;
        tableUpdate.currentSessionId = null;
      }

      if (Object.keys(tableUpdate).length > 0) {
        await Table.findByIdAndUpdate(reservation.tableId, tableUpdate);
        await emitTableUpdate(reservation.tableId);
      }
    }

    const populated = await Reservation.findById(id).populate("tableId", POPULATE_TABLE).lean();

    emitReservation("reservation:update", populated);
    logger.info(`[Reservation] Status → ${status}: ${id}`);

    return ok(res, populated, `Reserva ${status}`);
  } catch (error) { throw error; }
};

/* =========================================================
   UPDATE RESERVATION (General Edit)
========================================================= */
export const updateReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const { 
      customerName, customerPhone, customerEmail, startTime, endTime, 
      guests, tableId, notes, source, isVIP, deposit, status, tags
    } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) return notFound(res, "Reserva no encontrada");

    const oldTableId = reservation.tableId;

    if (customerName) reservation.customerName = customerName;
    if (customerPhone) reservation.customerPhone = customerPhone;
    if (customerEmail !== undefined) reservation.customerEmail = customerEmail;
    if (guests) reservation.guests = Number(guests);
    if (notes !== undefined) reservation.notes = notes;
    if (source) reservation.source = source;
    if (isVIP !== undefined) reservation.isVIP = Boolean(isVIP);
    if (deposit !== undefined) reservation.deposit = Number(deposit);
    if (status) reservation.status = status;
    if (tags !== undefined) reservation.tags = tags;

    let start = reservation.startTime;
    let end = reservation.endTime;
    if (startTime) start = parseDate(startTime);
    if (endTime) end = parseDate(endTime);

    if (start && end) {
      if (end <= start) return badRequest(res, "endTime debe ser posterior a startTime");
      reservation.startTime = start;
      reservation.endTime = end;
    }

    let assignedTable = reservation.tableId;
    if (tableId !== undefined) {
      if (tableId === null || tableId === "") {
        assignedTable = null;
      } else {
        if (!isValidId(tableId)) return badRequest(res, "ID de mesa inválido");
        const table = await Table.findById(tableId);
        if (!table) return notFound(res, "Mesa no encontrada");
        if (table.capacity < (guests || reservation.guests)) {
          return badRequest(res, `Mesa #${table.number} no tiene capacidad para ${guests || reservation.guests} personas`);
        }

        // Verificar disponibilidad excluyendo la reserva actual
        const isAvailable = await Reservation.findOne({
          tableId,
          status: { $in: ACTIVE_STATUSES },
          _id: { $ne: id },
          $or: [
            { startTime: { $lt: end, $gte: start } },
            { endTime: { $gt: start, $lte: end } },
            { startTime: { $lte: start }, endTime: { $gte: end } }
          ]
        });
        if (isAvailable) return badRequest(res, `Mesa #${table.number} no está disponible en ese horario`);
        assignedTable = tableId;
      }
    }
    reservation.tableId = assignedTable;

    await reservation.save();

    // Actualizar estados de mesas
    if (oldTableId && oldTableId.toString() !== (assignedTable ? assignedTable.toString() : "")) {
      await Table.findByIdAndUpdate(oldTableId, { status: "available", currentReservation: null });
      await emitTableUpdate(oldTableId);
    }

    if (assignedTable) {
      const tableStatus = status === "seated" ? "occupied" : "reserved";
      await Table.findByIdAndUpdate(assignedTable, {
        status: tableStatus,
        currentReservation: id,
        reservationStart: status === "seated" ? null : start,
        reservationEnd: status === "seated" ? null : end,
      });
      await emitTableUpdate(assignedTable);
    }

    const populated = await Reservation.findById(id).populate("tableId", POPULATE_TABLE).lean();
    emitReservation("reservation:update", populated);
    logger.info(`[Reservation] Editada: ${customerName} → Mesa ${assignedTable} → ${new Date(start).toLocaleString()}`);
    
    return ok(res, populated, "Reserva actualizada correctamente");
  } catch (error) { throw error; }
};

/* =========================================================
   DELETE
========================================================= */
export const deleteReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const reservation = await Reservation.findById(id);
    if (!reservation) return notFound(res, "Reserva no encontrada");

    const tableId = reservation.tableId;
    await reservation.deleteOne();

    if (tableId) {
      await Table.findByIdAndUpdate(tableId, { status: "available", currentReservation: null });
      await emitTableUpdate(tableId);
    }

    // Emitir ID directamente para consistencia con frontend
    emitReservation("reservation:delete", id); 
    logger.info(`[Reservation] Eliminada: ${id}`);

    return ok(res, { id }, "Reserva eliminada correctamente");
  } catch (error) { throw error; }
};

/* =========================================================
   AVAILABLE TABLES (para reserva)
========================================================= */
export const getAvailableTables = async (req, res, next) => {
  try {
    const { startTime, endTime, guests } = req.query;

    const start = parseDate(startTime);
    const end   = parseDate(endTime);

    if (!start || !end || !guests) {
      return badRequest(res, "startTime, endTime y guests son obligatorios");
    }

    const tables = await Table.find({
      capacity: { $gte: Number(guests) },
      status:   { $ne: "maintenance" },
    }).sort({ capacity: 1 }).lean();

    const available = [];
    for (const table of tables) {
      const isAvailable = await Reservation.isTableAvailable(table._id, start, end);
      if (isAvailable) available.push(table);
    }

    return ok(res, available);
  } catch (error) { throw error; }
};

/* =========================================================
   CHECK SLOT AVAILABILITY ( estilo Booking)
========================================================= */
export const checkAvailability = async (req, res, next) => {
  try {
    const { start, end, guests } = req.query;

    const startTime = parseDate(start);
    const endTime   = parseDate(end);

    if (!startTime || !endTime || !guests) {
      return badRequest(res, "start, end y guests son obligatorios");
    }

    /* ─── Buscar mesas posibles ─── */
    const tables = await Table.find({
      capacity: { $gte: Number(guests) },
      status: { $ne: "maintenance" },
    }).lean();

    let available = false;

    /* ─── Check rápido ─── */
    for (const table of tables) {
      const isFree = await Reservation.isTableAvailable(
        table._id,
        startTime,
        endTime
      );

      if (isFree) {
        available = true;
        break;
      }
    }

    return ok(res, { available });

  } catch (error) {
    throw error;
  }
};

/* =========================================================
   CLEANUP EXPIRED RESERVATIONS (Cron job helper)
========================================================= */
export const cleanupExpiredReservations = async (req, res, next) => {
  try {
    const now = new Date();

    // Encontrar reservas expiradas (no-show)
    const expiredReservations = await Reservation.find({
      status: { $in: ["pending", "confirmed"] },
      endTime: { $lt: now },
    }).populate("tableId");

    const results = {
      processed: 0,
      tablesReleased: 0,
      errors: 0,
    };

    for (const reservation of expiredReservations) {
      try {
        // Marcar como no-show
        reservation.status = "no-show";
        reservation.cancelledAt = now;
        await reservation.save();

        // Liberar mesa
        if (reservation.tableId) {
          await Table.findByIdAndUpdate(reservation.tableId, {
            status: "available",
            currentReservation: null,
            reservationStart: null,
            reservationEnd: null,
          });
          await emitTableUpdate(reservation.tableId);
          results.tablesReleased++;
        }

        results.processed++;
        logger.info(`[Reservation] Auto-cleanup: Expired reservation ${reservation._id} marked as no-show`);
      } catch (err) {
        results.errors++;
        logger.error(`[Reservation] Error cleaning up reservation ${reservation._id}:`, err);
      }
    }

    // También liberar mesas reservadas whose reservation time has passed
    const tablesToRelease = await Table.find({
      status: "reserved",
      reservationEnd: { $lt: now },
    });

    for (const table of tablesToRelease) {
      try {
        // Check if there's still an active reservation
        const activeReservation = await Reservation.findOne({
          _id: table.currentReservation,
          status: { $in: ["pending", "confirmed", "seated"] },
          endTime: { $gte: now },
        });

        if (!activeReservation) {
          table.status = "available";
          table.currentReservation = null;
          table.reservationStart = null;
          table.reservationEnd = null;
          await table.save();
          await emitTableUpdate(table._id);
          results.tablesReleased++;
          logger.info(`[Reservation] Released reserved table ${table.number} (reservation expired)`);
        }
      } catch (err) {
        results.errors++;
        logger.error(`[Reservation] Error releasing table ${table._id}:`, err);
      }
    }

    logger.info(`[Reservation] Cleanup completed: ${results.processed} reservations, ${results.tablesReleased} tables released, ${results.errors} errors`);
    return ok(res, results, "Cleanup completed successfully");

  } catch (error) {
    throw error;
  }
};

/* =========================================================
   AVAILABILITY HEATMAP (frontend integration)
========================================================= */
export const getAvailabilityHeatmap = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      const today = new Date();
      date = today.toISOString().split('T')[0];
    }

    const targetDate = new Date(date);
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Obtener todas las mesas
    const tables = await Table.find({
      status: { $ne: "maintenance" },
    }).sort({ number: 1 }).lean();

    // Obtener todas las reservas del día
    const reservations = await Reservation.find({
      startTime: { $gte: dayStart, $lt: dayEnd },
      status: { $in: ["pending", "confirmed", "seated"] },
    }).populate("tableId", "number capacity location").lean();

    // Crear mapa de disponibilidad por hora
    const heatmap = {};
    const timeSlots = [];

    for (let h = 18; h <= 23; h++) {
      for (const m of ["00", "30"]) {
        const slot = `${h.toString().padStart(2, "0")}:${m}`;
        timeSlots.push(slot);

        for (const table of tables) {
          const key = `table_${table._id}_${slot}`;

          // Check if table is reserved at this time
          const isReserved = reservations.some(res => {
            if (!res.tableId || res.tableId._id.toString() !== table._id.toString()) return false;

            const resStart = new Date(res.startTime);
            const resEnd = new Date(res.endTime);
            const slotTime = new Date(targetDate);
            slotTime.setHours(h, parseInt(m), 0, 0);

            return slotTime >= resStart && slotTime < resEnd;
          });

          heatmap[key] = {
            tableId: table._id,
            tableNumber: table.number,
            tableLocation: table.location,
            tableCapacity: table.capacity,
            timeSlot: slot,
            available: !isReserved,
            reservation: isReserved ? "reserved" : "available",
          };
        }
      }
    }

    // Agrupar por mesa para respuesta más limpia
    const tableAvailability = tables.map(table => {
      const tableSlots = timeSlots.map(slot => {
        const key = `table_${table._id}_${slot}`;
        return heatmap[key] || {
          tableId: table._id,
          tableNumber: table.number,
          timeSlot: slot,
          available: true,
        };
      });

      return {
        tableId: table._id,
        tableNumber: table.number,
        location: table.location,
        capacity: table.capacity,
        status: table.status,
        currentReservation: table.currentReservation,
        slots: tableSlots,
      };
    });

    return ok(res, {
      date: date,
      timeSlots,
      tables: tableAvailability,
      totalTables: tables.length,
      totalReservations: reservations.length,
    });

  } catch (error) {
    throw error;
  }
};