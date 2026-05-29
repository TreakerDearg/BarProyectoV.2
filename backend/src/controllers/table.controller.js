import mongoose from "mongoose";
import Table   from "../models/Table.js";
import Order   from "../models/Order.js";
import TableAnalytics from "../models/TableAnalytics.js";
import { io }  from "../server.js";
import { logger } from "../config/logger.js";
import {
  ok, created, badRequest, notFound, conflict,
} from "../utils/response.js";
import {
  startServiceSession,
  completeReservationOnTableClose,
} from "../services/tableSession.service.js";

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
   GET ALL TABLES (con órdenes activas adjuntas y cálculos de totales)
========================================================= */
export const getTables = async (req, res, next) => {
  try {
    const { status, location } = req.query;

    const filter = {};
    if (status)   filter.status   = status;
    if (location) filter.location = location;

    const tables = await Table.find(filter).sort({ number: 1 }).lean();

    /* Adjuntar órdenes activas por mesa */
    const tableIds = tables.map((t) => t._id);
    const orders   = await Order.find({ table: { $in: tableIds }, sessionStatus: "open" })
      .populate("items.product", "name type price")
      .lean();

    /* Calcular totales por mesa */
    const grouped = orders.reduce((acc, o) => {
      const key = o.table.toString();
      if (!acc[key]) {
        acc[key] = {
          orders: [],
          totalAmount: 0,
          totalItems: 0,
          itemCounts: {}
        };
      }
      
      acc[key].orders.push(o);
      
      /* Calcular total de la orden */
      const orderTotal = o.items.reduce((sum, item) => {
        return sum + (item.price || 0) * (item.quantity || 0);
      }, 0);
      acc[key].totalAmount += orderTotal;
      
      /* Calcular total de items */
      const orderItems = o.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      acc[key].totalItems += orderItems;
      
      /* Contar items por nombre */
      o.items.forEach(item => {
        const name = item.name || "Sin nombre";
        acc[key].itemCounts[name] = (acc[key].itemCounts[name] || 0) + (item.quantity || 0);
      });
      
      return acc;
    }, {});

    const data = tables.map((t) => {
      const tableData = grouped[t._id.toString()] || { orders: [], totalAmount: 0, totalItems: 0, itemCounts: {} };
      return {
        ...t,
        orders: tableData.orders,
        totalAmount: tableData.totalAmount,
        totalItems: tableData.totalItems,
        itemCounts: tableData.itemCounts
      };
    });

    return ok(res, data);
  } catch (error) { throw error; }
};

/* =========================================================
   GET ONE (con órdenes activas y cálculos de totales)
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

    /* Calcular totales */
    const totalAmount = orders.reduce((sum, o) => {
      return sum + o.items.reduce((orderSum, item) => {
        return orderSum + (item.price || 0) * (item.quantity || 0);
      }, 0);
    }, 0);

    const totalItems = orders.reduce((sum, o) => {
      return sum + o.items.reduce((orderSum, item) => orderSum + (item.quantity || 0), 0);
    }, 0);

    const itemCounts = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const name = item.name || "Sin nombre";
        itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 0);
      });
    });

    return ok(res, {
      ...table,
      orders,
      totalAmount,
      totalItems,
      itemCounts
    });
  } catch (error) { throw error; }
};

/* =========================================================
   CREATE TABLE
========================================================= */
export const createTable = async (req, res, next) => {
  try {
    const { number, capacity, location = "indoor", notes, x, y, width, height, shape } = req.body;

    if (!number || !capacity) {
      return badRequest(res, "number y capacity son obligatorios");
    }

    const exists = await Table.findOne({ number });
    if (exists) return conflict(res, `La mesa #${number} ya existe`);

    const table = await Table.create({
      number,
      capacity,
      location,
      notes,
      x,
      y,
      width,
      height,
      shape
    });

    logger.info(`[Table] Creada: mesa #${number}`);
    const createdTable = await Table.findById(table._id).lean();
    io.emit("table:created", createdTable);
    await emitTableUpdate(table._id);

    return created(res, table, `Mesa #${number} creada correctamente`);
  } catch (error) { throw error; }
};

/* =========================================================
   UPDATE TABLE
========================================================= */
export const updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const ALLOWED = ["number", "capacity", "location", "notes", "x", "y", "width", "height", "shape"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );

    const table = await Table.findByIdAndUpdate(id, updates, {
      new: true, runValidators: true,
    });

    if (!table) return notFound(res, "Mesa no encontrada");

    await emitTableUpdate(id);
    return ok(res, table, "Mesa actualizada correctamente");
  } catch (error) { throw error; }
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
  } catch (error) { throw error; }
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

    try {
      const result = await startServiceSession(id, {
        reservationId: table.currentReservation?.toString() || null,
        allowWalkIn: table.status === "available",
      });

      const sessionId = result.sessionId;
      const updated = result.table || (await Table.findById(id).lean());

      io.emit("table:opened", { tableId: id, sessionId });
      logger.info(`[Table] Abierta: mesa #${table.number} (session: ${sessionId})`);
      return ok(
        res,
        { sessionId, table: updated },
        result.alreadyActive ? "Mesa ya activa" : "Mesa abierta correctamente"
      );
    } catch (err) {
      if (err.code === "badRequest") return badRequest(res, err.message);
      if (err.code === "notFound") return notFound(res, err.message);
      throw err;
    }
  } catch (error) { throw error; }
};

