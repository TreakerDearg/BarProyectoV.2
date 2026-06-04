import mongoose from "mongoose";
import Discount from "../models/Discount.js";
import Order    from "../models/Order.js";
import ActivityLog from "../models/ActivityLog.js";
import { logger } from "../config/logger.js";
import { getIO, emitDiscountEvent } from "../socket/index.js";
import {
  ok, badRequest, notFound, forbidden,
} from "../utils/response.js";

const VALID_TYPES   = ["PERCENT", "FLAT"];
const VALID_REASONS = ["WAIT_TIME", "QUALITY_ISSUE", "COMP", "EMPLOYEE", "OTHER"];

/* =========================================================
   DAILY LIMITS CONFIGURATION
========================================================= */
const DAILY_LIMITS = {
  admin: { amount: 10000, count: 100 },
  manager: { amount: 5000, count: 50 },
  bartender: { amount: 500, count: 10 },
  waiter: { amount: 300, count: 8 },
};

/* =========================================================
   CASCADE APPROVAL THRESHOLDS
========================================================= */
const APPROVAL_THRESHOLDS = {
  LEVEL_1: 50, // Requires level 1 approval for discounts >$50
  LEVEL_2: 200, // Requires level 2 approval for discounts >$200
  LEVEL_3: 500, // Requires level 3 approval for discounts >$500
};

/* =========================================================
   FRAUD DETECTION CONFIGURATION
========================================================= */
const FRAUD_THRESHOLDS = {
  SAME_TABLE_SAME_REASON: 3, // Alert if >3 discounts for same table with same reason in 1 hour
  HIGH_FREQUENCY: 10, // Alert if >10 discounts in 1 hour from same employee
  HIGH_VALUE_COMP: 5, // Alert if >5 COMP discounts >$50 in 1 day
};

/* =========================================================
   CHECK DAILY LIMIT
========================================================= */
async function checkDailyLimit(userId, role, discountAmount) {
  const limits = DAILY_LIMITS[role] || DAILY_LIMITS.bartender;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayDiscounts = await Discount.find({
    appliedBy: userId,
    status: "APPLIED",
    createdAt: { $gte: today, $lt: tomorrow },
  }).lean();

  const totalAmount = todayDiscounts.reduce((sum, d) => sum + (d.amountApplied || 0), 0);
  const totalCount = todayDiscounts.length;

  const remainingAmount = Math.max(0, limits.amount - totalAmount);
  const remainingCount = Math.max(0, limits.count - totalCount);

  if (totalAmount + discountAmount > limits.amount) {
    return {
      valid: false,
      reason: `Límite diario de monto excedido. Restante: $${remainingAmount.toFixed(2)}`,
      remainingAmount,
      remainingCount,
    };
  }

  if (totalCount >= limits.count) {
    return {
      valid: false,
      reason: `Límite diario de cantidad excedido. Máximo: ${limits.count} descuentos`,
      remainingAmount,
      remainingCount,
    };
  }

  return {
    valid: true,
    remainingAmount: remainingAmount - discountAmount,
    remainingCount: remainingCount - 1,
  };
}

