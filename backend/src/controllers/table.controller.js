import mongoose from "mongoose";
import Table from "../models/Table.js";
import Order from "../models/Order.js";
import { io } from "../server.js";

/* ==============================
   HELPERS
============================== */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const badRequest = (res, msg) =>
  res.status(400).json({ error: msg });

const notFound = (res, msg) =>
  res.status(404).json({ error: msg });

const serverError = (res, error, ctx = "") => {
  console.error("TABLE ERROR:", ctx, error);
  return res.status(500).json({
    error: error.message,
    context: ctx,
  });
};

/* ==============================
   SOCKET HELPERS
============================== */
const emitTableUpdate = async (tableId) => {
  const table = await Table.findById(tableId)
    .populate("currentReservation")
    .lean();

  if (!table) return;

  io.emit("table:update", table);
  io.to(`table:${tableId}`).emit("table:update", table);
};

/* ==============================
   GET TABLES
============================== */
export const getTables = async (req, res) => {
  try {
    const { status, location } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (location) filter.location = location;

    const tables = await Table.find(filter)
      .sort({ number: 1 })
      .lean();

    const tableIds = tables.map((t) => t._id);

    const orders = await Order.find({
      table: { $in: tableIds },
      sessionStatus: "open",
    })
      .populate("items.product")
      .lean();

    const grouped = orders.reduce((acc, o) => {
      const key = o.table.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(o);
      return acc;
    }, {});

    res.json(
      tables.map((t) => ({
        ...t,
        orders: grouped[t._id.toString()] || [],
      }))
    );
  } catch (error) {
    return serverError(res, error, "getTables");
  }
};

/* ==============================
   OPEN TABLE
============================== */
export const openTable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) return badRequest(res, "Invalid ID");

    const table = await Table.findById(id);
    if (!table) return notFound(res, "Table not found");

    if (table.status === "occupied") {
      return badRequest(res, "Table already in use");
    }

    const sessionId = new mongoose.Types.ObjectId().toString();

    table.status = "occupied";
    table.currentSessionId = sessionId;
    table.statusChangedAt = new Date();

    await table.save();

    await emitTableUpdate(id);

    io.emit("table:opened", { tableId: id, sessionId });

    return res.json({
      ...table.toObject(),
      sessionId,
    });
  } catch (error) {
    return serverError(res, error, "openTable");
  }
};

/* ==============================
   CLOSE TABLE
============================== */
export const closeTable = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!isValidId(id)) return badRequest(res, "Invalid ID");

    session.startTransaction();

    const table = await Table.findById(id).session(session);
    if (!table) {
      await session.abortTransaction();
      return notFound(res, "Table not found");
    }

    await Order.updateMany(
      { table: id, sessionStatus: "open" },
      {
        $set: {
          sessionStatus: "closed",
          closedAt: new Date(),
        },
      },
      { session }
    );

    table.status = "available";
    table.currentSessionId = null;
    table.statusChangedAt = new Date();

    await table.save({ session });

    await session.commitTransaction();

    await emitTableUpdate(id);

    io.emit("table:closed", { tableId: id });

    return res.json({
      message: "Mesa cerrada correctamente",
      table,
    });

  } catch (error) {
    await session.abortTransaction();
    return serverError(res, error, "closeTable");
  } finally {
    session.endSession();
  }
};

/* ==============================
   CREATE TABLE
============================== */
export const createTable = async (req, res) => {
  try {
    const { number, capacity, location = "indoor" } = req.body;

    const exists = await Table.findOne({ number });
    if (exists) return badRequest(res, "Table already exists");

    const table = await Table.create({
      number,
      capacity,
      location,
    });

    await emitTableUpdate(table._id);

    return res.status(201).json(table);
  } catch (error) {
    return serverError(res, error, "createTable");
  }
};

/* ==============================
   UPDATE TABLE
============================== */
export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) return badRequest(res, "Invalid ID");

    const allowed = ["number", "capacity", "location", "notes"];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) =>
        allowed.includes(k)
      )
    );

    const table = await Table.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!table) return notFound(res, "Table not found");

    await emitTableUpdate(id);

    return res.json(table);
  } catch (error) {
    return serverError(res, error, "updateTable");
  }
};

/* ==============================
   DELETE TABLE
============================== */
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) return badRequest(res, "Invalid ID");

    const activeOrders = await Order.countDocuments({
      table: id,
      sessionStatus: "open",
    });

    if (activeOrders > 0) {
      return badRequest(res, "Table has active orders");
    }

    await Table.findByIdAndDelete(id);

    io.emit("table:deleted", { tableId: id });

    return res.json({ message: "Table deleted" });
  } catch (error) {
    return serverError(res, error, "deleteTable");
  }
};

/* ==============================
   TAG SYSTEM
============================== */
export const addTableTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, type = "other", priority = "low" } = req.body;

    const table = await Table.findById(id);
    if (!table) return notFound(res, "Table not found");

    const exists = table.tags.some(
      (t) => t.label.toLowerCase() === label.toLowerCase()
    );

    if (exists) return badRequest(res, "Tag already exists");

    table.tags.push({ label, type, priority });
    await table.save();

    await emitTableUpdate(id);

    return res.json(table);
  } catch (error) {
    return serverError(res, error, "addTableTag");
  }
};

export const removeTableTag = async (req, res) => {
  try {
    const { id, label } = req.params;

    const table = await Table.findById(id);
    if (!table) return notFound(res, "Table not found");

    table.tags = table.tags.filter(
      (t) => t.label.toLowerCase() !== label.toLowerCase()
    );

    await table.save();

    await emitTableUpdate(id);

    return res.json(table);
  } catch (error) {
    return serverError(res, error, "removeTableTag");
  }
};

export const clearTableTags = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findById(id);
    if (!table) return notFound(res, "Table not found");

    table.tags = [];
    await table.save();

    await emitTableUpdate(id);

    return res.json(table);
  } catch (error) {
    return serverError(res, error, "clearTableTags");
  }
};

/* ==============================
   GET TABLE BY ID
============================== */
export const getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return badRequest(res, "Invalid ID");
    }

    const table = await Table.findById(id).lean();

    if (!table) return notFound(res, "Table not found");

    const orders = await Order.find({
      table: id,
      sessionStatus: "open",
    })
      .populate("items.product")
      .lean();

    res.json({
      ...table,
      orders,
    });

  } catch (error) {
    return serverError(res, error, "getTableById");
  }
};