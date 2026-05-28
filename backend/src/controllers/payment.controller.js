import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Table from "../models/Table.js";
import Discount from "../models/Discount.js";
import { io } from "../server.js";
import { logger } from "../config/logger.js";
import {
  ok, created, badRequest, notFound, forbidden,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   SOCKET HELPERS
========================================================= */
const emitPaymentCreated = (payment) => {
  io.emit(`table:${payment.table}`, { event: "payment:created", payment });
  io.to("payments:global").emit("payment:created", payment);
};

const emitPaymentCompleted = (payment) => {
  io.emit(`table:${payment.table}`, { event: "payment:completed", payment });
  io.to("payments:global").emit("payment:completed", payment);
  io.emit("table:payment-updated", { tableId: payment.table, payment });
};

const emitTableUpdate = async (tableId) => {
  const table = await Table.findById(tableId).lean();
  if (!table) return;
  io.emit("table:update", table);
  io.to(`table:${tableId}`).emit("table:update", table);
};

/* =========================================================
   CREATE PAYMENT
========================================================= */
export const createPayment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, orderId, method, amountPaid, notes } = req.body;

    /* ─── Validaciones básicas ─── */
    if (!tableId) return (await session.abortTransaction(), badRequest(res, "tableId es obligatorio"));
    if (!orderId) return (await session.abortTransaction(), badRequest(res, "orderId es obligatorio"));
    if (!method) return (await session.abortTransaction(), badRequest(res, "method es obligatorio"));
    if (!["cash", "transfer"].includes(method)) {
      return (await session.abortTransaction(), badRequest(res, "method debe ser 'cash' o 'transfer'"));
    }
    if (method === "cash" && (!amountPaid || amountPaid <= 0)) {
      return (await session.abortTransaction(), badRequest(res, "amountPaid es obligatorio para efectivo"));
    }

    /* ─── Validar mesa ─── */
    const table = await Table.findById(tableId).session(session);
    if (!table) { await session.abortTransaction(); return notFound(res, "Mesa no encontrada"); }
    if (!table.currentSessionId) { await session.abortTransaction(); return badRequest(res, "Mesa sin sesión activa"); }

    /* ─── Validar orden ─── */
    const order = await Order.findById(orderId).session(session);
    if (!order) { await session.abortTransaction(); return notFound(res, "Orden no encontrada"); }
    if (order.sessionStatus === "closed") { await session.abortTransaction(); return badRequest(res, "La orden ya está cerrada"); }
    if (order.paymentStatus === "paid") { await session.abortTransaction(); return badRequest(res, "La orden ya está pagada"); }
    if (String(order.table) !== String(tableId)) { await session.abortTransaction(); return badRequest(res, "La orden no pertenece a la mesa indicada"); }
    if (order.sessionId && table.currentSessionId && String(order.sessionId) !== String(table.currentSessionId)) {
      await session.abortTransaction();
      return badRequest(res, "La sesión de la orden no coincide con la sesión activa de la mesa");
    }

    /* ─── Calcular subtotal ─── */
    const subtotal = order.items.reduce((acc, item) => {
      return acc + (item.price || 0) * (item.quantity || 0);
    }, 0);

    /* ─── Buscar descuentos activos ─── */
    const activeDiscounts = await Discount.find({
      order: orderId,
      status: "APPLIED",
    }).session(session);

    const discountTotal = activeDiscounts.reduce((acc, discount) => {
      return acc + (discount.amountApplied || 0);
    }, 0);

    const total = Math.max(0, subtotal - discountTotal);

    /* ─── Calcular cambio para efectivo ─── */
    let change = 0;
    if (method === "cash") {
      change = Math.max(0, amountPaid - total);
    }

    /* ─── Crear payment ─── */
    const [payment] = await Payment.create([{
      table: tableId,
      order: orderId,
      sessionId: table.currentSessionId,
      amount: total,
      method,
      status: "completed",
      discounts: activeDiscounts.map(d => d._id),
      discountTotal,
      subtotal,
      change,
      amountPaid: method === "cash" ? amountPaid : total,
      processedBy: req.user?.id || req.user?._id,
      receipt: {
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
      },
      metadata: {
        device: req.headers["user-agent"],
        ip: req.ip,
        notes: notes || "",
      },
    }], { session });

    /* ─── Actualizar orden ─── */
    order.payment = payment._id;
    order.paymentStatus = "paid";
    order.paymentMethod = method;
    order.sessionStatus = "closed";
    order.closedAt = new Date();
    await order.save({ session });

    /* ─── Cerrar mesa y pasar a mantenimiento por 5 minutos ─── */
    const maintenanceMinutes = 5;
    const maintenanceUntil = new Date(Date.now() + maintenanceMinutes * 60 * 1000);
    table.setMaintenance(maintenanceUntil);
    table.lastSessionClosedAt = new Date();
    table.totalPayments = (table.totalPayments || 0) + 1;
    table.lastPaymentAt = new Date();
    await table.save({ session });

    await session.commitTransaction();

    logger.info(`[Payment] Pago creado: ${payment._id} - Mesa ${table.number} - $${total}`);
    emitPaymentCreated(payment);
    emitPaymentCompleted(payment);
    await emitTableUpdate(tableId);

    return created(res, payment, "Pago procesado correctamente");

  } catch (error) {
    await session.abortTransaction();
    logger.error("[Payment] Error creando pago:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GET PAYMENT BY ID
========================================================= */
export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const payment = await Payment.findById(id)
      .populate("table", "number location")
      .populate("order", "items total")
      .populate("processedBy", "name role")
      .populate("discounts", "type value amountApplied reason")
      .lean();

    if (!payment) return notFound(res, "Pago no encontrado");

    return ok(res, payment);
  } catch (error) {
    logger.error("[Payment] Error getting payment by ID:", error);
    next(error);
  }
};

