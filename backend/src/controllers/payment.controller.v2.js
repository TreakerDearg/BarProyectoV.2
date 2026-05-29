/* =========================================================
   PAYMENT CONTROLLER V2 - FAIL-SAFE REBUILD
   Sistema de pagos reconstruido para eliminar errores de middleware
   Sin dependencia de asyncHandler - manejo de errores directo
   Logging comprehensivo para debugging y monitoreo
========================================================= */

import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Table from "../models/Table.js";
import Discount from "../models/Discount.js";
import { io } from "../server.js";
import { logger } from "../config/logger.js";
import {
  PaymentValidationError,
  TableNotFoundError,
  OrderNotFoundError,
  OrderAlreadyPaidError,
  OrderAlreadyClosedError,
  TableNoActiveSessionError,
  SessionMismatchError,
  InvalidAmountError,
  PaymentAlreadyRefundedError,
  DatabaseError,
  PaymentProcessingError,
} from "../utils/paymentErrors.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   SOCKET HELPERS
========================================================= */
const emitPaymentCreated = (payment) => {
  try {
    io.emit(`table:${payment.table}`, { event: "payment:created", payment });
    io.to("payments:global").emit("payment:created", payment);
  } catch (error) {
    logger.error("[Socket] Error emitting payment:created", { error: error.message });
  }
};

const emitPaymentUpdated = (payment) => {
  try {
    io.emit(`table:${payment.table}`, { event: "payment:updated", payment });
    io.to("payments:global").emit("payment:updated", payment);
  } catch (error) {
    logger.error("[Socket] Error emitting payment:updated", { error: error.message });
  }
};

/* =========================================================
   RESPONSE HELPERS - Direct response without middleware
========================================================= */
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data
  });
};

const sendError = (res, message, statusCode = 500, errorCode = "UNKNOWN_ERROR", errors = null) => {
  const payload = {
    success: false,
    message,
    code: errorCode
  };
  if (errors) payload.errors = errors;
  if (process.env.NODE_ENV !== "production") {
    payload.stack = new Error().stack;
  }
  return res.status(statusCode).json(payload);
};

