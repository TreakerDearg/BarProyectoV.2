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
import {
  PaymentError,
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
   SOCKET HELPERS — Emisiones Centralizadas de Tiempo Real
========================================================= */
const emitPaymentCreated = (payment) => {
  try {
    io.emit(`table:${payment.table}`, { event: "payment:created", payment });
    io.to("payments:global").emit("payment:created", payment);
  } catch (error) {
    logger.error("[Socket] Error emitting payment:created", { error: error.message });
  }
};

const emitPaymentCompleted = (payment) => {
  try {
    io.emit(`table:${payment.table}`, { event: "payment:completed", payment });
    io.to("payments:global").emit("payment:completed", payment);
    io.emit("table:payment-updated", { tableId: payment.table, payment });
  } catch (error) {
    logger.error("[Socket] Error emitting payment:completed", { error: error.message });
  }
};

const emitTableUpdate = async (tableId) => {
  try {
    const table = await Table.findById(tableId).lean();
    if (!table) return;
    io.emit("table:update", table);
    io.to(`table:${tableId}`).emit("table:update", table);
  } catch (error) {
    logger.error("[Socket] Error emitting table:update", { error: error.message });
  }
};

/* =========================================================
   ERROR HANDLING HELPER
========================================================= */
const handleControllerError = (res, error, actionName = "Payment operation") => {
  logger.error(`[Payment] ${actionName} failed:`, {
    message: error.message,
    stack: error.stack,
  });

  if (error instanceof PaymentError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }

  if (error.name === "ValidationError") {
    return res.status(422).json({
      success: false,
      message: "Error de validación de datos",
      code: "VALIDATION_ERROR"
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "ID inválido",
      code: "INVALID_ID"
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Error interno del servidor",
    code: "PAYMENT_ERROR"
  });
};

/* =========================================================
   CREATE PAYMENT (Cobro Estándar: Efectivo / Transferencia)
========================================================= */
export const createPayment = async (req, res) => {
  const session = await mongoose.startSession();

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
    const [payment] = await Payment.create([{
      table: tableId,
      order: orderId,
      sessionId: table.currentSessionId,
      method,
      amount: finalTotal,
      amountPaid: actualAmountPaid,
      change: method === "cash" ? Math.max(0, actualAmountPaid - finalTotal) : 0,
      discountTotal: totalDiscount,
      subtotal,
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
      processedBy: req.user?.id || req.user?._id || null
    }], { session });

    /* ─── Actualizar orden ─── */
    order.payment = payment._id;
    order.paymentStatus = "paid";
    order.paymentMethod = method;
    order.sessionStatus = "closed";
    order.paidAt = new Date();
    order.closedAt = new Date();
    await order.save({ session });

    /* ─── Actualizar mesa (liberación automática) ─── */
    table.status = "available";
    table.currentSessionId = null;
    table.currentOrderId = null;
    table.lastSessionClosedAt = new Date();
    table.totalPayments = (table.totalPayments || 0) + finalTotal;
    table.lastPaymentAt = new Date();
    await table.save({ session });

    /* ─── Marcar descuentos como aplicados ─── */
    await Discount.updateMany(
      { order: orderId, status: "active" },
      { status: "applied", appliedAt: new Date() },
      { session }
    );

    await session.commitTransaction();

    logger.info(`[Payment] Pago creado correctamente: ${payment._id} - Mesa ${table.number} - $${finalTotal}`);

    /* ─── Notificaciones Sockets ─── */
    emitPaymentCreated(payment);
    emitPaymentCompleted(payment);
    await emitTableUpdate(tableId);

    return created(res, payment, "Pago procesado correctamente");

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleControllerError(res, error, "createPayment");
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GET PAYMENT BY ID
========================================================= */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) throw new PaymentValidationError("ID de pago inválido");

    const payment = await Payment.findById(id)
      .populate("table", "number location status")
      .populate("order", "items sessionId paymentStatus sessionStatus")
      .populate("processedBy", "name role")
      .populate("discounts", "type value amountApplied reason")
      .lean();

    if (!payment) throw new PaymentNotFoundError("Pago no encontrado");

    return ok(res, payment);
  } catch (error) {
    return handleControllerError(res, error, "getPaymentById");
  }
};

/* =========================================================
   GET TABLE PAYMENTS
========================================================= */
export const getTablePayments = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { sessionId, limit = 50 } = req.query;

    if (!isValidId(tableId)) throw new PaymentValidationError("ID de mesa inválido");

    const filter = { table: tableId };
    if (sessionId) filter.sessionId = sessionId;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .populate("order", "items sessionId paymentStatus")
      .populate("processedBy", "name role")
      .limit(Number(limit))
      .lean();

    return ok(res, payments);
  } catch (error) {
    return handleControllerError(res, error, "getTablePayments");
  }
};