/* =========================================================
   FRAUD DETECTION
========================================================= */
async function detectFraudPatterns(userId, tableId, reason, discountAmount) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const alerts = [];

  // Check: Same table, same reason in last hour
  const sameTableSameReason = await Discount.find({
    table: tableId,
    reason: reason,
    appliedBy: userId,
    status: "APPLIED",
    createdAt: { $gte: oneHourAgo },
  }).lean();

  if (sameTableSameReason.length >= FRAUD_THRESHOLDS.SAME_TABLE_SAME_REASON) {
    alerts.push({
      type: "SAME_TABLE_SAME_REASON",
      message: `Múltiples descuentos (${sameTableSameReason.length}) para la misma mesa con el mismo motivo en la última hora`,
      severity: "high",
    });
  }

  // Check: High frequency from same employee in last hour
  const highFrequency = await Discount.find({
    appliedBy: userId,
    status: "APPLIED",
    createdAt: { $gte: oneHourAgo },
  }).lean();

  if (highFrequency.length >= FRAUD_THRESHOLDS.HIGH_FREQUENCY) {
    alerts.push({
      type: "HIGH_FREQUENCY",
      message: `Alta frecuencia de descuentos (${highFrequency.length}) en la última hora`,
      severity: "high",
    });
  }

  // Check: High value COMP discounts in last day
  if (reason === "COMP" && discountAmount > 50) {
    const highValueComp = await Discount.find({
      appliedBy: userId,
      reason: "COMP",
      amountApplied: { $gte: 50 },
      status: "APPLIED",
      createdAt: { $gte: oneDayAgo },
    }).lean();

    if (highValueComp.length >= FRAUD_THRESHOLDS.HIGH_VALUE_COMP) {
      alerts.push({
        type: "HIGH_VALUE_COMP",
        message: `Múltiples descuentos COMP de alto valor (${highValueComp.length}) en el último día`,
        severity: "medium",
      });
    }
  }

  return alerts;
}

