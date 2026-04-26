import mongoose from "mongoose";
import Order        from "../models/Order.js";
import Product      from "../models/Product.js";
import Table        from "../models/Table.js";
import { io }       from "../server.js";
import { logger }   from "../config/logger.js";
import {
  ok, created, badRequest, notFound, serverError,
} from "../utils/response.js";

/* =========================================================
   CONSTANTS
========================================================= */
const ORDER_STATUS = ["pending", "in-progress", "completed", "cancelled"];
const ITEM_STATUS  = ["pending", "preparing", "ready", "served", "cancelled"];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const DISCOUNT_REASONS = ["WAIT_TIME", "QUALITY_ISSUE", "COMP", "EMPLOYEE", "OTHER"];

const validateActiveTableSession = async (tableId, sessionId, dbSession) => {
  const tableDoc = await Table.findById(tableId).session(dbSession);
  if (!tableDoc) return { error: "Mesa no encontrada", code: "notFound" };
  if (!tableDoc.canAcceptOrders()) return { error: "La mesa no está activa", code: "badRequest" };
  if (!tableDoc.isValidSession(sessionId)) return { error: "Sesión de mesa inválida", code: "badRequest" };
  return { tableDoc };
};

/* =========================================================
   SOCKET HELPERS — Emisión centralizada
========================================================= */
const emitOrderUpdate = (order) => {
  io.emit(`table:${order.table}`, { event: "order:update", order });
  io.to("orders:global").emit("order:update", order);
};

const emitOrderCreate = (order) => {
  io.emit(`table:${order.table}`, { event: "order:created", order });
  io.to("orders:global").emit("order:created",  order);
  io.to("role:kitchen").emit("order:new",        order);
  io.to("role:bartender").emit("order:new",      order);
};

const emitOrderDelete = (order) => {
  io.emit(`table:${order.table}`, { event: "order:deleted", order });
  io.to("orders:global").emit("order:deleted", order);
};

const emitTableUpdate = async (tableId) => {
  const table = await Table.findById(tableId).lean();
  if (!table) return;
  io.emit("table:update", table);
  io.to(`table:${tableId}`).emit("table:update", table);
};

/* =========================================================
   TABLE AUTO-CLOSE
========================================================= */
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

  table.status           = "maintenance";
  table.currentSessionId = null;
  await table.save();

  await emitTableUpdate(tableId);

  logger.info(`[Order] Mesa ${tableId} → mantenimiento por cierre de sesión`);

  setTimeout(async () => {
    const t = await Table.findById(tableId);
    if (t && t.status === "maintenance") {
      t.status = "available";
      await t.save();
      await emitTableUpdate(tableId);
      logger.info(`[Order] Mesa ${tableId} → disponible`);
    }
  }, 2 * 60 * 1000);
};