/* =========================================================
   GET SESSION PAYMENTS
========================================================= */
export const getSessionPayments = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) throw new PaymentValidationError("sessionId es obligatorio");

    const payments = await Payment.find({ sessionId })
      .sort({ createdAt: -1 })
      .populate("table", "number location")
      .populate("order", "items sessionId paymentStatus")
      .populate("processedBy", "name role")
      .lean();

    return ok(res, payments);
  } catch (error) {
    return handleControllerError(res, error, "getSessionPayments");
  }
};

/* =========================================================
   GET AVAILABLE PAYMENT METHODS
========================================================= */
export const getAvailablePaymentMethods = async (req, res) => {
  try {
    // Intentar obtener métodos configurados en la base de datos
    try {
      const PaymentConfig = mongoose.model("PaymentMethodConfig");
      const methods = await PaymentConfig.getActiveMethods();
      if (methods && methods.length > 0) {
        return ok(res, methods);
      }

      logger.info("No payment methods found, attempting auto-seed...");
      try {
        await PaymentConfig.seedDefaultMethods();
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

    // Métodos estáticos de fallback
    const defaultMethods = [
      {
        id: "cash",
        name: "Efectivo",
        icon: "💵",
        description: "Pago en efectivo físico",
        requiresAmount: true
      },
      {
        id: "transfer",
        name: "Transferencia",
        icon: "📱",
        description: "Transferencia bancaria directa",
        requiresAmount: false
      },
      {
        id: "card",
        name: "Tarjeta",
        icon: "💳",
        description: "Pago con tarjeta de crédito/débito",
        requiresAmount: false
      },
      {
        id: "split",
        name: "Dividir cuenta",
        icon: "🔀",
        description: "Dividir cuenta de forma igualitaria o personalizada",
        requiresAmount: false
      },
      {
        id: "partial",
        name: "Pago parcial",
        icon: "📊",
        description: "Efectuar un abono parcial a la cuenta",
        requiresAmount: true
      }
    ];

    return ok(res, defaultMethods);
  } catch (error) {
    return handleControllerError(res, error, "getAvailablePaymentMethods");
  }
};

/* =========================================================
   CREATE SPLIT PAYMENT (Cobro Dividido)
========================================================= */
export const createSplitPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, orderId, totalSplits, method, amounts } = req.body;

    /* ─── Validaciones ─── */
    if (!tableId) throw new PaymentValidationError("tableId es obligatorio");
    if (!orderId) throw new PaymentValidationError("orderId es obligatorio");
    if (!totalSplits || totalSplits < 2) throw new PaymentValidationError("totalSplits debe ser al menos 2");
    if (!method) throw new PaymentValidationError("method es obligatorio");
    if (amounts && amounts.length !== totalSplits) {
      throw new PaymentValidationError("La cantidad de montos provista debe coincidir con totalSplits");
    }

    /* ─── Validar mesa y orden ─── */
    const table = await Table.findById(tableId).session(session);
    if (!table) throw new TableNotFoundError("Mesa no encontrada");
    if (!table.currentSessionId) throw new TableNoActiveSessionError("Mesa sin sesión activa");

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new OrderNotFoundError("Orden no encontrada");
    if (order.sessionStatus === "closed") throw new OrderAlreadyClosedError("La orden ya está cerrada");
    if (order.paymentStatus === "paid") throw new OrderAlreadyPaidError("La orden ya está pagada");

    /* ─── Calcular total de la cuenta ─── */
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

    let splitAmounts = [];
    if (amounts && Array.isArray(amounts) && amounts.length === totalSplits) {
      splitAmounts = amounts;
      const sumAmounts = splitAmounts.reduce((a, b) => a + b, 0);
      if (Math.abs(sumAmounts - finalTotal) > 0.1) {
        throw new InvalidAmountError("La suma de los montos parciales no coincide con el total de la orden");
      }
    } else {
      const evenSplit = finalTotal / totalSplits;
      splitAmounts = Array(totalSplits).fill(evenSplit);
    }

    /* ─── Crear pagos divididos ─── */
    const payments = [];
    for (let i = 0; i < totalSplits; i++) {
      const amount = splitAmounts[i];
      const payment = await Payment.create([{
        table: tableId,
        order: orderId,
        sessionId: table.currentSessionId,
        method: method === "split" ? "cash" : method,
        amount,
        amountPaid: amount,
        change: 0,
        discountTotal: totalDiscount / totalSplits,
        subtotal: subtotal / totalSplits,
        notes: `Pago split ${i + 1} de ${totalSplits}`,
        status: "completed",
        splitDetails: {
          isPartial: true,
          totalSplits,
          currentSplit: i + 1,
          splitAmount: amount,
        },
        items: order.items.map(item => ({
          product: item.product,
          menu: item.menu,
          name: item.name,
          quantity: item.quantity / totalSplits,
          price: item.price,
          subtotal: (item.price || 0) * (item.quantity || 0) / totalSplits
        })),
        processedBy: req.user?.id || req.user?._id || null
      }], { session });

      payments.push(payment[0]);
    }

    /* ─── Vincular relaciones split ─── */
    for (let i = 0; i < payments.length; i++) {
      payments[i].splitDetails.parentPaymentId = payments[0]._id;
      payments[i].splitDetails.childPayments = payments.filter(p => p._id !== payments[i]._id).map(p => p._id);
      await payments[i].save({ session });
    }

    /* ─── Actualizar orden ─── */
    order.payment = payments[0]._id;
    order.paymentStatus = "paid";
    order.paymentMethod = "split";
    order.sessionStatus = "closed";
    order.paidAt = new Date();
    order.closedAt = new Date();
    await order.save({ session });

    /* ─── Actualizar mesa (liberación) ─── */
    table.status = "available";
    table.currentSessionId = null;
    table.currentOrderId = null;
    table.lastSessionClosedAt = new Date();
    table.totalPayments = (table.totalPayments || 0) + finalTotal;
    table.lastPaymentAt = new Date();
    await table.save({ session });

    /* ─── Marcar descuentos como aplicados ─── */
    await Discount.updateMany(
      { order: orderId, status: "active" },
      { status: "applied", appliedAt: new Date() },
      { session }
    );

    await session.commitTransaction();

    logger.info(`[Payment] Pago dividido exitoso en mesa ${table.number} - Splits: ${totalSplits}`);

    payments.forEach(payment => {
      emitPaymentCreated(payment);
      emitPaymentCompleted(payment);
    });
    await emitTableUpdate(tableId);

    return created(res, payments, "Pago dividido procesado correctamente");

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleControllerError(res, error, "createSplitPayment");
  } finally {
    session.endSession();
  }
};