/* =========================================================
   APPLY DISCOUNT (transaccional)
========================================================= */
export const applyDiscount = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, items, type, value, reason, note, promotionId } = req.body;

    /* ─── Validaciones básicas ─── */
    if (!orderId)                          return (await session.abortTransaction(), badRequest(res, "orderId es obligatorio"));
    if (!VALID_TYPES.includes(type))       return (await session.abortTransaction(), badRequest(res, `type inválido. Válidos: ${VALID_TYPES.join(", ")}`));
    if (!VALID_REASONS.includes(reason))   return (await session.abortTransaction(), badRequest(res, `reason inválido. Válidos: ${VALID_REASONS.join(", ")}`));
    if (!value || value <= 0)              return (await session.abortTransaction(), badRequest(res, "value debe ser mayor a 0"));
    if (type === "PERCENT" && value > 100) return (await session.abortTransaction(), badRequest(res, "El porcentaje no puede superar 100%"));

    const order = await Order.findById(orderId).session(session);
    if (!order) { await session.abortTransaction(); return notFound(res, "Orden no encontrada"); }
    if (order.sessionStatus === "closed") { await session.abortTransaction(); return badRequest(res, "La orden está cerrada"); }

    /* ─── Validar items ─── */
    const validatedItems = [];
    let subtotal = 0;

    if (!items?.length) { await session.abortTransaction(); return badRequest(res, "Debes indicar al menos un item"); }

    for (const item of items) {
      const orderItem = order.items.find((i) => i.product.toString() === item.product);
      if (!orderItem) { await session.abortTransaction(); return badRequest(res, `Item no encontrado en la orden`); }

      const qty       = item.quantity || orderItem.quantity;
      const itemTotal = orderItem.price * qty;
      subtotal += itemTotal;

      validatedItems.push({
        product:  orderItem.product,
        name:     orderItem.name,
        price:    orderItem.price,
        quantity: qty,
        subtotal: itemTotal,
      });
    }

    if (subtotal <= 0) { await session.abortTransaction(); return badRequest(res, "Subtotal inválido"); }

    /* ─── Control de permisos para descuentos altos ─── */
    if (type === "PERCENT" && value > 20 && !req.user?.permissions?.APPROVE_DISCOUNT) {
      await session.abortTransaction();
      return forbidden(res, "Requieres permiso APPROVE_DISCOUNT para descuentos mayores al 20%");
    }

    /* ─── Calcular monto ─── */
    const discountAmount = type === "PERCENT" ? subtotal * (value / 100) : Number(value);
    const orderTotalBefore = order.total;

    /* ─── Verificar límites diarios ─── */
    const dailyLimitCheck = await checkDailyLimit(req.user.id, req.user.role, discountAmount);
    if (!dailyLimitCheck.valid) {
      await session.abortTransaction();
      return forbidden(res, dailyLimitCheck.reason);
    }

    /* ─── Detectar patrones sospechosos (fraud detection) ─── */
    const fraudAlerts = await detectFraudPatterns(req.user.id, order.table, reason, discountAmount);
    if (fraudAlerts.length > 0 && !req.user?.permissions?.APPROVE_DISCOUNT) {
      await session.abortTransaction();
      return forbidden(res, `Patrón sospechoso detectado: ${fraudAlerts[0].message}. Requiere aprobación de gerente.`);
    }

    /* ─── Determinar si requiere aprobación en cascada ─── */
    let requiresApproval = false;
    let approvalStage = "NONE";

    if (discountAmount > APPROVAL_THRESHOLDS.LEVEL_3) {
      requiresApproval = true;
      approvalStage = "LEVEL_3";
    } else if (discountAmount > APPROVAL_THRESHOLDS.LEVEL_2) {
      requiresApproval = true;
      approvalStage = "LEVEL_2";
    } else if (discountAmount > APPROVAL_THRESHOLDS.LEVEL_1) {
      requiresApproval = true;
      approvalStage = "LEVEL_1";
    }

    if (requiresApproval && !req.user?.permissions?.APPROVE_DISCOUNT) {
      // Si requiere aprobación y el usuario no tiene permiso, crear como PENDING
      const [pendingDiscount] = await Discount.create([{
        order: orderId,
        table: order.table || null,
        sessionId: order.sessionId || null,
        items: validatedItems,
        type, value,
        amountApplied: discountAmount,
        reason, note,
        appliedBy: req.user.id,
        promotionId: promotionId || null,
        status: "PENDING",
        approvalStage,
        approvalRequestedAt: new Date(),
        approvalRequestedBy: req.user.id,
        orderTotalBefore,
        orderTotalAfter: Math.max(0, orderTotalBefore - discountAmount),
        meta: { ip: req.ip },
      }], { session });

      await session.commitTransaction();
      session.endSession();

      // Emit socket event for pending discount
      try {
        const io = getIO();
        if (io) {
          io.emit("discount:pending", { discountId: pendingDiscount._id, requestedBy: req.user.id, approvalStage });
        }
      } catch (socketError) {
        logger.error("[Discount] Error emitting discount:pending event:", socketError);
      }

      logger.info(`[Discount] Descuento pendiente de aprobación: ${pendingDiscount._id} (etapa ${approvalStage})`);

      return ok(res, pendingDiscount, `Descuento de $${discountAmount.toFixed(2)} requiere aprobación de nivel ${approvalStage}`);
    }

    if (discountAmount > subtotal) { await session.abortTransaction(); return badRequest(res, "El descuento no puede superar el subtotal"); }
    if (discountAmount > order.total) { await session.abortTransaction(); return badRequest(res, "El descuento no puede superar el total de la orden"); }

    /* ─── Crear registro de descuento ─── */

    const [discount] = await Discount.create([{
      order: orderId,
      table: order.table || null,
      sessionId: order.sessionId || null,
      items: validatedItems,
      type, value,
      amountApplied:    discountAmount,
      reason, note,
      appliedBy:        req.user.id,
      promotionId:      promotionId || null,
      status:           "APPLIED",
      orderTotalBefore,
      orderTotalAfter:  Math.max(0, orderTotalBefore - discountAmount),
      meta: { ip: req.ip },
    }], { session });

    const userLog = await mongoose.model("User").findById(req.user.id).select("name").lean();
    await ActivityLog.create([{
      userId: req.user.id,
      userName: userLog?.name || "Sistema",
      userRole: req.user.role || "bartender",
      activityType: "discount_applied",
      description: `Aplicó descuento de $${discountAmount.toFixed(2)} a la orden ${orderId}`,
      metadata: { type, value, reason, promotionId },
      sessionId: order.sessionId,
      orderId: order._id,
      discountId: discount._id,
      tableId: order.table,
    }], { session });

    /* ─── Actualizar orden ─── */
    order.discountTotal = (order.discountTotal || 0) + discountAmount;
    order.discounts.push(discount._id);
    await order.save({ session });

    await session.commitTransaction();

    logger.info(`[Discount] $${discountAmount.toFixed(2)} aplicado a orden ${orderId} por ${req.user.id}`);

    // Emitir evento Socket.IO para notificar en tiempo real
    try {
      const io = getIO();
      if (io) {
        emitDiscountEvent(io, "discount:applied", {
          orderId: order._id.toString(),
          discountId: discount._id.toString(),
          amount: discountAmount,
          reason,
          type,
          table: typeof order.table === 'object' ? order.table.number : order.table,
          appliedBy: req.user.id,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (socketError) {
      logger.error(`[Discount] Error emitiendo evento Socket.IO:`, socketError);
    }

    return ok(res, discount, `Descuento de $${discountAmount.toFixed(2)} aplicado correctamente`);

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GET BY ORDER
========================================================= */
export const getOrderDiscounts = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) return badRequest(res, "ID inválido");

    const discounts = await Discount.find({ order: orderId })
      .populate("appliedBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    return ok(res, discounts);
  } catch (error) { throw error; }
};

/* =========================================================
   GET ALL
========================================================= */
export const getAllDiscounts = async (req, res, next) => {
  try {
    const { status, reason, limit = 100 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (reason) filter.reason = reason;

    const discounts = await Discount.find(filter)
      .populate("appliedBy",  "name role")
      .populate("approvedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return ok(res, discounts);
  } catch (error) { throw error; }
};

/* =========================================================
   APPROVE / REJECT
========================================================= */
export const approveDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return notFound(res, "Descuento no encontrado");
    if (discount.status === "APPLIED") return badRequest(res, "El descuento ya está aprobado");

    discount.status     = "APPLIED";
    discount.approvedBy = req.user.id;
    discount.approvedAt = new Date();
    await discount.save();

    // Emit socket event for discount approval
    try {
      const io = getIO();
      if (io) {
        io.emit("discount:approved", { discountId: discount._id, approvedBy: req.user.id });
      }
    } catch (socketError) {
      logger.error("[Discount] Error emitting discount:approved event:", socketError);
    }

    logger.info(`[Discount] Aprobado: ${req.params.id}`);
    return ok(res, discount, "Descuento aprobado");
  } catch (error) { throw error; }
};

export const rejectDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return notFound(res, "Descuento no encontrado");
    if (discount.status === "REJECTED") return badRequest(res, "El descuento ya está rechazado");

    discount.status     = "REJECTED";
    discount.rejectedBy = req.user.id;
    discount.rejectedAt = new Date();
    await discount.save();

    // Emit socket event for discount rejection
    try {
      const io = getIO();
      if (io) {
        io.emit("discount:rejected", { discountId: discount._id, rejectedBy: req.user.id });
      }
    } catch (socketError) {
      logger.error("[Discount] Error emitting discount:rejected event:", socketError);
    }

    logger.info(`[Discount] Rechazado: ${req.params.id}`);
    return ok(res, discount, "Descuento rechazado");
  } catch (error) { throw error; }
};