/* =========================================================
   GET ALL ORDERS
========================================================= */
export const getOrders = async (req, res, next) => {
  try {
    const { status, table, sessionId, sessionStatus, limit = 100 } = req.query;

    const filter = {};
    if (status)        filter.status        = status;
    if (sessionId)     filter.sessionId     = sessionId;
    if (table)         filter.table         = table;
    if (sessionStatus) filter.sessionStatus = sessionStatus;

    const orders = await Order.find(filter)
      .populate("table",         "number status")
      .populate("items.product", "name type")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return ok(res, orders);
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ONE ORDER
========================================================= */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const order = await Order.findById(id)
      .populate("table",         "number status")
      .populate("items.product", "name type price")
      .populate("createdBy",     "name role")
      .lean();

    if (!order) return notFound(res, "Orden no encontrada");

    return ok(res, order);
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   CREATE ORDER
========================================================= */
export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { items, table, sessionId, notes = "", priority = "normal" } = req.body;

    /* ─── Validaciones básicas ─── */
    if (!table)         return badRequest(res, "La mesa es requerida");
    if (!sessionId)     return badRequest(res, "El sessionId es requerido");
    if (!items?.length) return badRequest(res, "Debes agregar al menos un producto");

    /* ─── Validar mesa ─── */
    const tableValidation = await validateActiveTableSession(table, sessionId, session);
    if (tableValidation.error) {
      if (tableValidation.code === "notFound") return notFound(res, tableValidation.error);
      return badRequest(res, tableValidation.error);
    }

    /* ─── Obtener y mapear productos ─── */
    const productIds = items.map((i) => i.product);
    const products = await Product.find({
      _id: { $in: productIds },
      available: true,
      isActiveForPOS: true,
    }).session(session);

    if (products.length !== productIds.length) {
      return badRequest(res, "Uno o más productos no existen o están inactivos");
    }

    const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

    /* ─── Construir items ─── */
    const orderItems = items.map((item) => {
      const product = productMap[item.product?.toString()];
      if (!product) throw new Error("Producto inválido");

      return {
        product:  product._id,
        name:     product.name,
        quantity: Math.max(1, Number(item.quantity) || 1),
        price:    Number(product.price) || 0,
        type:     product.type === "food" ? "food" : "drink",
        status:   "pending",
        notes:    item.notes || "",
      };
    });

    /* ─── Crear orden ─── */
const [order] = await Order.create(
  [{
    items: orderItems, 
    table,
    sessionId,
    notes,
    priority,
    sessionStatus: "open",
    status: "pending",
    discountTotal: 0,
    createdBy: req.user?.id || null,
  }],
  { session }
);

    await session.commitTransaction();

    logger.info(`[Order] Nueva orden creada: ${order._id} → mesa ${table}`);
    emitOrderCreate(order);

    return created(res, order, "Orden creada correctamente");

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!ORDER_STATUS.includes(status)) {
      return badRequest(res, `Estado inválido. Válidos: ${ORDER_STATUS.join(", ")}`);
    }

    const order = await Order.findById(id);
    if (!order)                          return notFound(res, "Orden no encontrada");
    if (order.sessionStatus === "closed") return badRequest(res, "La orden ya está cerrada");

    order.status = status;

    if (["completed", "cancelled"].includes(status)) {
      order.sessionStatus = "closed";
      order.closedAt      = new Date();
    }

    await order.save();

    emitOrderUpdate(order);

    if (order.sessionStatus === "closed") {
      await handleTableAutoClose(order.table);
    }

    logger.info(`[Order] ${order._id} → status: ${status}`);

    return ok(res, order, `Orden ${status} correctamente`);
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE ITEM STATUS
========================================================= */
export const updateOrderItemStatus = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;
    const { status }          = req.body;

    if (!ITEM_STATUS.includes(status)) {
      return badRequest(res, `Estado inválido. Válidos: ${ITEM_STATUS.join(", ")}`);
    }

    const order = await Order.findById(orderId);
    if (!order) return notFound(res, "Orden no encontrada");

    const item = order.items.id(itemId);
    if (!item) return notFound(res, "Item no encontrado");

    item.status = status;

    /* ─── Auto estado de orden ─── */
    const allItems    = order.items;
    const allServed   = allItems.every((i)  => i.status === "served");
    const anyPreparing = allItems.some((i)  => i.status === "preparing");
    const anyReady     = allItems.some((i)  => i.status === "ready");

    if (allServed) {
      order.status        = "completed";
      order.sessionStatus = "closed";
      order.closedAt      = new Date();
    } else if (anyPreparing || anyReady) {
      order.status = "in-progress";
    }

    await order.save();

    emitOrderUpdate(order);

    /* Notificación específica al rol de delivery */
    if (status === "ready") {
      io.to("role:bartender").emit("item:ready", { orderId, itemId, item });
    }

    if (order.sessionStatus === "closed") {
      await handleTableAutoClose(order.table);
    }

    return ok(res, order, "Item actualizado");
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE ORDER
========================================================= */
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const order = await Order.findById(id);
    if (!order)                          return notFound(res, "Orden no encontrada");
    if (order.sessionStatus === "open")  return badRequest(res, "No puedes eliminar una orden activa");

    await order.deleteOne();

    emitOrderDelete(order);
    logger.info(`[Order] Eliminada: ${id}`);

    return ok(res, null, "Orden eliminada correctamente");
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   APPLY DISCOUNT
========================================================= */
export const applyDiscount = async (req, res, next) => {
  try {
    const { orderId }                  = req.params;
    const { type, value, items, reason, note } = req.body;

    if (!isValidId(orderId)) return badRequest(res, "ID inválido");

    if (!DISCOUNT_REASONS.includes(reason)) {
      return badRequest(res, `Razón inválida. Válidas: ${DISCOUNT_REASONS.join(", ")}`);
    }

    const order = await Order.findById(orderId);
    if (!order)                          return notFound(res, "Orden no encontrada");
    if (order.sessionStatus === "closed") return badRequest(res, "La orden está cerrada");

    /* ─── Filtrar items objetivo ─── */
    let targetItems = order.items;

    if (Array.isArray(items) && items.length > 0) {
      const ids = items.map((id) => id.toString());
      targetItems = order.items.filter((i) => i?._id && ids.includes(i._id.toString()));
      if (targetItems.length === 0) return badRequest(res, "Items de descuento inválidos");
    }

    /* ─── Calcular descuento ─── */
    const subtotal = targetItems.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);

    if (subtotal <= 0) return badRequest(res, "Subtotal inválido para aplicar descuento");

    let discountAmount = type === "PERCENT"
      ? (subtotal * value) / 100
      : Number(value);

    if (discountAmount <= 0)        return badRequest(res, "El descuento debe ser mayor a 0");
    if (discountAmount > subtotal)  return badRequest(res, "El descuento no puede superar el subtotal");

    /* ─── Aplicar ─── */
    order.discountTotal = (order.discountTotal || 0) + discountAmount;
    const normalizedItemIds = Array.isArray(items)
      ? items.map((id) => id.toString())
      : [];

    order.discounts.push({
      type,
      value: Number(value),
      amount: discountAmount,
      reason,
      note: note || "",
      items: normalizedItemIds,
      appliedAt: new Date(),
    });

    await order.save();
    emitOrderUpdate(order);

    logger.info(`[Order] Descuento de $${discountAmount} aplicado a ${orderId}`);

    return ok(res, order, `Descuento de $${discountAmount.toFixed(2)} aplicado`);
  } catch (error) {
    next(error);
  }
};