/* =========================================================
   CREATE PAYMENT - V2 Simplified
========================================================= */
export const createPaymentV2 = async (req, res) => {
  const session = await mongoose.startSession();

  logger.info("[Payment V2] Creating payment", {
    userId: req.user?.id,
    body: req.body
  });

  try {
    session.startTransaction();

    const { tableId, orderId, method, amountPaid, notes } = req.body;

    /* ─── Validaciones básicas ─── */
    if (!tableId) throw new PaymentValidationError("tableId es obligatorio");
    if (!orderId) throw new PaymentValidationError("orderId es obligatorio");
    if (!method) throw new PaymentValidationError("method es obligatorio");
    if (!["cash", "transfer"].includes(method)) {
      throw new PaymentValidationError("method debe ser 'cash' o 'transfer'");
    }
    if (method === "cash" && (!amountPaid || amountPaid <= 0)) {
      throw new PaymentValidationError("amountPaid es obligatorio para efectivo");
    }

    /* ─── Validar mesa ─── */
    const table = await Table.findById(tableId).session(session);
    if (!table) throw new TableNotFoundError("Mesa no encontrada");
    if (!table.currentSessionId) throw new TableNoActiveSessionError("Mesa sin sesión activa");

    /* ─── Validar orden ─── */
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new OrderNotFoundError("Orden no encontrada");
    if (order.sessionStatus === "closed") throw new OrderAlreadyClosedError("La orden ya está cerrada");
    if (order.paymentStatus === "paid") throw new OrderAlreadyPaidError("La orden ya está pagada");
    if (String(order.table) !== String(tableId)) throw new PaymentValidationError("La orden no pertenece a la mesa indicada");
    if (order.sessionId && table.currentSessionId && String(order.sessionId) !== String(table.currentSessionId)) {
      throw new SessionMismatchError("La sesión de la orden no coincide con la sesión activa de la mesa");
    }

    /* ─── Calcular subtotal ─── */
    const subtotal = order.items.reduce((acc, item) => {
      return acc + (item.price || 0) * (item.quantity || 0);
    }, 0);

    /* ─── Buscar descuentos activos ─── */
    const activeDiscounts = await Discount.find({
      order: orderId,
      status: "active"
    }).session(session);

    const totalDiscount = activeDiscounts.reduce((acc, discount) => {
      if (discount.type === "PERCENT") {
        return acc + (subtotal * (discount.value / 100));
      } else {
        return acc + discount.value;
      }
    }, 0);

    const finalTotal = Math.max(0, subtotal - totalDiscount);

    /* ─── Validar monto pagado ─── */
    const actualAmountPaid = method === "cash" ? amountPaid : finalTotal;
    if (actualAmountPaid < finalTotal && method === "cash") {
      throw new InvalidAmountError(`Monto insuficiente. Total: $${finalTotal}, Pagado: $${actualAmountPaid}`);
    }

    /* ─── Crear pago ─── */
    const payment = await Payment.create([{
      table: tableId,
      order: orderId,
      sessionId: table.currentSessionId,
      method,
      amount: finalTotal,
      amountPaid: actualAmountPaid,
      change: method === "cash" ? Math.max(0, actualAmountPaid - finalTotal) : 0,
      discount: totalDiscount,
      notes: notes || "",
      status: "completed",
      items: order.items.map(item => ({
        product: item.product,
        menu: item.menu,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: (item.price || 0) * (item.quantity || 0)
      })),
      createdBy: req.user?.id || null
    }], { session });

    const createdPayment = payment[0];

    /* ─── Actualizar orden ─── */
    order.paymentStatus = "paid";
    order.sessionStatus = "closed";
    order.paidAt = new Date();
    await order.save({ session });

    /* ─── Actualizar mesa ─── */
    table.status = "available";
    table.currentSessionId = null;
    table.currentOrderId = null;
    table.lastPaymentAt = new Date();
    await table.save({ session });

    /* ─── Marcar descuentos como aplicados ─── */
    await Discount.updateMany(
      { order: orderId, status: "active" },
      { status: "applied", appliedAt: new Date() },
      { session }
    );

    await session.commitTransaction();

    /* ─── Emitir eventos Socket.IO ─── */
    emitPaymentCreated(createdPayment);

    logger.info("[Payment V2] Payment created successfully", {
      paymentId: createdPayment._id,
      orderId,
      tableId,
      amount: finalTotal,
      method
    });

    return sendSuccess(res, {
      payment: createdPayment,
      order: {
        id: order._id,
        paymentStatus: order.paymentStatus,
        sessionStatus: order.sessionStatus
      },
      table: {
        id: table._id,
        status: table.status
      }
    }, 201);

  } catch (error) {
    await session.abortTransaction();

    logger.error("[Payment V2] Error creating payment", {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    if (error instanceof PaymentError) {
      return sendError(res, error.message, error.statusCode, error.code);
    }

    if (error.name === "ValidationError") {
      return sendError(res, "Error de validación de datos", 422, "VALIDATION_ERROR");
    }

    if (error.name === "CastError") {
      return sendError(res, "ID inválido", 400, "INVALID_ID");
    }

    return sendError(res, "Error al crear el pago", 500, "PAYMENT_CREATE_ERROR");
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GET PAYMENT BY ID - V2
========================================================= */
export const getPaymentByIdV2 = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, "ID inválido", 400, "INVALID_ID");
    }

    const payment = await Payment.findById(id)
      .populate("table", "number location status")
      .populate("order", "sessionId paymentStatus sessionStatus");

    if (!payment) {
      return sendError(res, "Pago no encontrado", 404, "PAYMENT_NOT_FOUND");
    }

    return sendSuccess(res, { payment });

  } catch (error) {
    logger.error("[Payment V2] Error getting payment by ID", {
      error: error.message,
      paymentId: req.params.id
    });

    return sendError(res, "Error al obtener el pago", 500, "PAYMENT_GET_ERROR");
  }
};

/* =========================================================
   GET TABLE PAYMENTS - V2
========================================================= */
export const getTablePaymentsV2 = async (req, res) => {
  try {
    const { tableId } = req.params;

    if (!isValidId(tableId)) {
      return sendError(res, "ID de mesa inválido", 400, "INVALID_ID");
    }

    const payments = await Payment.find({ table: tableId })
      .sort({ createdAt: -1 })
      .populate("order", "sessionId paymentStatus")
      .limit(50);

    return sendSuccess(res, { payments, count: payments.length });

  } catch (error) {
    logger.error("[Payment V2] Error getting table payments", {
      error: error.message,
      tableId: req.params.tableId
    });

    return sendError(res, "Error al obtener pagos de la mesa", 500, "PAYMENT_GET_ERROR");
  }
};