/* =========================================================
   DAILY STATS WITH BREAKDOWN
========================================================= */
export const getDailyStats = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    // Normalizar fecha a inicio del día
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const discounts = await Discount.find({
      status: "APPLIED",
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("appliedBy", "name role")
      .populate("table", "number")
      .lean();

    // Estadísticas generales
    const totalDiscounts = discounts.length;
    const totalAmount = discounts.reduce((sum, d) => sum + (d.amountApplied || 0), 0);

    // Breakdown por tipo
    const byType = {
      PERCENT: {
        count: 0,
        amount: 0,
        averageValue: 0,
      },
      FLAT: {
        count: 0,
        amount: 0,
        averageValue: 0,
      },
    };

    // Breakdown por razón
    const byReason = {};
    VALID_REASONS.forEach(reason => {
      byReason[reason] = { count: 0, amount: 0 };
    });

    // Breakdown por empleado
    const byEmployee = {};

    // Breakdown por mesa
    const byTable = {};

    // Calcular breakdowns
    discounts.forEach(d => {
      // Por tipo
      if (byType[d.type]) {
        byType[d.type].count++;
        byType[d.type].amount += d.amountApplied || 0;
      }

      // Por razón
      if (byReason[d.reason]) {
        byReason[d.reason].count++;
        byReason[d.reason].amount += d.amountApplied || 0;
      }

      // Por empleado
      const empId = d.appliedBy?._id?.toString() || "unknown";
      const empName = d.appliedBy?.name || "Desconocido";
      if (!byEmployee[empId]) {
        byEmployee[empId] = {
          id: empId,
          name: empName,
          role: d.appliedBy?.role || "unknown",
          count: 0,
          amount: 0,
        };
      }
      byEmployee[empId].count++;
      byEmployee[empId].amount += d.amountApplied || 0;

      // Por mesa
      const tableId = d.table?._id?.toString() || "unknown";
      const tableNumber = typeof d.table === "object" ? d.table.number : d.table;
      if (tableId && tableId !== "unknown") {
        if (!byTable[tableId]) {
          byTable[tableId] = {
            id: tableId,
            number: tableNumber,
            count: 0,
            amount: 0,
          };
        }
        byTable[tableId].count++;
        byTable[tableId].amount += d.amountApplied || 0;
      }
    });

    // Calcular promedios por tipo
    byType.PERCENT.averageValue = byType.PERCENT.count > 0
      ? discounts.filter(d => d.type === "PERCENT").reduce((sum, d) => sum + d.value, 0) / byType.PERCENT.count
      : 0;
    byType.FLAT.averageValue = byType.FLAT.count > 0
      ? discounts.filter(d => d.type === "FLAT").reduce((sum, d) => sum + d.value, 0) / byType.FLAT.count
      : 0;

    // Convertir a arrays ordenados
    const byEmployeeArray = Object.values(byEmployee).sort((a, b) => b.amount - a.amount);
    const byTableArray = Object.values(byTable).sort((a, b) => b.amount - a.amount);

    return ok(res, {
      date: startOfDay.toISOString().split('T')[0],
      summary: {
        totalDiscounts,
        totalAmount,
        averageDiscount: totalDiscounts > 0 ? totalAmount / totalDiscounts : 0,
      },
      byType,
      byReason,
      byEmployee: byEmployeeArray,
      byTable: byTableArray,
      recentDiscounts: discounts.slice(0, 10).map(d => ({
        id: d._id,
        amount: d.amountApplied,
        type: d.type,
        reason: d.reason,
        table: typeof d.table === "object" ? d.table.number : d.table,
        appliedBy: d.appliedBy?.name,
        appliedAt: d.createdAt,
      })),
    });
  } catch (error) { throw error; }
};