/* =========================================================
   CREATE PARTIAL PAYMENT (Pago Parcial / Abonos)
========================================================= */
export const createPartialPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, orderId, method, amount, amountPaid } = req.body;

    /* ─── Validaciones ─── */
    if (!tableId) throw new PaymentValidationError("tableId es obligatorio");
    if (!orderId) throw new PaymentValidationError("orderId es obligatorio");
    if (!method) throw new PaymentValidationError("method es obligatorio");
    if (!amount || amount <= 0) throw new PaymentValidationError("amount debe ser un valor positivo");
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

    /* ─── Calcular total de la cuenta ─── */
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

    /* ─── Obtener abonos previos ─── */
    const previousPayments = await Payment.find({
      order: orderId,
      status: "completed"
    }).session(session);

    const paidTotalBefore = previousPayments.reduce((acc, p) => acc + p.amount, 0);
    const remainingAmount = finalTotal - paidTotalBefore;

    if (amount > remainingAmount + 0.01) {
      throw new InvalidAmountError(`El monto del abono excede el saldo restante. Pendiente: $${remainingAmount}, Intentado: $${amount}`);
    }

    /* ─── Crear pago parcial ─── */
    const actualAmountPaid = method === "cash" ? amountPaid : amount;
    const [payment] = await Payment.create([{
      table: tableId,
      order: orderId,
      sessionId: table.currentSessionId,
      method,
      amount,
      amountPaid: actualAmountPaid,
      change: method === "cash" ? Math.max(0, actualAmountPaid - amount) : 0,
      discountTotal: totalDiscount * (amount / finalTotal),
      subtotal: subtotal * (amount / finalTotal),
      notes: "Pago parcial de cuenta",
      status: "completed",
      splitDetails: {
        isPartial: true
      },
      items: order.items.map(item => ({
        product: item.product,
        menu: item.menu,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: (item.price || 0) * (item.quantity || 0)
      })),
      processedBy: req.user?.id || req.user?._id || null
    }], { session });

    /* ─── Si con este pago se liquida la cuenta ─── */
    const totalPaidNow = paidTotalBefore + amount;
    const isFullyPaid = totalPaidNow >= finalTotal - 0.01;

    if (isFullyPaid) {
      order.payment = payment._id;
      order.paymentStatus = "paid";
      order.paymentMethod = "mixed";
      order.sessionStatus = "closed";
      order.paidAt = new Date();
      order.closedAt = new Date();
      await order.save({ session });

      table.status = "available";
      table.currentSessionId = null;
      table.currentOrderId = null;
      table.lastSessionClosedAt = new Date();
      table.totalPayments = (table.totalPayments || 0) + finalTotal;
      table.lastPaymentAt = new Date();
      await table.save({ session });

      await Discount.updateMany(
        { order: orderId, status: "active" },
        { status: "applied", appliedAt: new Date() },
        { session }
      );
    } else {
      order.paymentStatus = "partial";
      await order.save({ session });
    }

    await session.commitTransaction();

    logger.info(`[Payment] Pago parcial procesado: ${payment._id} - $${amount} - Liquidada: ${isFullyPaid}`);

    emitPaymentCreated(payment);
    if (isFullyPaid) {
      emitPaymentCompleted(payment);
    }
    await emitTableUpdate(tableId);

    return created(res, {
      payment,
      isFullyPaid,
      remaining: Math.max(0, remainingAmount - amount)
    }, "Abono parcial registrado correctamente");

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleControllerError(res, error, "createPartialPayment");
  } finally {
    session.endSession();
  }
};

