import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Table       from "../models/Table.js";
import { io }      from "../server.js";
import { logger }  from "../config/logger.js";
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
   GET ALL
========================================================= */
export const getReservations = async (req, res, next) => {
  try {
    const { status, date } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: start, $lte: end };
    }

    const reservations = await Reservation.find(filter)
      .populate("tableId", POPULATE_TABLE)
      .sort({ startTime: 1 })
      .lean();

    return ok(res, reservations);
  } catch (error) { next(error); }
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
  } catch (error) { next(error); }
};

/* =========================================================
   CREATE RESERVATION (con auto-asignación de mesa)
========================================================= */
export const createReservation = async (req, res, next) => {
  try {
    const { customerName, customerPhone, customerEmail, startTime, endTime, guests, tableId, notes, source } = req.body;

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
      /* ─── Auto-asignación ─── */
      const tables = await Table.find({
        capacity: { $gte: guests },
        status:   { $ne: "maintenance" },
      }).sort({ capacity: 1 });

      for (const table of tables) {
        const isAvailable = await Reservation.isTableAvailable(table._id, start, end);
        if (isAvailable) { assignedTable = table._id; break; }
      }
    }

    if (!assignedTable) return badRequest(res, "No hay mesas disponibles para el horario y número de personas seleccionados");

    const reservation = await Reservation.create({
      customerName, customerPhone,
      customerEmail: customerEmail || "",
      guests: Number(guests), startTime: start, endTime: end,
      tableId: assignedTable,
      notes: notes || "",
      source: source || "admin",
      status: "pending",
    });

    const populated = await reservation.populate("tableId", POPULATE_TABLE);

    emitReservation("reservation:created", populated);
    await emitTableUpdate(assignedTable);

    logger.info(`[Reservation] Creada: ${customerName} → ${new Date(start).toLocaleString()}`);
    return created(res, populated, "Reserva creada correctamente");
  } catch (error) { next(error); }
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

    /* ─── Usar métodos del modelo ─── */
    if (status === "seated")    await reservation.markSeated();
    else if (status === "cancelled") await reservation.cancel();
    else { reservation.status = status; await reservation.save(); }

    /* ─── Actualizar mesa ─── */
    if (reservation.tableId) {
      const tableUpdate = {};

      if (status === "confirmed")  { tableUpdate.status = "reserved";  tableUpdate.currentReservation = reservation._id; }
      if (status === "seated")     { tableUpdate.status = "occupied";  tableUpdate.currentSessionId = new mongoose.Types.ObjectId().toString(); tableUpdate.currentReservation = reservation._id; }
      if (["cancelled", "no-show", "completed"].includes(status)) {
        tableUpdate.status = "available"; tableUpdate.currentReservation = null;
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
  } catch (error) { next(error); }
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

    emitReservation("reservation:deleted", { id });
    logger.info(`[Reservation] Eliminada: ${id}`);

    return ok(res, null, "Reserva eliminada correctamente");
  } catch (error) { next(error); }
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
  } catch (error) { next(error); }
};