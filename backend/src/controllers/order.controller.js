import mongoose from "mongoose";
import Order        from "../models/Order.js";
import Product      from "../models/Product.js";
import Menu         from "../models/Menu.js";
import Table        from "../models/Table.js";
import Discount     from "../models/Discount.js";
import ActivityLog  from "../models/ActivityLog.js";
import { io }       from "../server.js";
import { logger }   from "../config/logger.js";
import {
  ok, created, badRequest, notFound, serverError, forbidden,
} from "../utils/response.js";
import { calculateProductPrice } from "../utils/pricingEngine.js";

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

/* =========================================================
   MENU EXPANSION HELPER
========================================================= */
const expandMenuItems = async (menuId, session) => {
  const menu = await Menu.findById(menuId).session(session);
  if (!menu) throw new Error("Menú no encontrado");

  // Extraer todos los productos de todas las categorías
  const productIds = menu.categories.flatMap(cat =>
    cat.products.map(p => p.product)
  );

  const products = await Product.find({
    _id: { $in: productIds },
    available: true,
    isActiveForPOS: true,
  }).session(session);

  return products;
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
    throw error;
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
    throw error;
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
    if (!items?.length) return badRequest(res, "Debes agregar al menos un producto o menú");

    /* ─── Validar mesa ─── */
    const tableValidation = await validateActiveTableSession(table, sessionId, session);
    if (tableValidation.error) {
      if (tableValidation.code === "notFound") return notFound(res, tableValidation.error);
      return badRequest(res, tableValidation.error);
    }

    /* ─── Separar productos y menús ─── */
    const productItems = items.filter(i => i.product && !i.menu);
    const menuItems = items.filter(i => i.menu);

    /* ─── Obtener productos ─── */
    const productIds = productItems.map((i) => i.product);
    const products = await Product.find({
      _id: { $in: productIds },
      available: true,
      isActiveForPOS: true,
    }).session(session);

    const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

    /* ─── Construir items de productos con precios dinámicos ─── */
    const orderItems = await Promise.all(productItems.map(async (item) => {
      const product = productMap[item.product?.toString()];
      if (!product) throw new Error("Producto inválido");

      const dynamicPrice = await calculateProductPrice(product);

      return {
        product:  product._id,
        name:     product.name,
        quantity: Math.max(1, Number(item.quantity) || 1),
        price:    dynamicPrice,
        type:     product.type === "food" ? "food" : "drink",
        status:   "pending",
        notes:    item.notes || "",
      };
    }));

    /* ─── Procesar menús y expandir sus productos ─── */
    for (const menuItem of menuItems) {
      const menuProducts = await expandMenuItems(menuItem.menu, session);
      const menu = await Menu.findById(menuItem.menu).session(session);

      // Agregar el menú como un item tipo "menu"
      orderItems.push({
        menu:      menuItem.menu,
        name:      menu.name,
        quantity:  Math.max(1, Number(menuItem.quantity) || 1),
        price:     menuItem.price || 0, // Precio del menú completo
        type:      "menu",
        status:    "pending",
        notes:     menuItem.notes || "",
        menuItems: menuProducts.map(p => p._id), // IDs de productos del menú
      });

      // Agregar productos individuales del menú como items separados
      for (const product of menuProducts) {
        const dynamicPrice = await calculateProductPrice(product);
        orderItems.push({
          product:  product._id,
          name:     product.name,
          quantity: Math.max(1, Number(menuItem.quantity) || 1),
          price:    dynamicPrice,
          type:     product.type === "food" ? "food" : "drink",
          status:   "pending",
          notes:    `Parte de menú: ${menu.name}`,
        });
      }
    }

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

    if (req.user?.id) {
      const userLog = await mongoose.model("User").findById(req.user.id).select("name role").lean();
      await ActivityLog.create([{
        userId: req.user.id,
        userName: userLog?.name || "Sistema",
        userRole: userLog?.role || "waiter",
        activityType: "order_created",
        description: `Creó orden ${order._id} en mesa ${table}`,
        metadata: { itemsCount: orderItems.length, priority },
        sessionId: sessionId,
        orderId: order._id,
        tableId: table,
      }], { session });
    }

    await session.commitTransaction();

    // Actualizar la mesa para reflejar la nueva orden
    const updatedTable = await Table.findById(table).session(session);
    if (updatedTable) {
      await updatedTable.save({ session });
      io.emit("table:update", updatedTable);
      io.to(`table:${table}`).emit("table:update", updatedTable);
    }

    logger.info(`[Order] Nueva orden creada: ${order._id} → mesa ${table}`);
    emitOrderCreate(order);

    return created(res, order, "Orden creada correctamente");

  } catch (error) {
    await session.abortTransaction();
    throw error;
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

    if (!id) return badRequest(res, "ID de orden es requerido");
    if (!isValidId(id)) return badRequest(res, "ID de orden inválido");
    if (!status) return badRequest(res, "Estado es requerido");

    if (!ORDER_STATUS.includes(status)) {
      return badRequest(res, `Estado inválido. Válidos: ${ORDER_STATUS.join(", ")}`);
    }

    const order = await Order.findById(id);
    if (!order) return notFound(res, "Orden no encontrada");
    if (order.sessionStatus === "closed") return badRequest(res, "La orden ya está cerrada");

    order.status = status;

    if (status === "cancelled") {
      order.closedAt = new Date();
    }

    await order.save();

    // Actualizar la mesa para reflejar el cambio en la orden
    const updatedTable = await Table.findById(order.table).session(session);
    if (updatedTable) {
      io.emit("table:update", updatedTable);
      io.to(`table:${order.table}`).emit("table:update", updatedTable);
    }

    emitOrderUpdate(order);

    logger.info(`[Order] ${order._id} → status: ${status}`);

    return ok(res, order, `Orden ${status} correctamente`);
  } catch (error) {
    logger.error("[Order] Error updating order status:", error);
    throw error;
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
      order.status = "completed";
      order.closedAt = new Date();
    } else if (anyPreparing || anyReady) {
      order.status = "in-progress";
    }

    await order.save();

    // Actualizar la mesa para reflejar el cambio en el item de la orden
    const updatedTable = await Table.findById(order.table).session(session);
    if (updatedTable) {
      io.emit("table:update", updatedTable);
      io.to(`table:${order.table}`).emit("table:update", updatedTable);
    }

    emitOrderUpdate(order);

    /* Notificación específica al rol de delivery */
    if (status === "ready") {
      io.to("role:bartender").emit("item:ready", { orderId, itemId, item });
    }

    return ok(res, order, "Item actualizado");
  } catch (error) {
    throw error;
  }
};