/* =========================================================
   CREATE CARD PAYMENT (Pago con Tarjeta)
========================================================= */
export const createCardPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, orderId, cardDetails, amount } = req.body;

    /* ─── Validaciones ─── */
    if (!tableId) throw new PaymentValidationError("tableId es obligatorio");
    if (!orderId) throw new PaymentValidationError("orderId es obligatorio");
    if (!cardDetails) throw new PaymentValidationError("cardDetails es obligatorio");
    if (!cardDetails.lastFour || cardDetails.lastFour.length !== 4) {
      throw new PaymentValidationError("lastFour de tarjeta debe constar de 4 dígitos");
    }

    /* ─── Validar mesa y orden ─── */
    const table = await Table.findById(tableId).session(session);
    if (!table) throw new TableNotFoundError("Mesa no encontrada");
    if (!table.currentSessionId) throw new TableNoActiveSessionError("Mesa sin sesión activa");

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new OrderNotFoundError("Orden no encontrada");
    if (order.sessionStatus === "closed") throw new OrderAlreadyClosedError("La orden ya está cerrada");
    if (order.paymentStatus === "paid") throw new OrderAlreadyPaidError("La orden ya está pagada");

    /* ─── Calcular subtotal y descuentos ─── */
    const subtotal = order.items.reduce((acc, item) => {
      return acc + (item.price || 0) * (item.quantity || 0);
    }, 0);

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
    const cardPaymentAmount = amount || finalTotal;

    /* ─── Registrar pago con tarjeta ─── */
    const [payment] = await Payment.create([{
      table: tableId,
      order: orderId,
      sessionId: table.currentSessionId,
      method: "card",
      amount: cardPaymentAmount,
      amountPaid: cardPaymentAmount,
      change: 0,
      discountTotal: totalDiscount,
      subtotal,
      notes: "Pago con tarjeta procesado",
      status: "completed",
      cardDetails: {
        lastFour: cardDetails.lastFour,
        cardType: cardDetails.cardType || "other",
        authorizationCode: cardDetails.authorizationCode || "000000",
        terminalId: cardDetails.terminalId || "TERM-01"
      },
      items: order.items.map(item => ({
        product: item.product,
        menu: item.menu,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: (item.price || 0) * (item.quantity || 0)
      })),
      processedBy: req.user?.id || req.user?._id || null
    }], { session });

    /* ─── Actualizar orden ─── */
    order.payment = payment._id;
    order.paymentStatus = "paid";
    order.paymentMethod = "card";
    order.sessionStatus = "closed";
    order.paidAt = new Date();
    order.closedAt = new Date();
    await order.save({ session });

    /* ─── Actualizar mesa (liberación) ─── */
    table.status = "available";
    table.currentSessionId = null;
    table.currentOrderId = null;
    table.lastSessionClosedAt = new Date();
    table.totalPayments = (table.totalPayments || 0) + cardPaymentAmount;
    table.lastPaymentAt = new Date();
    await table.save({ session });

    /* ─── Marcar descuentos como aplicados ─── */
    await Discount.updateMany(
      { order: orderId, status: "active" },
      { status: "applied", appliedAt: new Date() },
      { session }
    );

    await session.commitTransaction();

    logger.info(`[Payment] Pago con tarjeta exitoso en mesa ${table.number} - $${cardPaymentAmount}`);

    emitPaymentCreated(payment);
    emitPaymentCompleted(payment);
    await emitTableUpdate(tableId);

    return created(res, payment, "Pago con tarjeta procesado correctamente");

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleControllerError(res, error, "createCardPayment");
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GENERATE DIGITAL RECEIPT (Recibo Digitalizado)
========================================================= */
export const generateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) throw new PaymentValidationError("ID de pago inválido");

    const payment = await Payment.findById(id)
      .populate("table", "number location")
      .populate("order", "items")
      .populate("processedBy", "name role")
      .populate("discounts", "type value amountApplied reason")
      .lean();

    if (!payment) throw new PaymentNotFoundError("Pago no encontrado");

    const receipt = {
      receiptNumber: payment.receipt?.receiptNumber || "N/A",
      issuedAt: payment.receipt?.issuedAt || payment.createdAt,
      table: payment.table,
      items: payment.order?.items || payment.items || [],
      subtotal: payment.subtotal || payment.amount,
      discountTotal: payment.discountTotal || 0,
      total: payment.amount,
      method: payment.method,
      change: payment.change || 0,
      processedBy: payment.processedBy,
      discounts: payment.discounts || [],
    };

    return ok(res, receipt, "Recibo generado correctamente");
  } catch (error) {
    return handleControllerError(res, error, "generateReceipt");
  }
};

