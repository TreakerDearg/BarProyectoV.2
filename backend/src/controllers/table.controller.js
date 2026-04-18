import mongoose from "mongoose";
import Table from "../models/Table.js";
import Order from "../models/Order.js";

/* ==============================
   HELPERS
============================== */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const notFound = (res, msg) =>
  res.status(404).json({ error: msg });

const badRequest = (res, msg) =>
  res.status(400).json({ error: msg });

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
      .populate("orders")
      .sort({ number: 1 });

    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET ONE TABLE
============================== */
export const getTableById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return badRequest(res, "ID inválido");
    }

    const table = await Table.findById(req.params.id).populate("orders");

    if (!table) return notFound(res, "Mesa no encontrada");

    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   CREATE TABLE
============================== */
export const createTable = async (req, res) => {
  try {
    const { number, capacity, location } = req.body;

    if (!number || !capacity) {
      return badRequest(res, "Número y capacidad son obligatorios");
    }

    const exists = await Table.findOne({ number });
    if (exists) {
      return badRequest(res, "Ya existe una mesa con ese número");
    }

    const table = await Table.create({
      number,
      capacity,
      location,
    });

    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   UPDATE TABLE
============================== */
export const updateTable = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return badRequest(res, "ID inválido");
    }

    const allowed = [
      "number",
      "capacity",
      "location",
      "notes",
      "currentReservation",
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!table) return notFound(res, "Mesa no encontrada");

    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   DELETE TABLE
============================== */
export const deleteTable = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return badRequest(res, "ID inválido");
    }

    const table = await Table.findById(req.params.id);
    if (!table) return notFound(res, "Mesa no encontrada");

    if (table.status === "occupied") {
      return badRequest(res, "No se puede eliminar una mesa ocupada");
    }

    await table.deleteOne();

    res.json({ message: "Mesa eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   OPEN TABLE
============================== */
export const openTable = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return badRequest(res, "ID inválido");
    }

    const table = await Table.findById(req.params.id);
    if (!table) return notFound(res, "Mesa no encontrada");

    if (table.status === "occupied") {
      return badRequest(res, "La mesa ya está ocupada");
    }

    table.status = "occupied";
    table.openedAt = new Date();
    table.closedAt = null;

    await table.save();

    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   CLOSE TABLE
============================== */
export const closeTable = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return badRequest(res, "ID inválido");
    }

    const table = await Table.findById(req.params.id);
    if (!table) return notFound(res, "Mesa no encontrada");

    table.status = "available";
    table.closedAt = new Date();
    table.orders = [];
    table.currentReservation = null;
    table.tags = [];

    await table.save();

    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   ASSIGN ORDER
============================== */
export const assignOrderToTable = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!isValidId(req.params.id) || !isValidId(orderId)) {
      return badRequest(res, "ID inválido");
    }

    const [table, order] = await Promise.all([
      Table.findById(req.params.id),
      Order.findById(orderId),
    ]);

    if (!table) return notFound(res, "Mesa no encontrada");
    if (!order) return notFound(res, "Orden no encontrada");

    if (table.orders.includes(order._id)) {
      return badRequest(res, "Orden ya asignada a esta mesa");
    }

    table.orders.push(order._id);

    if (table.status !== "occupied") {
      table.status = "occupied";
      table.openedAt = table.openedAt || new Date();
    }

    await table.save();

    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET TABLE ORDERS
============================== */
export const getTableOrders = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return badRequest(res, "ID inválido");
    }

    const table = await Table.findById(req.params.id).populate({
      path: "orders",
      populate: { path: "items.productId" },
    });

    if (!table) return notFound(res, "Mesa no encontrada");

    res.json(table.orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   TAGS
============================== */
export const addTableTag = async (req, res) => {
  try {
    const { label, type = "other", priority = "low" } = req.body;

    if (!label) return badRequest(res, "Label obligatorio");

    const table = await Table.findById(req.params.id);
    if (!table) return notFound(res, "Mesa no encontrada");

    const exists = table.tags.some(
      (t) => t.label.toLowerCase() === label.toLowerCase()
    );

    if (exists) {
      return badRequest(res, "Tag ya existe");
    }

    table.tags.push({ label, type, priority });

    await table.save();

    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeTableTag = async (req, res) => {
  try {
    const { label } = req.params;

    const table = await Table.findById(req.params.id);
    if (!table) return notFound(res, "Mesa no encontrada");

    table.tags = table.tags.filter(
      (t) => t.label.toLowerCase() !== label.toLowerCase()
    );

    await table.save();

    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearTableTags = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return notFound(res, "Mesa no encontrada");

    table.tags = [];

    await table.save();

    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};