/* =========================================================
   CHECK DAILY LIMIT REMAINING
========================================================= */
export const checkDailyLimitRemaining = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const limits = DAILY_LIMITS[role] || DAILY_LIMITS.bartender;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDiscounts = await Discount.find({
      appliedBy: userId,
      status: "APPLIED",
      createdAt: { $gte: today, $lt: tomorrow },
    }).lean();

    const totalAmount = todayDiscounts.reduce((sum, d) => sum + (d.amountApplied || 0), 0);
    const totalCount = todayDiscounts.length;

    return ok(res, {
      role,
      limits: {
        maxAmount: limits.amount,
        maxCount: limits.count,
      },
      used: {
        amount: totalAmount,
        count: totalCount,
      },
      remaining: {
        amount: Math.max(0, limits.amount - totalAmount),
        count: Math.max(0, limits.count - totalCount),
      },
    });
  } catch (error) { throw error; }
};

/* =========================================================
   CASCADE APPROVAL FUNCTIONS
========================================================= */
export const approveDiscountLevel1 = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return notFound(res, "Descuento no encontrado");
    if (discount.status !== "PENDING") return badRequest(res, "El descuento no está pendiente de aprobación");
    if (discount.approvalStage !== "LEVEL_1") return badRequest(res, "Este descuento no requiere aprobación de nivel 1");

    discount.status = "APPLIED";
    discount.approvalStage = "FINAL";
    discount.level1ApprovedBy = req.user.id;
    discount.level1ApprovedAt = new Date();
    discount.approvedBy = req.user.id;
    discount.approvedAt = new Date();
    await discount.save();

    // Update order with discount
    const order = await Order.findById(discount.order);
    if (order) {
      order.discountTotal = (order.discountTotal || 0) + discount.amountApplied;
      order.discounts.push(discount._id);
      await order.save();
    }

    logger.info(`[Discount] Aprobado nivel 1: ${req.params.id}`);
    return ok(res, discount, "Descuento aprobado en nivel 1");
  } catch (error) { throw error; }
};

