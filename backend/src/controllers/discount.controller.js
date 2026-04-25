import mongoose from "mongoose";
import Discount from "../models/Discount.js";
import Order    from "../models/Order.js";
import { logger } from "../config/logger.js";
import {
  ok, badRequest, notFound, forbidden,
} from "../utils/response.js";

const VALID_TYPES   = ["PERCENT", "FLAT"];
const VALID_REASONS = ["WAIT_TIME", "QUALITY_ISSUE", "COMP", "EMPLOYEE", "OTHER"];

/* =========================================================
   APPLY DISCOUNT (transaccional)
========================================================= */
export const applyDiscount = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, items, type, value, reason, note } = req.body;

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

    if (discountAmount > subtotal) { await session.abortTransaction(); return badRequest(res, "El descuento no puede superar el subtotal"); }
    if (discountAmount > order.total) { await session.abortTransaction(); return badRequest(res, "El descuento no puede superar el total de la orden"); }

    /* ─── Crear registro de descuento ─── */
    const orderTotalBefore = order.total;

    const [discount] = await Discount.create([{
      order: orderId,
      items: validatedItems,
      type, value,
      amountApplied:    discountAmount,
      reason, note,
      appliedBy:        req.user.id,
      status:           "APPLIED",
      orderTotalBefore,
      orderTotalAfter:  Math.max(0, orderTotalBefore - discountAmount),
      meta: { ip: req.ip },
    }], { session });

    /* ─── Actualizar orden ─── */
    order.total = Math.max(0, order.total - discountAmount);
    order.discounts.push(discount._id);
    await order.save({ session });

    await session.commitTransaction();

    logger.info(`[Discount] $${discountAmount.toFixed(2)} aplicado a orden ${orderId} por ${req.user.id}`);
    return ok(res, discount, `Descuento de $${discountAmount.toFixed(2)} aplicado correctamente`);

  } catch (error) {
    await session.abortTransaction();
    next(error);
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
  } catch (error) { next(error); }
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
  } catch (error) { next(error); }
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

    logger.info(`[Discount] Aprobado: ${req.params.id}`);
    return ok(res, discount, "Descuento aprobado");
  } catch (error) { next(error); }
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

    logger.info(`[Discount] Rechazado: ${req.params.id}`);
    return ok(res, discount, "Descuento rechazado");
  } catch (error) { next(error); }
};