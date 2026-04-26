import mongoose from "mongoose";
import Table   from "../models/Table.js";
import Order   from "../models/Order.js";
import { io }  from "../server.js";
import { logger } from "../config/logger.js";
import {
  ok, created, badRequest, notFound, conflict,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   SOCKET — Emitir update de mesa
========================================================= */
const emitTableUpdate = async (tableId) => {
  const table = await Table.findById(tableId).lean();
  if (!table) return;
  io.emit("table:update", table);
  io.to(`table:${tableId}`).emit("table:update", table);
};

/* =========================================================
   GET ALL TABLES (con órdenes activas adjuntas)
========================================================= */
export const getTables = async (req, res, next) => {
  try {
    const { status, location } = req.query;

    const filter = {};
    if (status)   filter.status   = status;
    if (location) filter.location = location;

    const tables = await Table.find(filter).sort({ number: 1 }).lean();

    /* Adjuntar órdenes abiertas por mesa */
    const tableIds = tables.map((t) => t._id);
    const orders   = await Order.find({ table: { $in: tableIds }, sessionStatus: "open" })
      .populate("items.product", "name type")
      .lean();

    const grouped = orders.reduce((acc, o) => {
      const key = o.table.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(o);
      return acc;
    }, {});

    const data = tables.map((t) => ({
      ...t,
      orders: grouped[t._id.toString()] || [],
    }));

    return ok(res, data);
  } catch (error) { next(error); }
};

/* =========================================================
   GET ONE (con órdenes abiertas)
========================================================= */
export const getTableById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const table = await Table.findById(id).lean();
    if (!table) return notFound(res, "Mesa no encontrada");

    const orders = await Order.find({ table: id, sessionStatus: "open" })
      .populate("items.product", "name type price")
      .lean();

    return ok(res, { ...table, orders });
  } catch (error) { next(error); }
};

/* =========================================================
   CREATE TABLE
========================================================= */
export const createTable = async (req, res, next) => {
  try {
    const { number, capacity, location = "indoor" } = req.body;

    if (!number || !capacity) {
      return badRequest(res, "number y capacity son obligatorios");
    }

    const exists = await Table.findOne({ number });
    if (exists) return conflict(res, `La mesa #${number} ya existe`);

    const table = await Table.create({ number, capacity, location });

    logger.info(`[Table] Creada: mesa #${number}`);
    await emitTableUpdate(table._id);

    return created(res, table, `Mesa #${number} creada correctamente`);
  } catch (error) { next(error); }
};

/* =========================================================
   UPDATE TABLE
========================================================= */
export const updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const ALLOWED = ["number", "capacity", "location", "notes"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    const table = await Table.findByIdAndUpdate(id, updates, {
      new: true, runValidators: true,
    });

    if (!table) return notFound(res, "Mesa no encontrada");

    await emitTableUpdate(id);
    return ok(res, table, "Mesa actualizada correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   DELETE TABLE
========================================================= */
export const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const activeOrders = await Order.countDocuments({ table: id, sessionStatus: "open" });
    if (activeOrders > 0) {
      return badRequest(res, "No puedes eliminar una mesa con órdenes activas");
    }

    const table = await Table.findByIdAndDelete(id);
    if (!table) return notFound(res, "Mesa no encontrada");

    io.emit("table:deleted", { tableId: id });
    logger.info(`[Table] Eliminada: mesa #${table.number}`);

    return ok(res, null, "Mesa eliminada correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   OPEN TABLE (START SESSION)
========================================================= */
export const openTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const table = await Table.findById(id);
    if (!table) return notFound(res, "Mesa no encontrada");

    /* Ya está ocupada → devolver sessionId existente */
    if (table.status === "occupied") {
      return ok(res, { sessionId: table.currentSessionId, table }, "Mesa ya activa");
    }

    const sessionId = new mongoose.Types.ObjectId().toString();
    table.startSession(sessionId);
    await table.save();

    await emitTableUpdate(id);
    io.emit("table:opened", { tableId: id, sessionId });

    logger.info(`[Table] Abierta: mesa #${table.number} (session: ${sessionId})`);
    return ok(res, { sessionId, table }, "Mesa abierta correctamente");
  } catch (error) { next(error); }
};

/* =========================================================
   CLOSE TABLE (END SESSION)
========================================================= */
export const closeTable = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    session.startTransaction();

    const table = await Table.findById(id).session(session);
    if (!table) { await session.abortTransaction(); return notFound(res, "Mesa no encontrada"); }
    if (!table.currentSessionId) { await session.abortTransaction(); return badRequest(res, "Mesa sin sesión activa"); }

    /* Cerrar órdenes abiertas */
    await Order.updateMany(
      { table: id, sessionStatus: "open" },
      { $set: { sessionStatus: "closed", closedAt: new Date() } },
      { session }
    );

    table.release();
    table.lastSessionClosedAt = new Date();
    await table.save({ session });

    await session.commitTransaction();

    await emitTableUpdate(id);
    io.emit("table:closed", { tableId: id });

    logger.info(`[Table] Cerrada: mesa #${table.number}`);
    return ok(res, table, "Mesa cerrada correctamente");
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/* =========================================================
   TAG SYSTEM
========================================================= */
export const addTableTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, type = "other", priority = "low" } = req.body;

    if (!isValidId(id)) return badRequest(res, "ID inválido");
    if (!label)         return badRequest(res, "label es obligatorio");

    const table = await Table.findById(id);
    if (!table) return notFound(res, "Mesa no encontrada");

    const exists = table.tags.some((t) => t.label.toLowerCase() === label.toLowerCase());
    if (exists) return conflict(res, "El tag ya existe en esta mesa");

    table.tags.push({ label, type, priority });
    await table.save();
    await emitTableUpdate(id);

    return ok(res, table, "Tag agregado");
  } catch (error) { next(error); }
};

export const removeTableTag = async (req, res, next) => {
  try {
    const { id, label } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const table = await Table.findById(id);
    if (!table) return notFound(res, "Mesa no encontrada");

    table.tags = table.tags.filter((t) => t.label.toLowerCase() !== label.toLowerCase());
    await table.save();
    await emitTableUpdate(id);

    return ok(res, table, "Tag eliminado");
  } catch (error) { next(error); }
};

export const clearTableTags = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const table = await Table.findById(id);
    if (!table) return notFound(res, "Mesa no encontrada");

    table.tags = [];
    await table.save();
    await emitTableUpdate(id);

    return ok(res, table, "Tags eliminados");
  } catch (error) { next(error); }
};