/* =========================================================
   CLOSE TABLE (END SESSION)
========================================================= */
export const closeTable = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { goToMaintenance = false, maintenanceMinutes = 5 } = req.body;

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

    if (goToMaintenance) {
      /* Pasar a mantenimiento por X minutos */
      const maintenanceUntil = new Date(Date.now() + maintenanceMinutes * 60 * 1000);
      table.setMaintenance(maintenanceUntil);
      table.lastSessionClosedAt = new Date();
    } else {
      /* Liberar mesa directamente */
      table.release();
      table.lastSessionClosedAt = new Date();
    }

    await table.save({ session });

    await session.commitTransaction();

    await completeReservationOnTableClose(id);
    await emitTableUpdate(id);
    io.emit("table:closed", { tableId: id });

    logger.info(`[Table] Cerrada: mesa #${table.number}`);
    return ok(res, table, "Mesa cerrada correctamente");
  } catch (error) {
    await session.abortTransaction();
    throw error;
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
  } catch (error) { throw error; }
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
  } catch (error) { throw error; }
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
  } catch (error) { throw error; }
};

/* =========================================================
   GET TABLE SESSION HISTORY (Integración con Payment)
========================================================= */
export const getTableSessionHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const table = await Table.findById(id).lean();
    if (!table) return notFound(res, "Mesa no encontrada");

    // Obtener historial de sesiones basado en lastSessionClosedAt
    // Por ahora retornamos la información actual de la mesa
    // En el futuro, se puede implementar un modelo de SessionHistory

    const history = {
      tableId: table._id,
      tableNumber: table.number,
      currentSessionId: table.currentSessionId,
      totalPayments: table.totalPayments || 0,
      lastPaymentAt: table.lastPaymentAt,
      lastSessionClosedAt: table.lastSessionClosedAt,
      status: table.status,
    };

    return ok(res, history);
  } catch (error) { throw error; }
};

/* =========================================================
   TABLE ANALYTICS
========================================================= */

/**
 * Obtener analytics generales de todas las mesas
 */
export const getTableAnalytics = async (req, res, next) => {
  try {
    const { period = "daily", startDate, endDate } = req.query;

    const match = { period };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const analytics = await TableAnalytics.find(match)
      .populate("table", "number capacity location")
      .sort({ date: -1 })
      .limit(100)
      .lean();

    // Calcular agregaciones
    const summary = {
      totalTables: analytics.length,
      totalRevenue: analytics.reduce((sum, a) => sum + (a.revenue?.totalRevenue || 0), 0),
      totalSessions: analytics.reduce((sum, a) => sum + (a.occupancy?.totalSessions || 0), 0),
      averageOccupancy: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + (a.occupancy?.occupancyRate || 0), 0) / analytics.length
        : 0,
      averageOrderValue: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + (a.revenue?.averageOrderValue || 0), 0) / analytics.length
        : 0,
    };

    return ok(res, { analytics, summary });
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener analytics de una mesa específica
 */
export const getTableAnalyticsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = "daily", limit = 30 } = req.query;

    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const table = await Table.findById(id);
    if (!table) return notFound(res, "Mesa no encontrada");

    const analytics = await TableAnalytics.find({
      table: id,
      period,
    })
      .sort({ date: -1 })
      .limit(Number(limit))
      .lean();

    // Calcular promedios históricos
    const historical = {
      averageRevenue: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + (a.revenue?.totalRevenue || 0), 0) / analytics.length
        : 0,
      averageOccupancy: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + (a.occupancy?.occupancyRate || 0), 0) / analytics.length
        : 0,
      averageSessionDuration: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + (a.occupancy?.averageSessionDuration || 0), 0) / analytics.length
        : 0,
      totalRevenue: analytics.reduce((sum, a) => sum + (a.revenue?.totalRevenue || 0), 0),
      totalSessions: analytics.reduce((sum, a) => sum + (a.occupancy?.totalSessions || 0), 0),
    };

    return ok(res, { table, analytics, historical });
  } catch (error) {
    throw error;
  }
};

/**
 * Generar analytics para una mesa y período específicos
 */
export const generateTableAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, period = "daily" } = req.body;

    if (!isValidId(id)) return badRequest(res, "ID inválido");
    if (!date) return badRequest(res, "date es obligatorio");

    const table = await Table.findById(id);
    if (!table) return notFound(res, "Mesa no encontrada");

    const analytics = await TableAnalytics.generateAnalytics(id, new Date(date), period);

    logger.info(`[TableAnalytics] Generados analytics para mesa ${table.number} - ${period} - ${date}`);
    return created(res, analytics, "Analytics generados correctamente");
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener ranking de mesas por rendimiento
 */
export const getTablePerformanceRanking = async (req, res, next) => {
  try {
    const { period = "daily", limit = 10 } = req.query;

    const ranking = await TableAnalytics.getTableRanking(period, Number(limit));

    return ok(res, ranking);
  } catch (error) {
    throw error;
  }
};