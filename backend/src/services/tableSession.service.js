import mongoose from "mongoose";
import Table from "../models/Table.js";
import Reservation from "../models/Reservation.js";
import { io } from "../server.js";
import { logger } from "../config/logger.js";

const POPULATE_TABLE = "number capacity status location";

const emitTableUpdate = async (tableId) => {
  const table = await Table.findById(tableId).lean();
  if (table) {
    io.emit("table:update", table);
    io.to(`table:${tableId}`).emit("table:update", table);
  }
  return table;
};

const emitReservationUpdate = async (reservationId) => {
  if (!reservationId) return null;
  const populated = await Reservation.findById(reservationId).populate(
    "tableId",
    POPULATE_TABLE
  );
  if (populated) io.emit("reservation:update", populated);
  return populated;
};

/**
 * Inicia sesión POS unificada (walk-in o al sentar reserva).
 */
export async function startServiceSession(
  tableId,
  { reservationId = null, allowWalkIn = true } = {}
) {
  const table = await Table.findById(tableId);
  if (!table) {
    const err = new Error("Mesa no encontrada");
    err.code = "notFound";
    throw err;
  }

  if (table.status === "maintenance") {
    const err = new Error("Mesa en mantenimiento");
    err.code = "badRequest";
    throw err;
  }

  if (table.status === "occupied" && table.currentSessionId) {
    return {
      table: await Table.findById(tableId).lean(),
      sessionId: table.currentSessionId,
      alreadyActive: true,
    };
  }

  if (table.status === "reserved") {
    if (!reservationId) {
      const err = new Error(
        "Esta mesa está reservada. Confirma y senta la reserva desde Nebula · Reservas."
      );
      err.code = "badRequest";
      throw err;
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      const err = new Error("Reserva no encontrada");
      err.code = "notFound";
      throw err;
    }

    if (
      String(reservation.tableId) !== String(tableId) &&
      reservation.tableId
    ) {
      const err = new Error("La reserva no corresponde a esta mesa");
      err.code = "badRequest";
      throw err;
    }

    if (!["pending", "confirmed"].includes(reservation.status)) {
      const err = new Error(
        `No se puede sentar: la reserva está en estado "${reservation.status}"`
      );
      err.code = "badRequest";
      throw err;
    }
  } else if (!allowWalkIn && table.status !== "available") {
    const err = new Error("La mesa no está disponible para abrir");
    err.code = "badRequest";
    throw err;
  }

  const sessionId = new mongoose.Types.ObjectId().toString();
  table.startSession(sessionId);

  if (reservationId) {
    table.currentReservation = reservationId;
    table.reservationStart = null;
    table.reservationEnd = null;

    const reservation = await Reservation.findById(reservationId);
    if (reservation) {
      reservation.status = "seated";
      reservation.seatedAt = new Date();
      reservation.posSessionId = sessionId;
      await reservation.save();
    }
  }

  await table.save();

  const lean = await emitTableUpdate(tableId);
  await emitReservationUpdate(reservationId);

  logger.info(
    `[TableSession] Sesión ${sessionId} en mesa #${table.number}${reservationId ? ` (reserva ${reservationId})` : ""}`
  );

  return { table: lean, sessionId, alreadyActive: false };
}

/**
 * Al cerrar mesa, completa la reserva vinculada si estaba sentada.
 */
export async function completeReservationOnTableClose(tableId) {
  const table = await Table.findById(tableId);
  if (!table?.currentReservation) return null;

  const reservation = await Reservation.findById(table.currentReservation);
  if (!reservation) return null;

  if (reservation.status === "seated") {
    reservation.status = "completed";
    await reservation.save();
    await emitReservationUpdate(reservation._id);
    logger.info(`[TableSession] Reserva ${reservation._id} completada al cerrar mesa`);
    return reservation;
  }

  return null;
}
