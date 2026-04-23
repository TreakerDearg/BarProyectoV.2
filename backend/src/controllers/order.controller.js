import mongoose from "mongoose";
import Order from "../models/Order.js";
import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import Product from "../models/Product.js";
import Table from "../models/Table.js";

import { io } from "../server.js";

/* ==============================
   HELPERS
============================== */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendError = (res, status, msg) =>
  res.status(status).json({ error: msg });

const ORDER_STATUS = ["pending", "in-progress", "completed", "cancelled"];
const ITEM_STATUS = ["pending", "preparing", "ready", "delivered"];

/* ==============================
   SOCKET HELPERS (CENTRALIZADO)
============================== */
const emitOrderUpdate = (order) => {
  io.emit("order:update", order);
  io.to(`table:${order.table}`).emit("order:update", order);
};

const emitOrderCreate = (order) => {
  io.emit("order:created", order);
  io.to(`table:${order.table}`).emit("order:created", order);
};

const emitOrderDelete = (order) => {
  io.emit("order:deleted", order);
  io.to(`table:${order.table}`).emit("order:deleted", order);
};

const emitTableUpdate = async (tableId) => {
  const table = await Table.findById(tableId);
  if (!table) return;

  io.emit("table:update", table);
  io.to(`table:${tableId}`).emit("table:update", table);
};

/* ==============================
   TABLE AUTO CLOSE (ROBUSTO)
============================== */
const handleTableAutoClose = async (tableId) => {
  if (!isValidId(tableId)) return;

  const activeOrders = await Order.countDocuments({
    table: tableId,
    sessionStatus: "open",
  });

  if (activeOrders > 0) return;

  const table = await Table.findById(tableId);
  if (!table) return;

  if (["maintenance", "available"].includes(table.status)) return;

  table.status = "maintenance";
  table.currentSessionId = null;

  await table.save();

  await emitTableUpdate(tableId);

  setTimeout(async () => {
    const t = await Table.findById(tableId);
    if (!t) return;

    if (t.status === "maintenance") {
      t.status = "available";
      await t.save();

      await emitTableUpdate(tableId);
    }
  }, 2 * 60 * 1000);
};

/* ==============================
   GET ORDERS
============================== */
export const getOrders = async (req, res) => {
  try {
    const { status, table, sessionId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (sessionId) filter.sessionId = sessionId;
    if (table) filter.table = table;

    const orders = await Order.find(filter)
      .populate("table")
      .populate("items.product")
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      orders.map((o) => ({
        ...o,
        tableNumber: o.table?.number,
      }))
    );
  } catch {
    sendError(res, 500, "No se pudieron obtener las órdenes");
  }
};

/* ==============================
   GET ONE
============================== */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, "ID inválido");
    }

    const order = await Order.findById(id)
      .populate("table")
      .populate("items.product");

    if (!order) {
      return sendError(res, 404, "Orden no encontrada");
    }

    res.json({
      ...order.toObject(),
      tableNumber: order.table?.number,
    });
  } catch {
    sendError(res, 500, "Error al obtener la orden");
  }
};