/* =========================================================
   GET SESSION PAYMENTS - V2
========================================================= */
export const getSessionPaymentsV2 = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!isValidId(sessionId)) {
      return sendError(res, "ID de sesión inválido", 400, "INVALID_ID");
    }

    const payments = await Payment.find({ sessionId })
      .sort({ createdAt: -1 })
      .populate("table", "number location")
      .populate("order", "sessionId paymentStatus")
      .limit(50);

    return sendSuccess(res, { payments, count: payments.length });

  } catch (error) {
    logger.error("[Payment V2] Error getting session payments", {
      error: error.message,
      sessionId: req.params.sessionId
    });

    return sendError(res, "Error al obtener pagos de la sesión", 500, "PAYMENT_GET_ERROR");
  }
};

/* =========================================================
   GET AVAILABLE PAYMENT METHODS - V2
========================================================= */
export const getAvailablePaymentMethodsV2 = async (req, res) => {
  try {
    const methods = [
      {
        id: "cash",
        name: "Efectivo",
        icon: "💵",
        description: "Pago en efectivo",
        requiresAmount: true
      },
      {
        id: "transfer",
        name: "Transferencia",
        icon: "📱",
        description: "Transferencia bancaria",
        requiresAmount: false
      },
      {
        id: "card",
        name: "Tarjeta",
        icon: "💳",
        description: "Pago con tarjeta (próximamente)",
        requiresAmount: false,
        disabled: true
      },
      {
        id: "split",
        name: "Dividir cuenta",
        icon: "🔀",
        description: "Dividir la cuenta entre varias personas",
        requiresAmount: false
      },
      {
        id: "partial",
        name: "Pago parcial",
        icon: "📊",
        description: "Pagar una parte de la cuenta",
        requiresAmount: true
      }
    ];

    return sendSuccess(res, { methods });

  } catch (error) {
    logger.error("[Payment V2] Error getting available payment methods", {
      error: error.message
    });

    return sendError(res, "Error al obtener métodos de pago", 500, "PAYMENT_METHODS_ERROR");
  }
};

