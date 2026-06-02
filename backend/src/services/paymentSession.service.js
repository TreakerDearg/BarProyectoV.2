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
  TableNoActiveSessionError,
  SessionMismatchError,
  InvalidAmountError,
} from "../utils/paymentErrors.js";
import { attachTableSummary } from "./tableSummary.service.js";
import { completeReservationOnTableClose } from "./tableSession.service.js";

export const toMoney = (value) => Number(Number(value || 0).toFixed(2));

export const getOrderFinancials = (order) => {
  const subtotal = toMoney(
    order.subtotal ??
      order.items.reduce(
        (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      )
  );
  const discountTotal = toMoney(order.discountTotal || 0);
  const total = toMoney(order.total ?? Math.max(0, subtotal - discountTotal));
  return { subtotal, discountTotal, total };
};

export const emitPaymentCreated = (payment) => {
  try {
    io.emit(`table:${payment.table}`, { event: "payment:created", payment });
    io.to("payments:global").emit("payment:created", payment);
  } catch (error) {
    logger.error("[Socket] Error emitting payment:created", { error: error.message });
  }
};

export const emitPaymentCompleted = (payment) => {
  try {
    io.emit(`table:${payment.table}`, { event: "payment:completed", payment });
    io.to("payments:global").emit("payment:completed", payment);
    io.emit("table:payment-updated", { tableId: payment.table, payment });
  } catch (error) {
    logger.error("[Socket] Error emitting payment:completed", { error: error.message });
  }
};

export const emitTableUpdate = async (tableId) => {
  try {
    const table = await Table.findById(tableId).lean();
    if (!table) return;
    const decorated = await attachTableSummary(table);
    io.emit("table:update", decorated);
    io.to(`table:${tableId}`).emit("table:update", decorated);
  } catch (error) {
    logger.error("[Socket] Error emitting table:update", { error: error.message });
  }
};

/**
 * Cierra la cuenta de una mesa cobrando todas las órdenes abiertas de la sesión.
 */
export const processSessionCheckout = async ({
  tableId,
  sessionId,
  method,
  maintenanceMinutes = 5,
  paymentDetails = {},
  processedBy = null,
  ip = null,
}) => {
  const dbSession = await mongoose.startSession();

  try {
    dbSession.startTransaction();

    if (!tableId) throw new PaymentValidationError("tableId es obligatorio");
    if (!sessionId) throw new PaymentValidationError("sessionId es obligatorio");
    if (!method) throw new PaymentValidationError("method es obligatorio");
    if (!["cash", "transfer", "card", "split"].includes(method)) {
      throw new PaymentValidationError("method debe ser cash, transfer, card o split");
    }

    const table = await Table.findById(tableId).session(dbSession);
    if (!table) throw new TableNotFoundError("Mesa no encontrada");
    if (!table.currentSessionId) throw new TableNoActiveSessionError("Mesa sin sesión activa");
    if (String(table.currentSessionId) !== String(sessionId)) {
      throw new SessionMismatchError("La sesión indicada no coincide con la sesión activa de la mesa");
    }

    const orders = await Order.find({
      table: tableId,
      sessionId,
      sessionStatus: "open",
      paymentStatus: { $ne: "paid" },
      status: { $ne: "cancelled" },
    }).session(dbSession);

    if (!orders.length) {
      throw new OrderNotFoundError("No hay órdenes abiertas para cobrar en esta mesa");
    }

    const pendingDiscounts = await Discount.countDocuments({
      order: { $in: orders.map((order) => order._id) },
      status: "PENDING",
    }).session(dbSession);
    if (pendingDiscounts > 0) {
      throw new PaymentValidationError("Hay descuentos pendientes de aprobación antes de cobrar");
    }

    const orderBreakdown = orders.map((order) => ({
      order,
      ...getOrderFinancials(order),
    }));

    const subtotal = toMoney(orderBreakdown.reduce((sum, item) => sum + item.subtotal, 0));
    const discountTotal = toMoney(orderBreakdown.reduce((sum, item) => sum + item.discountTotal, 0));
    const finalTotal = toMoney(orderBreakdown.reduce((sum, item) => sum + item.total, 0));

    if (finalTotal <= 0) throw new InvalidAmountError("El total de la sesión debe ser mayor a 0");

    const amountPaid =
      method === "cash" ? Number(paymentDetails.amountPaid || finalTotal) : finalTotal;
    if (method === "cash" && amountPaid < finalTotal) {
      throw new InvalidAmountError(
        `Monto insuficiente. Total: $${finalTotal}, Pagado: $${amountPaid}`
      );
    }
    if (method === "card" && !paymentDetails.cardDetails?.lastFour) {
      throw new PaymentValidationError("lastFour de tarjeta es obligatorio");
    }

    const detailsWithIp = { ...paymentDetails, ip };
    const payments = [];

    for (let index = 0; index < orderBreakdown.length; index++) {
      const item = orderBreakdown[index];
      const isLast = index === orderBreakdown.length - 1;
      const paymentMethod = method === "split" ? "split" : method;
      const paidForOrder =
        method === "cash"
          ? item.total + (isLast ? Math.max(0, amountPaid - finalTotal) : 0)
          : item.total;

      const [payment] = await Payment.create(
        [
          {
            table: tableId,
            order: item.order._id,
            sessionId,
            method: paymentMethod,
            amount: item.total,
            amountPaid: toMoney(paidForOrder),
            change: method === "cash" && isLast ? toMoney(Math.max(0, amountPaid - finalTotal)) : 0,
            discountTotal: item.discountTotal,
            subtotal: item.subtotal,
            status: "completed",
            cardDetails:
              method === "card"
                ? {
                    lastFour: detailsWithIp.cardDetails.lastFour,
                    cardType: detailsWithIp.cardDetails.cardType || "other",
                    authorizationCode: detailsWithIp.cardDetails.authorizationCode || "000000",
                    terminalId: detailsWithIp.cardDetails.terminalId || "TERM-01",
                  }
                : undefined,
            splitDetails:
              method === "split"
                ? {
                    isPartial: false,
                    totalSplits: Number(detailsWithIp.totalSplits || 1),
                    currentSplit: 1,
                    splitAmount: item.total,
                  }
                : undefined,
            receipt: {
              items: item.order.items.map((orderItem) => ({
                name: orderItem.name,
                quantity: orderItem.quantity,
                price: orderItem.price,
                subtotal: (orderItem.price || 0) * (orderItem.quantity || 0),
              })),
            },
            metadata: {
              device: detailsWithIp.device,
              ip: detailsWithIp.ip,
              notes: detailsWithIp.notes || "Checkout de sesión",
              skipTableSync: true,
              checkoutType: "session",
            },
            processedBy,
          },
        ],
        { session: dbSession }
      );

      payments.push(payment);

      item.order.payment = payment._id;
      item.order.paymentStatus = "paid";
      item.order.paymentMethod = method === "split" ? "mixed" : method;
      item.order.sessionStatus = "closed";
      item.order.status = item.order.status === "cancelled" ? "cancelled" : "completed";
      item.order.paidAt = new Date();
      item.order.closedAt = new Date();
      await item.order.save({ session: dbSession });
    }

    const appliedDiscountIds = await Discount.find({
      order: { $in: orders.map((order) => order._id) },
      status: "APPLIED",
    })
      .distinct("_id")
      .session(dbSession);

    const maintenanceUntil = new Date(
      Date.now() + Math.max(1, Number(maintenanceMinutes || 5)) * 60 * 1000
    );
    table.setMaintenance(maintenanceUntil);
    table.lastSessionClosedAt = new Date();
    table.totalPayments = Number((table.totalPayments || 0) + finalTotal);
    table.lastPaymentAt = new Date();
    await table.save({ session: dbSession });

    await dbSession.commitTransaction();

    await completeReservationOnTableClose(tableId);
    await emitTableUpdate(tableId);

    for (const payment of payments) {
      emitPaymentCreated(payment);
      emitPaymentCompleted(payment);
    }
    io.emit("table:closed", { tableId, sessionId, maintenanceUntil });

    const updatedTable = await Table.findById(tableId).lean();
    const decoratedTable = await attachTableSummary(updatedTable);

    logger.info(
      `[Payment] Session checkout OK mesa ${table.number} - $${finalTotal} - ${payments.length} pago(s)`
    );

    return {
      payment: payments[0],
      payments,
      orders,
      table: decoratedTable,
      receiptSummary: {
        sessionId,
        subtotal,
        discountTotal,
        total: finalTotal,
        method,
        amountPaid: toMoney(amountPaid),
        change: method === "cash" ? toMoney(Math.max(0, amountPaid - finalTotal)) : 0,
        maintenanceUntil,
        appliedDiscounts: appliedDiscountIds,
        receiptNumber: payments[0]?.receipt?.receiptNumber,
        issuedAt: payments[0]?.receipt?.issuedAt || payments[0]?.createdAt,
      },
      balanceDue: 0,
    };
  } catch (error) {
    if (dbSession.inTransaction()) {
      await dbSession.abortTransaction();
    }
    throw error;
  } finally {
    dbSession.endSession();
  }
};