/* ==============================
   CREATE ORDER
============================== */
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { items, table, sessionId, notes = "" } = req.body;

    if (!items?.length) {
      throw new Error("Debes agregar productos");
    }

    const tableDoc = await Table.findById(table).session(session);

    if (!tableDoc) throw new Error("Mesa no encontrada");

    if (tableDoc.status !== "occupied") {
      throw new Error("Mesa no activa");
    }

    if (tableDoc.currentSessionId !== sessionId) {
      throw new Error("Sesión inválida");
    }

    const productIds = items.map((i) => i.product);

    const products = await Product.find({
      _id: { $in: productIds },
    }).session(session);

    if (products.length !== productIds.length) {
      throw new Error("Uno o más productos no existen");
    }

    const recipes = await Recipe.find({
      product: { $in: productIds },
    }).session(session);

    const inventoryIds = recipes.flatMap((r) =>
      r.ingredients.map((i) => i.inventoryItem)
    );

    const inventoryItems = await InventoryItem.find({
      _id: { $in: inventoryIds },
    }).session(session);

    const productMap = Object.fromEntries(
      products.map((p) => [p._id.toString(), p])
    );

    const recipeMap = Object.fromEntries(
      recipes.map((r) => [r.product.toString(), r])
    );

    const inventoryMap = Object.fromEntries(
      inventoryItems.map((i) => [i._id.toString(), i])
    );

    /* =========================
       STOCK VALIDATION
    ========================= */
    for (const item of items) {
      const recipe = recipeMap[item.product];
      if (!recipe) continue;

      for (const ing of recipe.ingredients) {
        const inv = inventoryMap[ing.inventoryItem];
        if (!inv) continue;

        const required = ing.quantity * item.quantity;

        if (inv.stock < required) {
          throw new Error(`Stock insuficiente: ${inv.name}`);
        }
      }
    }

    /* =========================
       DECREMENT STOCK
    ========================= */
    for (const item of items) {
      const recipe = recipeMap[item.product];
      if (!recipe) continue;

      for (const ing of recipe.ingredients) {
        const inv = inventoryMap[ing.inventoryItem];
        if (!inv) continue;

        inv.stock -= ing.quantity * item.quantity;
      }
    }

    await Promise.all(
      Object.values(inventoryMap).map((i) =>
        i.save({ session })
      )
    );

    /* =========================
       BUILD ORDER ITEMS
    ========================= */
    let total = 0;

    const orderItems = items.map((item) => {
      const product = productMap[item.product];

      if (!product) {
        throw new Error("Producto inválido en items");
      }

      const price = product.price || 0;
      const subtotal = price * item.quantity;
      total += subtotal;

      return {
        product: product._id,
        quantity: item.quantity,
        price,
        type: product.type || "drink",
        status: "pending",
      };
    });

    /* =========================
       CREATE ORDER
    ========================= */
    const [order] = await Order.create(
      [
        {
          items: orderItems,
          total,
          table,
          sessionId,
          notes,
          sessionStatus: "open",
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    emitOrderCreate(order);

    res.status(201).json(order);

  } catch (error) {
    await session.abortTransaction();

    console.log("CREATE ORDER ERROR:", error.message);

    sendError(res, 400, error.message);
  } finally {
    session.endSession();
  }
};
/* ==============================
   UPDATE ORDER STATUS
============================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!ORDER_STATUS.includes(status)) {
      return sendError(res, 400, "Estado inválido");
    }

    const order = await Order.findById(id);

    if (!order) return sendError(res, 404, "Orden no encontrada");

    if (order.sessionStatus === "closed") {
      return sendError(res, 400, "Orden ya cerrada");
    }

    order.status = status;

    if (["completed", "cancelled"].includes(status)) {
      order.sessionStatus = "closed";
      order.closedAt = new Date();
    }

    await order.save();

    emitOrderUpdate(order);

    if (order.sessionStatus === "closed") {
      await handleTableAutoClose(order.table);
    }

    res.json(order);

  } catch {
    sendError(res, 500, "Error al actualizar orden");
  }
};

/* ==============================
   UPDATE ITEM STATUS
============================== */
export const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    if (!ITEM_STATUS.includes(status)) {
      return sendError(res, 400, "Estado inválido");
    }

    const order = await Order.findById(orderId);

    if (!order) return sendError(res, 404, "Orden no encontrada");

    const item = order.items.id(itemId);
    if (!item) return sendError(res, 404, "Item no encontrado");

    item.status = status;

    const allDelivered = order.items.every(
      (i) => i.status === "delivered"
    );

    const anyPreparing = order.items.some(
      (i) => i.status === "preparing"
    );

    if (allDelivered) {
      order.status = "completed";
      order.sessionStatus = "closed";
      order.closedAt = new Date();
    } else if (anyPreparing) {
      order.status = "in-progress";
    }

    await order.save();

    emitOrderUpdate(order);

    if (order.sessionStatus === "closed") {
      await handleTableAutoClose(order.table);
    }

    res.json(order);

  } catch {
    sendError(res, 500, "Error al actualizar item");
  }
};

/* ==============================
   DELETE ORDER
============================== */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, "ID inválido");
    }

    const order = await Order.findById(id);

    if (!order) return sendError(res, 404, "Orden no encontrada");

    if (order.sessionStatus === "open") {
      return sendError(res, 400, "No puedes eliminar orden activa");
    }

    await order.deleteOne();

    emitOrderDelete(order);

    res.json({ message: "Orden eliminada correctamente" });

  } catch {
    sendError(res, 500, "Error al eliminar orden");
  }
};