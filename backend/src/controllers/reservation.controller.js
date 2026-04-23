import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";
import { io } from "../server.js";

/* ==============================
   CONSTANTS
============================== */
const ACTIVE_STATUSES = ["pending", "confirmed", "seated"];

/* ==============================
   HELPERS
============================== */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseDate = (value) => {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

/* ==============================
   SOCKET EVENTS (CLEAN & SAFE)
============================== */
const emitReservationList = async () => {
  const reservations = await Reservation.find()
    .populate("tableId", "number capacity status location")
    .sort({ startTime: -1 })
    .lean();

  io.emit("reservation:list", reservations);
};

const emitReservationCreated = (reservation) => {
  io.emit("reservation:created", reservation);
};

const emitReservationUpdated = (reservation) => {
  io.emit("reservation:update", reservation);
};

const emitReservationDeleted = (id) => {
  io.emit("reservation:deleted", id);
};

const emitTableUpdated = async (tableId) => {
  const table = await Table.findById(tableId).populate("currentReservation");

  if (table) {
    io.emit("table:updated", table);
  }
};

/* ==============================
   GET ALL
============================== */
export const getReservations = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = status ? { status } : {};

    const reservations = await Reservation.find(filter)
      .populate("tableId", "number capacity status location")
      .sort({ startTime: -1 })
      .lean();

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET ONE
============================== */
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const reservation = await Reservation.findById(id)
      .populate("tableId", "number capacity status location")
      .lean();

    if (!reservation) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   CREATE RESERVATION
============================== */
export const createReservation = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      startTime,
      endTime,
      guests,
      tableId,
      notes,
    } = req.body;

    const start = parseDate(startTime);
    const end = parseDate(endTime);

    if (!start || !end || !guests) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    if (end <= start) {
      return res.status(400).json({ error: "Rango inválido" });
    }

    let assignedTable = null;

    /* =========================
       MANUAL TABLE
    ========================= */
    if (tableId) {
      if (!isValidId(tableId)) {
        return res.status(400).json({ error: "ID de mesa inválido" });
      }

      const table = await Table.findById(tableId);

      if (!table) {
        return res.status(404).json({ error: "Mesa no existe" });
      }

      if (table.capacity < guests) {
        return res.status(400).json({ error: "Capacidad insuficiente" });
      }

      const conflict = await Reservation.exists({
        tableId,
        status: { $in: ACTIVE_STATUSES },
        startTime: { $lt: end },
        endTime: { $gt: start },
      });

      if (conflict) {
        return res.status(400).json({ error: "Mesa ocupada" });
      }

      assignedTable = table._id;
    }

    /* =========================
       AUTO ASSIGN
    ========================= */
    if (!assignedTable) {
      const tables = await Table.find({
        capacity: { $gte: guests },
        status: { $ne: "maintenance" },
      }).sort({ capacity: 1 });

      for (const table of tables) {
        const conflict = await Reservation.exists({
          tableId: table._id,
          status: { $in: ACTIVE_STATUSES },
          startTime: { $lt: end },
          endTime: { $gt: start },
        });

        if (!conflict) {
          assignedTable = table._id;
          break;
        }
      }
    }

    if (!assignedTable) {
      return res.status(400).json({ error: "No hay mesas disponibles" });
    }

    const reservation = await Reservation.create({
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      guests: Number(guests),
      startTime: start,
      endTime: end,
      tableId: assignedTable,
      notes: notes || "",
      status: "pending",
    });

    const populated = await reservation.populate(
      "tableId",
      "number capacity status location"
    );

    emitReservationCreated(populated);
    await emitTableUpdated(assignedTable);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   UPDATE STATUS (FIXED)
============================== */
export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ error: "Status requerido" });
    }

    if (!isValidId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ error: "No encontrada" });
    }

    reservation.status = status;
    await reservation.save();

    if (reservation.tableId) {
      const update = {};

      switch (status) {
        case "confirmed":
          update.status = "reserved";
          update.currentReservation = reservation._id;
          break;

        case "seated":
          update.status = "occupied";
          update.currentSessionId = new mongoose.Types.ObjectId().toString();
          update.currentReservation = reservation._id;
          break;

        default:
          update.status = "available";
          update.currentReservation = null;
      }

      await Table.findByIdAndUpdate(reservation.tableId, update);
      await emitTableUpdated(reservation.tableId);
    }

    const populated = await Reservation.findById(id)
      .populate("tableId", "number capacity status location")
      .lean();

    emitReservationUpdated(populated);

    res.json(populated);
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   DELETE
============================== */
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ error: "No encontrada" });
    }

    const tableId = reservation.tableId;

    await reservation.deleteOne();

    if (tableId) {
      await Table.findByIdAndUpdate(tableId, {
        status: "available",
        currentReservation: null,
      });

      await emitTableUpdated(tableId);
    }

    emitReservationDeleted(id);

    res.json({ message: "Reserva eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   AVAILABLE TABLES (FIXED LOGIC)
============================== */
export const getAvailableTables = async (req, res) => {
  try {
    const { startTime, endTime, guests } = req.query;

    const start = parseDate(startTime);
    const end = parseDate(endTime);

    if (!start || !end || !guests) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    const tables = await Table.find({
      capacity: { $gte: Number(guests) },
      status: { $ne: "maintenance" },
    });

    const available = [];

    for (const table of tables) {
      const conflict = await Reservation.exists({
        tableId: table._id,
        status: { $in: ACTIVE_STATUSES },
        startTime: { $lt: end },
        endTime: { $gt: start },
      });

      if (!conflict) available.push(table);
    }

    res.json(available);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};