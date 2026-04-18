import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";

/* ==============================
   HELPERS
============================== */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const isOverlap = (startA, endA, startB, endB) => {
  return new Date(startA) < new Date(endB) &&
         new Date(endA) > new Date(startB);
};

/* ==============================
   GET RESERVATIONS
============================== */
export const getReservations = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const reservations = await Reservation.find(filter)
      .populate("tableId")
      .sort({ startTime: -1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   CREATE RESERVATION
============================== */
export const createReservation = async (req, res) => {
  try {
    const { startTime, endTime, guests, tableId } = req.body;

    if (!startTime || !endTime || !guests) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ error: "Horario inválido" });
    }

    let assignedTable = null;

    /* ==========================
       VALIDACIÓN MESA MANUAL
    ========================== */
    if (tableId) {
      if (!isValidId(tableId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const table = await Table.findById(tableId);
      if (!table) {
        return res.status(404).json({ error: "Mesa no encontrada" });
      }

      if (table.capacity < guests) {
        return res.status(400).json({
          error: "Capacidad insuficiente",
        });
      }

      const conflict = await Reservation.findOne({
        tableId,
        status: { $nin: ["cancelled", "completed"] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      });

      if (conflict) {
        return res.status(400).json({
          error: "Mesa ocupada en ese horario",
        });
      }

      assignedTable = table._id;
    }

    /* ==========================
       AUTO ASIGNACIÓN INTELIGENTE
    ========================== */
    if (!assignedTable) {
      const tables = await Table.find({
        capacity: { $gte: guests },
      }).sort({ capacity: 1 });

      for (const table of tables) {
        const conflict = await Reservation.findOne({
          tableId: table._id,
          status: { $nin: ["cancelled", "completed"] },
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        });

        if (!conflict) {
          assignedTable = table._id;
          break;
        }
      }
    }

    const reservation = await Reservation.create({
      ...req.body,
      tableId: assignedTable,
    });

    const populated = await reservation.populate("tableId");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   UPDATE STATUS (FLOW PRO)
============================== */
export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = [
      "pending",
      "confirmed",
      "seated",
      "completed",
      "cancelled",
      "no-show",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        error: "Reservación no encontrada",
      });
    }

    reservation.status = status;

    const tableId = reservation.tableId;

    /* ==========================
       SYNC CON MESA
    ========================== */
    if (tableId) {
      if (status === "seated") {
        await Table.findByIdAndUpdate(tableId, {
          status: "occupied",
          currentReservation: reservation._id,
          openedAt: new Date(),
        });
      }

      if (["completed", "cancelled", "no-show"].includes(status)) {
        await Table.findByIdAndUpdate(tableId, {
          status: "available",
          currentReservation: null,
          closedAt: new Date(),
        });
      }
    }

    await reservation.save();

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   DELETE RESERVATION
============================== */
export const deleteReservation = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        error: "Reservación no encontrada",
      });
    }

    await reservation.deleteOne();

    res.json({ message: "Reservación eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   AVAILABLE TABLES (OPTIMIZADO)
============================== */
export const getAvailableTables = async (req, res) => {
  try {
    const { startTime, endTime, guests } = req.query;

    if (!startTime || !endTime || !guests) {
      return res.status(400).json({
        error: "Parámetros incompletos",
      });
    }

    const tables = await Table.find({
      capacity: { $gte: Number(guests) },
    });

    const available = [];

    for (const table of tables) {
      const conflict = await Reservation.findOne({
        tableId: table._id,
        status: { $nin: ["cancelled", "completed"] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      });

      if (!conflict) available.push(table);
    }

    res.json(available);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET BY ID
============================== */
export const getReservationById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const reservation = await Reservation.findById(req.params.id)
      .populate("tableId");

    if (!reservation) {
      return res.status(404).json({
        error: "Reservación no encontrada",
      });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};