/* =========================================================
   CREATE SPLIT PAYMENT - V2
========================================================= */
export const createSplitPaymentV2 = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, orderId, totalSplits, method, amounts } = req.body;

    /* ─── Validaciones ─── */
    if (!tableId) throw new PaymentValidationError("tableId es obligatorio");
    if (!orderId) throw new PaymentValidationError("orderId es obligatorio");
    if (!totalSplits || totalSplits < 2) {
      throw new PaymentValidationError("totalSplits debe ser al menos 2");
    }
    if (!method) throw new PaymentValidationError("method es obligatorio");
    if (amounts && amounts.length !== totalSplits) {
      throw new PaymentValidationError("La cantidad de montos debe coincidir con totalSplits");
    }

    /* ─── Validar mesa y orden ─── */
    const table = await Table.findById(tableId).session(session);
    if (!table) throw new TableNotFoundError("Mesa no encontrada");
    if (!table.currentSessionId) throw new TableNoActiveSessionError("Mesa sin sesión activa");

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new OrderNotFoundError("Orden no encontrada");
    if (order.sessionStatus === "closed") throw new OrderAlreadyClosedError("La orden ya está cerrada");
    if (order.paymentStatus === "paid") throw new OrderAlreadyPaidError("La orden ya está pagada");

    /* ─── Calcular total ─── */
    const subtotal = order.items.reduce((acc, item) => {
      return acc + (item.price || 0) * (item.quantity || 0);
    }, 0);

    const splitAmount = subtotal / totalSplits;

    /* ─── Crear pagos divididos ─── */
    const payments = [];
    for (let i = 0; i < totalSplits; i++) {
      const amount = amounts ? amounts[i] : splitAmount;
      const payment = await Payment.create([{
        table: tableId,
        order: orderId,
        sessionId: table.currentSessionId,
        method,
        amount,
        amountPaid: method === "cash" ? amount : amount,
        change: 0,
        discount: 0,
        notes: `Pago ${i + 1} de ${totalSplits}`,
        status: "completed",
        isSplit: true,
        splitIndex: i,
        splitTotal: totalSplits,
        items: order.items.map(item => ({
          product: item.product,
          menu: item.menu,
          name: item.name,
          quantity: item.quantity / totalSplits,
          price: item.price,
          subtotal: (item.price || 0) * (item.quantity || 0) / totalSplits
        })),
        createdBy: req.user?.id || null
      }], { session });

      payments.push(payment[0]);
    }

    /* ─── Actualizar orden ─── */
    order.paymentStatus = "paid";
    order.sessionStatus = "closed";
    order.paidAt = new Date();
    await order.save({ session });

    /* ─── Actualizar mesa ─── */
    table.status = "available";
    table.currentSessionId = null;
    table.currentOrderId = null;
    await table.save({ session });

    await session.commitTransaction();

    payments.forEach(payment => emitPaymentCreated(payment));

    logger.info("[Payment V2] Split payment created successfully", {
      orderId,
      tableId,
      totalSplits,
      totalAmount: subtotal
    });

    return sendSuccess(res, {
      payments,
      order: {
        id: order._id,
        paymentStatus: order.paymentStatus,
        sessionStatus: order.sessionStatus
      }
    }, 201);

  } catch (error) {
    await session.abortTransaction();

    logger.error("[Payment V2] Error creating split payment", {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    if (error instanceof PaymentError) {
      return sendError(res, error.message, error.statusCode, error.code);
    }

    return sendError(res, "Error al crear pago dividido", 500, "SPLIT_PAYMENT_ERROR");
  } finally {
    session.endSession();
  }
};

/* =========================================================
   CREATE PARTIAL PAYMENT - V2
========================================================= */
export const createPartialPaymentV2 = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, orderId, method, amount, amountPaid } = req.body;

    /* ─── Validaciones ─── */
    if (!tableId) throw new PaymentValidationError("tableId es obligatorio");
    if (!orderId) throw new PaymentValidationError("orderId es obligatorio");
    if (!method) throw new PaymentValidationError("method es obligatorio");
    if (!amount || amount <= 0) throw new PaymentValidationError("amount debe ser positivo");
    if (method === "cash" && (!amountPaid || amountPaid <= 0)) {
      throw new PaymentValidationError("amountPaid es obligatorio para efectivo");
    }

    /* ─── Validar mesa y orden ─── */
    const table = await Table.findById(tableId).session(session);
    if (!table) throw new TableNotFoundError("Mesa no encontrada");
    if (!table.currentSessionId) throw new TableNoActiveSessionError("Mesa sin sesión activa");

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new OrderNotFoundError("Orden no encontrada");
    if (order.sessionStatus === "closed") throw new OrderAlreadyClosedError("La orden ya está cerrada");

    /* ─── Calcular total de la orden ─── */
    const subtotal = order.items.reduce((acc, item) => {
      return acc + (item.price || 0) * (item.quantity || 0);
    }, 0);

    /* ─── Calcular pagos previos ─── */
    const previousPayments = await Payment.find({
      order: orderId,
      status: "completed"
    }).session(session);

    const previousTotal = previousPayments.reduce((acc, p) => acc + p.amount, 0);
    const remainingAmount = subtotal - previousTotal;

    if (amount > remainingAmount) {
      throw new InvalidAmountError(`Monto excede el restante. Restante: $${remainingAmount}, Solicitado: $${amount}`);
    }

    /* ─── Crear pago parcial ─── */
    const actualAmountPaid = method === "cash" ? amountPaid : amount;
    const payment = await Payment.create([{
      table: tableId,
      order: orderId,
      sessionId: table.currentSessionId,
      method,
      amount,
      amountPaid: actualAmountPaid,
      change: method === "cash" ? Math.max(0, actualAmountPaid - amount) : 0,
      discount: 0,
      notes: "Pago parcial",
      status: "completed",
      isPartial: true,
      items: order.items.map(item => ({
        product: item.product,
        menu: item.menu,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: (item.price || 0) * (item.quantity || 0)
      })),
      createdBy: req.user?.id || null
    }], { session });

    const createdPayment = payment[0];

    /* ─── Verificar si la orden está completamente pagada ─── */
    const newTotalPaid = previousTotal + amount;
    if (newTotalPaid >= subtotal) {
      order.paymentStatus = "paid";
      order.sessionStatus = "closed";
      order.paidAt = new Date();
      table.status = "available";
      table.currentSessionId = null;
      table.currentOrderId = null;
      await table.save({ session });
    }

    await order.save({ session });

    await session.commitTransaction();

    emitPaymentCreated(createdPayment);

    logger.info("[Payment V2] Partial payment created successfully", {
      paymentId: createdPayment._id,
      orderId,
      tableId,
      amount,
      remaining: subtotal - newTotalPaid
    });

    return sendSuccess(res, {
      payment: createdPayment,
      order: {
        id: order._id,
        paymentStatus: order.paymentStatus,
        sessionStatus: order.sessionStatus,
        totalPaid: newTotalPaid,
        remaining: Math.max(0, subtotal - newTotalPaid)
      }
    }, 201);

  } catch (error) {
    await session.abortTransaction();

    logger.error("[Payment V2] Error creating partial payment", {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    if (error instanceof PaymentError) {
      return sendError(res, error.message, error.statusCode, error.code);
    }

    return sendError(res, "Error al crear pago parcial", 500, "PARTIAL_PAYMENT_ERROR");
  } finally {
    session.endSession();
  }
};

/* =========================================================
   CREATE CARD PAYMENT - V2
========================================================= */
export const createCardPaymentV2 = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, orderId, cardDetails, amount } = req.body;

    /* ─── Validaciones ─── */
    if (!tableId) throw new PaymentValidationError("tableId es obligatorio");
    if (!orderId) throw new PaymentValidationError("orderId es obligatorio");
    if (!cardDetails) throw new PaymentValidationError("cardDetails es obligatorio");
    if (!cardDetails.lastFour || cardDetails.lastFour.length !== 4) {
      throw new PaymentValidationError("lastFour debe tener 4 dígitos");
    }

    /* ─── Validar mesa y orden ─── */
    const table = await Table.findById(tableId).session(session);
    if (!table) throw new TableNotFoundError("Mesa no encontrada");
    if (!table.currentSessionId) throw new TableNoActiveSessionError("Mesa sin sesión activa");

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new OrderNotFoundError("Orden no encontrada");
    if (order.sessionStatus === "closed") throw new OrderAlreadyClosedError("La orden ya está cerrada");
    if (order.paymentStatus === "paid") throw new OrderAlreadyPaidError("La orden ya está pagada");

    /* ─── Calcular total ─── */
    const subtotal = order.items.reduce((acc, item) => {
      return acc + (item.price || 0) * (item.quantity || 0);
    }, 0);

    const finalAmount = amount || subtotal;

    /* ─── Crear pago con tarjeta ─── */
    const payment = await Payment.create([{
      table: tableId,
      order: orderId,
      sessionId: table.currentSessionId,
      method: "card",
      amount: finalAmount,
      amountPaid: finalAmount,
      change: 0,
      discount: 0,
      notes: "Pago con tarjeta",
      status: "completed",
      cardDetails: {
        lastFour: cardDetails.lastFour,
        cardType: cardDetails.cardType || "other",
        authorizationCode: cardDetails.authorizationCode || null,
        terminalId: cardDetails.terminalId || null
      },
      items: order.items.map(item => ({
        product: item.product,
        menu: item.menu,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: (item.price || 0) * (item.quantity || 0)
      })),
      createdBy: req.user?.id || null
    }], { session });

    const createdPayment = payment[0];

    /* ─── Actualizar orden ─── */
    order.paymentStatus = "paid";
    order.sessionStatus = "closed";
    order.paidAt = new Date();
    await order.save({ session });

    /* ─── Actualizar mesa ─── */
    table.status = "available";
    table.currentSessionId = null;
    table.currentOrderId = null;
    await table.save({ session });

    await session.commitTransaction();

    emitPaymentCreated(createdPayment);

    logger.info("[Payment V2] Card payment created successfully", {
      paymentId: createdPayment._id,
      orderId,
      tableId,
      amount: finalAmount,
      lastFour: cardDetails.lastFour
    });

    return sendSuccess(res, {
      payment: createdPayment,
      order: {
        id: order._id,
        paymentStatus: order.paymentStatus,
        sessionStatus: order.sessionStatus
      }
    }, 201);

  } catch (error) {
    await session.abortTransaction();

    logger.error("[Payment V2] Error creating card payment", {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    if (error instanceof PaymentError) {
      return sendError(res, error.message, error.statusCode, error.code);
    }

    return sendError(res, "Error al crear pago con tarjeta", 500, "CARD_PAYMENT_ERROR");
  } finally {
    session.endSession();
  }
};

export default {
  createPaymentV2,
  getPaymentByIdV2,
  getTablePaymentsV2,
  getSessionPaymentsV2,
  getAvailablePaymentMethodsV2,
  createSplitPaymentV2,
  createPartialPaymentV2,
  createCardPaymentV2
};