/* =========================================================
   REFUND PAYMENT (Reembolsos de Administración)
========================================================= */
export const refundPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const { reason, amount } = req.body;

    if (!isValidId(id)) throw new PaymentValidationError("ID de pago inválido");
    if (!reason) throw new PaymentValidationError("La razón del reembolso es obligatoria");

    const payment = await Payment.findById(id).session(session);
    if (!payment) throw new PaymentNotFoundError("Pago no encontrado");
    if (payment.status === "refunded") throw new PaymentValidationError("Este pago ya se encuentra reembolsado");

    payment.status = "refunded";
    payment.metadata = {
      ...payment.metadata,
      refundReason: reason,
      refundAmount: amount || payment.amount,
      refundedAt: new Date(),
    };
    await payment.save({ session });

    const order = await Order.findById(payment.order).session(session);
    if (order) {
      order.paymentStatus = "refunded";
      await order.save({ session });
    }

    await session.commitTransaction();

    logger.info(`[Payment] Pago reembolsado con éxito: ${id} - Razón: ${reason}`);

    io.emit(`table:${payment.table}`, { event: "payment:refunded", payment });
    await emitTableUpdate(payment.table);

    return ok(res, payment, "Pago reembolsado correctamente");
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleControllerError(res, error, "refundPayment");
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GET PAYMENTS SUMMARY (Informe de Ventas del Dashboard)
========================================================= */
export const getPaymentsSummary = async (req, res) => {
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
          cardPayments: {
            $sum: { $cond: [{ $eq: ["$method", "card"] }, 1, 0] }
          },
          cashAmount: {
            $sum: { $cond: [{ $eq: ["$method", "cash"] }, "$amount", 0] }
          },
          transferAmount: {
            $sum: { $cond: [{ $eq: ["$method", "transfer"] }, "$amount", 0] }
          },
          cardAmount: {
            $sum: { $cond: [{ $eq: ["$method", "card"] }, "$amount", 0] }
          },
        }
      }
    ]);

    const data = summary[0] || {
      totalPayments: 0,
      totalAmount: 0,
      totalDiscounts: 0,
      cashPayments: 0,
      transferPayments: 0,
      cardPayments: 0,
      cashAmount: 0,
      transferAmount: 0,
      cardAmount: 0,
    };

    return ok(res, data);
  } catch (error) {
    return handleControllerError(res, error, "getPaymentsSummary");
  }
};

/* =========================================================
   GET PAYMENTS BY TABLE (Rendimiento por Mesa en Dashboard)
========================================================= */
export const getPaymentsByTable = async (req, res) => {
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
    return handleControllerError(res, error, "getPaymentsByTable");
  }
};

export default {
  createPayment,
  getPaymentById,
  getTablePayments,
  getSessionPayments,
  getAvailablePaymentMethods,
  createSplitPayment,
  createPartialPayment,
  createCardPayment,
  generateReceipt,
  refundPayment,
  getPaymentsSummary,
  getPaymentsByTable
};