/* =========================================================
   GET TABLE PAYMENTS
========================================================= */
export const getTablePayments = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const { sessionId, limit = 50 } = req.query;

    if (!isValidId(tableId)) return badRequest(res, "tableId inválido");

    const filter = { table: tableId };
    if (sessionId) filter.sessionId = sessionId;

    const payments = await Payment.find(filter)
      .populate("order", "items total")
      .populate("processedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return ok(res, payments);
  } catch (error) {
    logger.error("[Payment] Error getting table payments:", error);
    next(error);
  }
};

/* =========================================================
   GET SESSION PAYMENTS
========================================================= */
export const getSessionPayments = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return badRequest(res, "sessionId es obligatorio");

    const payments = await Payment.find({ sessionId })
      .populate("table", "number location")
      .populate("order", "items total")
      .populate("processedBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    return ok(res, payments);
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GENERATE RECEIPT
========================================================= */
export const generateReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "ID inválido");

    const payment = await Payment.findById(id)
      .populate("table", "number location")
      .populate("order", "items")
      .populate("processedBy", "name role")
      .populate("discounts", "type value amountApplied reason")
      .lean();

    if (!payment) return notFound(res, "Pago no encontrado");

    // Generar recibo digital de ejemplo
    const receipt = {
      receiptNumber: payment.receipt?.receiptNumber || "N/A",
      issuedAt: payment.receipt?.issuedAt || payment.createdAt,
      table: payment.table,
      items: payment.order?.items || [],
      subtotal: payment.subtotal,
      discountTotal: payment.discountTotal,
      total: payment.amount,
      method: payment.method,
      change: payment.change,
      processedBy: payment.processedBy,
      discounts: payment.discounts || [],
    };

    return ok(res, receipt, "Recibo generado correctamente");
  } catch (error) {
    throw error;
  }
};