export const approveDiscountLevel2 = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return notFound(res, "Descuento no encontrado");
    if (discount.status !== "PENDING") return badRequest(res, "El descuento no está pendiente de aprobación");
    if (discount.approvalStage !== "LEVEL_2") return badRequest(res, "Este descuento no requiere aprobación de nivel 2");

    discount.status = "APPLIED";
    discount.approvalStage = "FINAL";
    discount.level2ApprovedBy = req.user.id;
    discount.level2ApprovedAt = new Date();
    discount.approvedBy = req.user.id;
    discount.approvedAt = new Date();
    await discount.save();

    // Update order with discount
    const order = await Order.findById(discount.order);
    if (order) {
      order.discountTotal = (order.discountTotal || 0) + discount.amountApplied;
      order.discounts.push(discount._id);
      await order.save();
    }

    logger.info(`[Discount] Aprobado nivel 2: ${req.params.id}`);
    return ok(res, discount, "Descuento aprobado en nivel 2");
  } catch (error) { throw error; }
};

export const approveDiscountLevel3 = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return notFound(res, "Descuento no encontrado");
    if (discount.status !== "PENDING") return badRequest(res, "El descuento no está pendiente de aprobación");
    if (discount.approvalStage !== "LEVEL_3") return badRequest(res, "Este descuento no requiere aprobación de nivel 3");

    discount.status = "APPLIED";
    discount.approvalStage = "FINAL";
    discount.level3ApprovedBy = req.user.id;
    discount.level3ApprovedAt = new Date();
    discount.approvedBy = req.user.id;
    discount.approvedAt = new Date();
    await discount.save();

    // Update order with discount
    const order = await Order.findById(discount.order);
    if (order) {
      order.discountTotal = (order.discountTotal || 0) + discount.amountApplied;
      order.discounts.push(discount._id);
      await order.save();
    }

    logger.info(`[Discount] Aprobado nivel 3: ${req.params.id}`);
    return ok(res, discount, "Descuento aprobado en nivel 3");
  } catch (error) { throw error; }
};

export const getPendingApprovals = async (req, res, next) => {
  try {
    const { stage } = req.query;
    const filter = { status: "PENDING" };
    
    if (stage) {
      filter.approvalStage = stage;
    }

    const discounts = await Discount.find(filter)
      .populate("appliedBy", "name role")
      .populate("approvalRequestedBy", "name role")
      .populate("order", "table total")
      .sort({ approvalRequestedAt: -1 })
      .limit(50)
      .lean();

    return ok(res, discounts);
  } catch (error) { throw error; }
};