/* ==hrow ==================================================
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
    throw error;
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

    /* ─── Control de permisos para descuentos altos ─── */
    if (type === "PERCENT" && value > 20 && !req.user?.permissions?.APPROVE_DISCOUNT) {
      return forbidden(res, "Requieres permiso APPROVE_DISCOUNT para descuentos mayores al 20%");
    }

    /* ─── Calcular descuento ─── */
    const subtotal = targetItems.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);

    if (subtotal <= 0) return badRequest(res, "Subtotal inválido para aplicar descuento");

    let discountAmount = type === "PERCENT"
      ? (subtotal * value) / 100
      : Number(value);

    if (discountAmount <= 0)        return badRequest(res, "El descuento debe ser mayor a 0");
    if (discountAmount > subtotal)  return badRequest(res, "El descuento no puede superar el subtotal");
    if (discountAmount > order.total) return badRequest(res, "El descuento no puede superar el total de la orden");

    /* ─── Crear documento Discount en DB ─── */
    const orderTotalBefore = order.total;
    const orderTotalAfter = Math.max(0, orderTotalBefore - discountAmount);

    const validatedItems = targetItems.map(i => ({
      product: i.product,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      subtotal: (i.price * i.quantity)
    }));

    const discountDoc = await Discount.create({
      order: orderId,
      table: order.table || null,
      sessionId: order.sessionId || null,
      items: validatedItems,
      type,
      value: Number(value),
      amountApplied: discountAmount,
      reason,
      note: note || "",
      appliedBy: req.user?.id || null,
      status: "APPLIED",
      orderTotalBefore,
      orderTotalAfter,
      meta: { ip: req.ip },
    });

    /* ─── Aplicar ─── */
    order.discountTotal = (order.discountTotal || 0) + discountAmount;
    const normalizedItemIds = Array.isArray(items)
      ? items.map((id) => id.toString())
      : [];

    order.discounts.push({
      _id: discountDoc._id,
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
    throw error;
  }
};

/* =========================================================
   CLOSE ORDER WITH PAYMENT (Integración con Payment)
========================================================= */
export const closeOrderWithPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentData } = req.body;

    if (!isValidId(orderId)) return badRequest(res, "ID inválido");

    const order = await Order.findById(orderId);
    if (!order) return notFound(res, "Orden no encontrada");
    if (order.sessionStatus === "closed") return badRequest(res, "La orden ya está cerrada");
    if (order.paymentStatus === "paid") return badRequest(res, "La orden ya está pagada");

    // Esta función es un helper para el payment controller
    // La lógica principal está en payment.controller.js
    // Aquí solo actualizamos el estado de la orden

    order.status = "completed";
      order.closedAt = new Date();

    if (paymentData?.paymentId) {
      order.payment = paymentData.paymentId;
      order.paymentStatus = "paid";
      order.paymentMethod = paymentData.method;
    }

    await order.save();
    emitOrderUpdate(order);

    return ok(res, order, "Orden cerrada correctamente");
  } catch (error) {
    throw error;
  }
};


