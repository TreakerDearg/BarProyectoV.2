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
import { runTransactionWithRetry } from "../utils/retry.js";

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
  logger.info(`[Checkout] Starting session checkout for table ${tableId}, session ${sessionId}`);

  if (!tableId) throw new PaymentValidationError("tableId es obligatorio");
  if (!sessionId) throw new PaymentValidationError("sessionId es obligatorio");
  if (!method) throw new PaymentValidationError("method es obligatorio");
  if (!["cash", "transfer", "card", "split"].includes(method)) {
    throw new PaymentValidationError("method debe ser cash, transfer, card o split");
  }

  // Pre-transaction checks to prevent double payment
  const table = await Table.findById(tableId).lean();
  if (!table) throw new TableNotFoundError("Mesa no encontrada");
  if (!table.currentSessionId) throw new TableNoActiveSessionError("Mesa sin sesión activa");
  if (String(table.currentSessionId) !== String(sessionId)) {
    throw new SessionMismatchError("La sesión indicada no coincide con la sesión activa de la mesa");
  }

  // Check if checkout is already in progress
  if (table.checkoutInProgress) {
    throw new PaymentValidationError("Ya existe un checkout en progreso para esta mesa");
  }

  // Check for already paid/closed orders (double payment prevention)
  const paidOrdersCount = await Order.countDocuments({
    table: tableId,
    sessionId,
    sessionStatus: "closed",
    paymentStatus: "paid",
  });
  if (paidOrdersCount > 0) {
    throw new PaymentValidationError("La sesión ya fue cobrada anteriormente");
  }

  // Set checkout lock
  await Table.findByIdAndUpdate(tableId, {
    checkoutInProgress: true,
    checkoutStartedAt: new Date(),
  });

  try {
    const result = await runTransactionWithRetry(async (dbSession) => {
      const tableTx = await Table.findById(tableId).session(dbSession);
      if (!tableTx) throw new TableNotFoundError("Mesa no encontrada");
      if (!tableTx.currentSessionId) throw new TableNoActiveSessionError("Mesa sin sesión activa");
      if (String(tableTx.currentSessionId) !== String(sessionId)) {
        throw new SessionMismatchError("La sesión indicada no coincide con la sesión activa de la mesa");
      }

      const orders = await Order.find({
        table: tableId,
        sessionId,
        sessionStatus: "open",
        paymentStatus: { $ne: "paid" },
        status: { $ne: "cancelled" },
      }).session(dbSession);

      if (!orders || !Array.isArray(orders) || !orders.length) {
        throw new OrderNotFoundError("No hay órdenes abiertas para cobrar en esta mesa");
      }

      const hasPendingOrInProgress = orders.some(
        (o) => o.status === "pending" || o.status === "in-progress"
      );
      if (hasPendingOrInProgress) {
        throw new PaymentValidationError(
          "No se puede realizar el checkout: hay pedidos pendientes o en preparación"
        );
      }

      const orderBreakdown = orders.map((order) => ({
        order,
        ...getOrderFinancials(order),
      }));

      if (!orderBreakdown || !Array.isArray(orderBreakdown) || !orderBreakdown.length) {
        throw new OrderNotFoundError("No hay órdenes válidas para procesar");
      }

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

      // Prepare payment documents for bulk insert
      const paymentDocuments = orderBreakdown.map((item, index) => {
        const isLast = index === orderBreakdown.length - 1;
        const paymentMethod = method === "split" ? "split" : method;
        const paidForOrder =
          method === "cash"
            ? item.total + (isLast ? Math.max(0, amountPaid - finalTotal) : 0)
            : item.total;

        // Generar receiptNumber único para evitar error E11000
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        const receiptNumber = `PAY-${dateStr}-${random}-${index + 1}`;

        return {
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
            receiptNumber,
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
        };
      });

      // Bulk insert payments
      const payments = await Payment.insertMany(paymentDocuments, { session: dbSession });

      // Bulk update orders
      const orderUpdateOperations = orders.map((order, index) => ({
        updateOne: {
          filter: { _id: order._id },
          update: {
            payment: payments[index]._id,
            paymentStatus: "paid",
            paymentMethod: method === "split" ? "mixed" : method,
            sessionStatus: "closed",
            status: order.status === "cancelled" ? "cancelled" : "completed",
            paidAt: new Date(),
            closedAt: new Date(),
          },
        },
      }));
      await Order.bulkWrite(orderUpdateOperations, { session: dbSession });

      const maintenanceUntil = new Date(
        Date.now() + Math.max(1, Number(maintenanceMinutes || 5)) * 60 * 1000
      );
      tableTx.setMaintenance(maintenanceUntil);
      tableTx.lastSessionClosedAt = new Date();
      tableTx.totalPayments = Number((tableTx.totalPayments || 0) + finalTotal);
      tableTx.lastPaymentAt = new Date();
      tableTx.releaseCheckoutLock();
      await tableTx.save({ session: dbSession });

      logger.info(`[Checkout] Transaction committed successfully for table ${tableId}`);

      return {
        payments,
        orders,
        table: tableTx,
        subtotal,
        discountTotal,
        finalTotal,
        amountPaid,
        maintenanceUntil,
      };
    });

    // Get applied discount IDs (safe to do outside transaction)
    const appliedDiscountIds = await Discount.find({
      order: { $in: result.orders.map((order) => order._id) },
      status: "APPLIED",
    })
      .distinct("_id")
      .lean();

    await completeReservationOnTableClose(tableId);
    await emitTableUpdate(tableId);

    for (const payment of result.payments) {
      emitPaymentCreated(payment);
      emitPaymentCompleted(payment);
    }
    io.emit("table:closed", { tableId, sessionId, maintenanceUntil: result.maintenanceUntil });

    const updatedTable = await Table.findById(tableId).lean();
    const decoratedTable = await attachTableSummary(updatedTable);

    logger.info(
      `[Payment] Session checkout OK mesa ${updatedTable.number} - $${result.finalTotal} - ${result.payments.length} pago(s)`
    );

    return {
      payment: result.payments[0],
      payments: result.payments,
      orders: result.orders,
      table: decoratedTable,
      receiptSummary: {
        sessionId,
        subtotal: result.subtotal,
        discountTotal: result.discountTotal,
        total: result.finalTotal,
        method,
        amountPaid: toMoney(result.amountPaid),
        change: method === "cash" ? toMoney(Math.max(0, result.amountPaid - result.finalTotal)) : 0,
        maintenanceUntil: result.maintenanceUntil,
        appliedDiscounts: appliedDiscountIds,
        receiptNumber: result.payments[0]?.receipt?.receiptNumber,
        issuedAt: result.payments[0]?.receipt?.issuedAt || result.payments[0]?.createdAt,
      },
      balanceDue: 0,
    };
  } catch (error) {
    logger.error(`[Checkout] Transaction failed for table ${tableId}: ${error.message}`);
    throw error;
  } finally {
    // Always release checkout lock
    await Table.findByIdAndUpdate(tableId, {
      checkoutInProgress: false,
      checkoutStartedAt: null,
    }).catch((err) => {
      logger.error(`[Checkout] Failed to release checkout lock for table ${tableId}: ${err.message}`);
    });
  }
};