/* =========================================================
   REFUND PAYMENT (FUTURO)
========================================================= */
export const refundPayment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const { reason, amount } = req.body;

    if (!isValidId(id)) return (await session.abortTransaction(), badRequest(res, "ID inválido"));
    if (!reason) return (await session.abortTransaction(), badRequest(res, "reason es obligatorio"));

    const payment = await Payment.findById(id).session(session);
    if (!payment) { await session.abortTransaction(); return notFound(res, "Pago no encontrado"); }
    if (payment.status === "refunded") { await session.abortTransaction(); return badRequest(res, "El pago ya fue reembolsado"); }

    // Actualizar payment
    payment.status = "refunded";
    payment.metadata = {
      ...payment.metadata,
      refundReason: reason,
      refundAmount: amount || payment.amount,
      refundedAt: new Date(),
    };
    await payment.save({ session });

    // Actualizar orden
    const order = await Order.findById(payment.order).session(session);
    if (order) {
      order.paymentStatus = "refunded";
      await order.save({ session });
    }

    await session.commitTransaction();

    logger.info(`[Payment] Reembolso: ${id} - Razón: ${reason}`);
    io.emit(`table:${payment.table}`, { event: "payment:refunded", payment });

    return ok(res, payment, "Pago reembolsado correctamente");
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GET PAYMENTS SUMMARY (DASHBOARD)
========================================================= */
export const getPaymentsSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const summary = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalDiscounts: { $sum: "$discountTotal" },
          cashPayments: {
            $sum: { $cond: [{ $eq: ["$method", "cash"] }, 1, 0] }
          },
          transferPayments: {
            $sum: { $cond: [{ $eq: ["$method", "transfer"] }, 1, 0] }
          },
          cashAmount: {
            $sum: { $cond: [{ $eq: ["$method", "cash"] }, "$amount", 0] }
          },
          transferAmount: {
            $sum: { $cond: [{ $eq: ["$method", "transfer"] }, "$amount", 0] }
          },
        }
      }
    ]);

    return ok(res, summary[0] || {
      totalPayments: 0,
      totalAmount: 0,
      totalDiscounts: 0,
      cashPayments: 0,
      transferPayments: 0,
      cashAmount: 0,
      transferAmount: 0,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET PAYMENTS BY TABLE (DASHBOARD)
========================================================= */
export const getPaymentsByTable = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;

    const match = { status: "completed" };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const byTable = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$table",
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          lastPayment: { $max: "$createdAt" },
        }
      },
      {
        $lookup: {
          from: "tables",
          localField: "_id",
          foreignField: "_id",
          as: "table",
        }
      },
      { $unwind: "$table" },
      {
        $project: {
          tableId: "$_id",
          tableNumber: "$table.number",
          tableLocation: "$table.location",
          totalPayments: 1,
          totalAmount: 1,
          lastPayment: 1,
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: Number(limit) },
    ]);

    return ok(res, byTable);
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   CREATE SPLIT PAYMENT
========================================================= */
export const createSplitPayment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, orderId, totalSplits, method, amounts } = req.body;

    /* ─── Validaciones básicas ─── */
    if (!tableId) return (await session.abortTransaction(), badRequest(res, "tableId es obligatorio"));
    if (!orderId) return (await session.abortTransaction(), badRequest(res, "orderId es obligatorio"));
    if (!totalSplits || totalSplits < 2) return (await session.abortTransaction(), badRequest(res, "totalSplits debe ser al menos 2"));
    if (!method) return (await session.abortTransaction(), badRequest(res, "method es obligatorio"));

    /* ─── Validar mesa ─── */
    const table = await Table.findById(tableId).session(session);
    if (!table) { await session.abortTransaction(); return notFound(res, "Mesa no encontrada"); }
    if (!table.currentSessionId) { await session.abortTransaction(); return badRequest(res, "Mesa sin sesión activa"); }

    /* ─── Validar orden ─── */
    const order = await Order.findById(orderId).session(session);
    if (!order) { await session.abortTransaction(); return notFound(res, "Orden no encontrada"); }
    if (order.sessionStatus === "closed") { await session.abortTransaction(); return badRequest(res, "La orden ya está cerrada"); }
    if (order.paymentStatus === "paid") { await session.abortTransaction(); return badRequest(res, "La orden ya está pagada"); }    if (String(order.table) !== String(tableId)) { await session.abortTransaction(); return badRequest(res, "La orden no pertenece a la mesa indicada"); }
    if (order.sessionId && table.currentSessionId && String(order.sessionId) !== String(table.currentSessionId)) {
      await session.abortTransaction();
      return badRequest(res, "La sesi�n de la orden no coincide con la sesi�n activa de la mesa");
    }

    /* ─── Calcular subtotal y descuentos ─── */
    const subtotal = order.items.reduce((acc, item) => {
      return acc + (item.price || 0) * (item.quantity || 0);
    }, 0);

    const activeDiscounts = await Discount.find({
      order: orderId,
      status: "APPLIED",
    }).session(session);

    const discountTotal = activeDiscounts.reduce((acc, discount) => {
      return acc + (discount.amountApplied || 0);
    }, 0);

    const total = Math.max(0, subtotal - discountTotal);

    /* ─── Calcular montos de split ─── */
    let splitAmounts = [];
    if (amounts && Array.isArray(amounts) && amounts.length === totalSplits) {
      splitAmounts = amounts;
      const sumAmounts = splitAmounts.reduce((a, b) => a + b, 0);
      if (Math.abs(sumAmounts - total) > 0.01) {
        return (await session.abortTransaction(), badRequest(res, "La suma de los montos no coincide con el total"));
      }
    } else {
      const evenSplit = total / totalSplits;
      splitAmounts = Array(totalSplits).fill(evenSplit);
    }

    /* ─── Crear pagos divididos ─── */
    const payments = [];
    for (let i = 0; i < totalSplits; i++) {
      const payment = await Payment.create([{
        table: tableId,
        order: orderId,
        sessionId: table.currentSessionId,
        amount: splitAmounts[i],
        method: method === "split" ? "cash" : method, // Default to cash if split
        status: "pending",
        discounts: activeDiscounts.map(d => d._id),
        discountTotal: discountTotal / totalSplits,
        subtotal: subtotal / totalSplits,
        splitDetails: {
          isPartial: true,
          totalSplits,
          currentSplit: i + 1,
          splitAmount: splitAmounts[i],
          parentPaymentId: null, // Will be set after creation
        },
        processedBy: req.user?.id || req.user?._id,
        receipt: {
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity / totalSplits,
            price: item.price,
            subtotal: (item.price * item.quantity) / totalSplits,
          })),
        },
        metadata: {
          device: req.headers["user-agent"],
          ip: req.ip,
        },
      }], { session });

      payments.push(payment[0]);
    }

    /* ─── Link payments as parent/children ─── */
    for (let i = 0; i < payments.length; i++) {
      payments[i].splitDetails.parentPaymentId = payments[0]._id;
      payments[i].splitDetails.childPayments = payments.filter(p => p._id !== payments[i]._id).map(p => p._id);
      await payments[i].save({ session });
    }

    await session.commitTransaction();

    logger.info(`[Payment] Split payment creado: ${payments[0]._id} - ${totalSplits} splits`);
    emitPaymentCreated(payments[0]);

    return created(res, payments, "Pago dividido creado correctamente");

  } catch (error) {
    await session.abortTransaction();
    logger.error("[Payment] Error creando split payment:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/* =========================================================
   CREATE PARTIAL PAYMENT
========================================================= */
export const createPartialPayment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, orderId, method, amount, amountPaid } = req.body;

    /* ─── Validaciones básicas ─── */
    if (!tableId) return (await session.abortTransaction(), badRequest(res, "tableId es obligatorio"));
    if (!orderId) return (await session.abortTransaction(), badRequest(res, "orderId es obligatorio"));
    if (!amount || amount <= 0) return (await session.abortTransaction(), badRequest(res, "amount es obligatorio"));
    if (!method) return (await session.abortTransaction(), badRequest(res, "method es obligatorio"));
    if (method === "cash" && (!amountPaid || amountPaid <= 0)) {
      return (await session.abortTransaction(), badRequest(res, "amountPaid es obligatorio para efectivo"));
    }

    /* ─── Validar mesa ─── */
    const table = await Table.findById(tableId).session(session);
    if (!table) { await session.abortTransaction(); return notFound(res, "Mesa no encontrada"); }
    if (!table.currentSessionId) { await session.abortTransaction(); return badRequest(res, "Mesa sin sesión activa"); }

    /* ─── Validar orden ─── */
    const order = await Order.findById(orderId).session(session);
    if (!order) { await session.abortTransaction(); return notFound(res, "Orden no encontrada"); }
    if (order.sessionStatus === "closed") { await session.abortTransaction(), badRequest(res, "La orden ya está cerrada"); }

    /* ─── Calcular remaining amount ─── */
    const existingPayments = await Payment.find({ order: orderId, status: "completed" }).session(session);
    const paidAmount = existingPayments.reduce((acc, p) => acc + p.amount, 0);

    const subtotal = order.items.reduce((acc, item) => {
      return acc + (item.price || 0) * (item.quantity || 0);
    }, 0);

    const activeDiscounts = await Discount.find({
      order: orderId,
      status: "APPLIED",
    }).session(session);

    const discountTotal = activeDiscounts.reduce((acc, discount) => {
      return acc + (discount.amountApplied || 0);
    }, 0);

    const total = Math.max(0, subtotal - discountTotal);
    const remaining = total - paidAmount;

    if (amount > remaining) {
      return (await session.abortTransaction(), badRequest(res, `El monto excede el restante: $${remaining.toFixed(2)}`));
    }

    /* ─── Calcular cambio para efectivo ─── */
    let change = 0;
    if (method === "cash") {
      change = Math.max(0, amountPaid - amount);
    }

    /* ─── Crear pago parcial ─── */
    const [payment] = await Payment.create([{
      table: tableId,
      order: orderId,
      sessionId: table.currentSessionId,
      amount,
      method,
      status: "completed",
      discountTotal: discountTotal * (amount / total),
      subtotal: subtotal * (amount / total),
      change,
      amountPaid: method === "cash" ? amountPaid : amount,
      processedBy: req.user?.id || req.user?._id,
      receipt: {
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity * (amount / total),
          price: item.price,
          subtotal: (item.price * item.quantity) * (amount / total),
        })),
      },
      metadata: {
        device: req.headers["user-agent"],
        ip: req.ip,
        isPartial: true,
        totalRemaining: remaining - amount,
      },
    }], { session });

    /* ─── Si ya está pagado completo, actualizar orden ─── */
    const isFullyPaid = (paidAmount + amount) >= total;
    if (isFullyPaid) {
      order.payment = payment._id;
      order.paymentStatus = "paid";
      order.paymentMethod = "mixed";
      order.sessionStatus = "closed";
      order.closedAt = new Date();
      await order.save({ session });

      /* ─── Cerrar mesa ─── */
      const maintenanceMinutes = 5;
      const maintenanceUntil = new Date(Date.now() + maintenanceMinutes * 60 * 1000);
      table.setMaintenance(maintenanceUntil);
      table.lastSessionClosedAt = new Date();
      table.totalPayments = (table.totalPayments || 0) + 1;
      table.lastPaymentAt = new Date();
      await table.save({ session });
    }

    await session.commitTransaction();

    logger.info(`[Payment] Pago parcial: ${payment._id} - $${amount} - Restante: $${(remaining - amount).toFixed(2)}`);
    emitPaymentCreated(payment);
    if (isFullyPaid) {
      emitPaymentCompleted(payment);
      await emitTableUpdate(tableId);
    }

    return created(res, { payment, isFullyPaid, remaining: isFullyPaid ? 0 : remaining - amount }, "Pago parcial procesado correctamente");

  } catch (error) {
    await session.abortTransaction();
    logger.error("[Payment] Error creando pago parcial:", error);
    next(error);
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GET AVAILABLE PAYMENT METHODS
========================================================= */
export const getAvailablePaymentMethods = async (req, res, next) => {
  try {
    // Intentar obtener métodos de la base de datos
    try {
      const PaymentConfig = mongoose.model("PaymentMethodConfig");
      const methods = await PaymentConfig.getActiveMethods();
      if (methods && methods.length > 0) {
        return ok(res, methods);
      }
      
      // Si no hay métodos, intentar hacer seed automáticamente
      logger.info("No payment methods found, attempting auto-seed...");
      try {
        await PaymentConfig.seedDefaultMethods();
        logger.info("Auto-seed completed, fetching methods again...");
        const seededMethods = await PaymentConfig.getActiveMethods();
        if (seededMethods && seededMethods.length > 0) {
          return ok(res, seededMethods);
        }
      } catch (seedError) {
        logger.warn("Auto-seed failed, using defaults:", seedError.message);
      }
    } catch (dbError) {
      logger.warn("Error fetching payment methods from DB, using defaults:", dbError.message);
    }
    
    // Si no hay métodos en la BD o la consulta falla, retornar métodos por defecto
    const defaultMethods = [
      {
        _id: "cash-default",
        method: "cash",
        displayName: "Efectivo",
        description: "Pagos en efectivo físico",
        isActive: true,
        isAvailable: true,
        priority: 100,
        icon: "dollar-sign",
      },
      {
        _id: "card-default",
        method: "card",
        displayName: "Tarjeta",
        description: "Tarjetas de crédito/débito",
        isActive: true,
        isAvailable: true,
        priority: 90,
        icon: "credit-card",
      },
      {
        _id: "transfer-default",
        method: "transfer",
        displayName: "Transferencia",
        description: "Transferencias bancarias",
        isActive: true,
        isAvailable: true,
        priority: 80,
        icon: "credit-card",
      },
      {
        _id: "split-default",
        method: "split",
        displayName: "Dividir Cuenta",
        description: "Dividir pagos entre varias personas",
        isActive: true,
        isAvailable: true,
        priority: 70,
        icon: "users",
      },
      {
        _id: "partial-default",
        method: "partial",
        displayName: "Pago Parcial",
        description: "Realizar un pago parcial",
        isActive: true,
        isAvailable: true,
        priority: 60,
        icon: "wallet",
      },
    ];
    
    return ok(res, defaultMethods);
  } catch (error) {
    logger.error("[Payment] Error in getAvailablePaymentMethods:", error);
    next(error);
  }
};

/* =========================================================
   CREATE PAYMENT WITH CARD
========================================================= */
export const createCardPayment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, orderId, cardDetails, amount } = req.body;

    /* ─── Validaciones básicas ─── */
    if (!tableId) return (await session.abortTransaction(), badRequest(res, "tableId es obligatorio"));
    if (!orderId) return (await session.abortTransaction(), badRequest(res, "orderId es obligatorio"));
    if (!cardDetails || !cardDetails.lastFour) {
      return (await session.abortTransaction(), badRequest(res, "cardDetails.lastFour es obligatorio"));
    }

    /* ─── Validar mesa y orden ─── */
    const table = await Table.findById(tableId).session(session);
    if (!table) { await session.abortTransaction(); return notFound(res, "Mesa no encontrada"); }
    if (!table.currentSessionId) { await session.abortTransaction(); return badRequest(res, "Mesa sin sesión activa"); }

    const order = await Order.findById(orderId).session(session);
    if (!order) { await session.abortTransaction(); return notFound(res, "Orden no encontrada"); }
    if (order.sessionStatus === "closed") { await session.abortTransaction(); return badRequest(res, "La orden ya está cerrada"); }
    if (order.paymentStatus === "paid") { await session.abortTransaction(); return badRequest(res, "La orden ya está pagada"); }    if (String(order.table) !== String(tableId)) { await session.abortTransaction(); return badRequest(res, "La orden no pertenece a la mesa indicada"); }
    if (order.sessionId && table.currentSessionId && String(order.sessionId) !== String(table.currentSessionId)) {
      await session.abortTransaction();
      return badRequest(res, "La sesi�n de la orden no coincide con la sesi�n activa de la mesa");
    }

    /* ─── Calcular total ─── */
    const subtotal = order.items.reduce((acc, item) => {
      return acc + (item.price || 0) * (item.quantity || 0);
    }, 0);

    const activeDiscounts = await Discount.find({
      order: orderId,
      status: "APPLIED",
    }).session(session);

    const discountTotal = activeDiscounts.reduce((acc, discount) => {
      return acc + (discount.amountApplied || 0);
    }, 0);

    const total = amount || Math.max(0, subtotal - discountTotal);

    /* ─── Crear pago con tarjeta ─── */
    const [payment] = await Payment.create([{
      table: tableId,
      order: orderId,
      sessionId: table.currentSessionId,
      amount: total,
      method: "card",
      status: "completed",
      discounts: activeDiscounts.map(d => d._id),
      discountTotal,
      subtotal,
      cardDetails: {
        lastFour: cardDetails.lastFour,
        cardType: cardDetails.cardType || "other",
        authorizationCode: cardDetails.authorizationCode || "AUTH-" + Date.now(),
        terminalId: cardDetails.terminalId || "TERM-001",
      },
      processedBy: req.user?.id || req.user?._id,
      receipt: {
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
      },
      metadata: {
        device: req.headers["user-agent"],
        ip: req.ip,
      },
    }], { session });

    /* ─── Actualizar orden ─── */
    order.payment = payment._id;
    order.paymentStatus = "paid";
    order.paymentMethod = "card";
    order.sessionStatus = "closed";
    order.closedAt = new Date();
    await order.save({ session });

    /* ─── Cerrar mesa ─── */
    const maintenanceMinutes = 5;
    const maintenanceUntil = new Date(Date.now() + maintenanceMinutes * 60 * 1000);
    table.setMaintenance(maintenanceUntil);
    table.lastSessionClosedAt = new Date();
    table.totalPayments = (table.totalPayments || 0) + 1;
    table.lastPaymentAt = new Date();
    await table.save({ session });

    await session.commitTransaction();

    logger.info(`[Payment] Pago con tarjeta: ${payment._id} - ****${cardDetails.lastFour} - $${total}`);
    emitPaymentCreated(payment);
    emitPaymentCompleted(payment);
    await emitTableUpdate(tableId);

    return created(res, payment, "Pago con tarjeta procesado correctamente");

  } catch (error) {
    await session.abortTransaction();
    logger.error("[Payment] Error creando pago con tarjeta:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