/* =========================================================
   FRAUD ALERTS
========================================================= */
export const getFraudAlerts = async (req, res, next) => {
  try {
    const { userId, days = 7 } = req.query;
    const targetUserId = userId || req.user.id;
    const daysAgo = new Date(Date.now() - (Number(days) * 24 * 60 * 60 * 1000));

    const discounts = await Discount.find({
      appliedBy: targetUserId,
      status: "APPLIED",
      createdAt: { $gte: daysAgo },
    })
      .populate("table", "number")
      .sort({ createdAt: -1 })
      .lean();

    const alerts = [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Group by table and reason
    const tableReasonGroups = {};
    discounts.forEach(d => {
      const key = `${d.table?.number || 'unknown'}_${d.reason}`;
      if (!tableReasonGroups[key]) {
        tableReasonGroups[key] = [];
      }
      tableReasonGroups[key].push(d);
    });

    // Check for suspicious patterns
    Object.entries(tableReasonGroups).forEach(([key, group]) => {
      const recentInHour = group.filter(d => new Date(d.createdAt) > oneHourAgo);
      if (recentInHour.length >= FRAUD_THRESHOLDS.SAME_TABLE_SAME_REASON) {
        alerts.push({
          type: "SAME_TABLE_SAME_REASON",
          severity: "high",
          count: recentInHour.length,
          table: group[0].table?.number,
          reason: group[0].reason,
          message: `${recentInHour.length} descuentos para mesa ${group[0].table?.number} con motivo ${group[0].reason} en la última hora`,
        });
      }
    });

    // Check high frequency
    const lastHourDiscounts = discounts.filter(d => new Date(d.createdAt) > oneHourAgo);
    if (lastHourDiscounts.length >= FRAUD_THRESHOLDS.HIGH_FREQUENCY) {
      alerts.push({
        type: "HIGH_FREQUENCY",
        severity: "high",
        count: lastHourDiscounts.length,
        message: `${lastHourDiscounts.length} descuentos en la última hora`,
      });
    }

    return ok(res, {
      alerts,
      totalDiscounts: discounts.length,
      period: `${days} días`,
    });
  } catch (error) { throw error; }
};

/* =========================================================
   EXPORT REPORTS
========================================================= */
export const exportDiscountReport = async (req, res, next) => {
  try {
    const { startDate, endDate, format = "csv" } = req.query;

    if (!startDate || !endDate) {
      return badRequest(res, "startDate y endDate son requeridos");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const discounts = await Discount.find({
      status: "APPLIED",
      createdAt: { $gte: start, $lte: end },
    })
      .populate("appliedBy", "name role")
      .populate("table", "number")
      .populate("order", "total")
      .sort({ createdAt: -1 })
      .lean();

    if (format === "csv") {
      const headers = [
        "ID",
        "Fecha",
        "Mesa",
        "Empleado",
        "Rol",
        "Tipo",
        "Valor",
        "Monto Aplicado",
        "Razón",
        "Nota",
        "Total Orden",
      ];

      const csvRows = [
        headers.join(","),
        ...discounts.map(d => [
          d._id,
          new Date(d.createdAt).toISOString(),
          typeof d.table === "object" ? d.table?.number : d.table,
          d.appliedBy?.name || "N/A",
          d.appliedBy?.role || "N/A",
          d.type,
          d.value,
          d.amountApplied,
          d.reason,
          d.note || "",
          typeof d.order === "object" ? d.order?.total || 0 : 0,
        ].join(",")),
      ];

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=descuentos_${startDate}_${endDate}.csv`);
      return res.send(csvRows.join("\n"));
    }

    // JSON format (default)
    return ok(res, {
      period: { startDate, endDate },
      totalDiscounts: discounts.length,
      totalAmount: discounts.reduce((sum, d) => sum + (d.amountApplied || 0), 0),
      discounts,
    });
  } catch (error) { throw error; }
};