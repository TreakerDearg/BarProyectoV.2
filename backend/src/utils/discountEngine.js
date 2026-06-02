import Discount from "../models/Discount.js";
import Menu from "../models/Menu.js";

/**
 * Verifica si un descuento es válido en un momento específico
 * @param {Object} discount - Objeto de descuento
 * @param {Date} date - Fecha a verificar
 * @returns {boolean} True si el descuento es válido en esa fecha/hora
 */
function isDiscountValidAtTime(discount, date = new Date()) {
  const now = new Date(date);

  // Verificar rango de fechas
  if (discount.validFrom && new Date(discount.validFrom) > now) {
    return false;
  }

  if (discount.validUntil && new Date(discount.validUntil) < now) {
    return false;
  }

  // Verificar días de la semana
  if (discount.applicableDays && discount.applicableDays.length > 0) {
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    if (!discount.applicableDays.includes(dayOfWeek)) {
      return false;
    }
  }

  // Verificar horario
  if (discount.applicableHours && discount.applicableHours.start && discount.applicableHours.end) {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = discount.applicableHours.start.split(':').map(Number);
    const [endHour, endMin] = discount.applicableHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (currentTime < startTime || currentTime > endTime) {
      return false;
    }
  }

  return true;
}

/**
 * Obtiene descuentos activos por menú especial
 * @param {string} menuId - ID del menú
 * @returns {Promise<Array>} Lista de descuentos activos
 */
export async function getActiveMenuDiscounts(menuId) {
  try {
    if (!menuId) return [];

    const menu = await Menu.findById(menuId).lean();
    if (!menu || !menu.isActive) return [];

    // Buscar descuentos asociados a este menú
    const discounts = await Discount.find({
      menuId: menuId,
      status: "APPLIED",
    })
      .populate("promotionId")
      .lean();

    // Filtrar descuentos que son válidos en este momento
    const now = new Date();
    return discounts.filter(discount => isDiscountValidAtTime(discount, now));
  } catch (error) {
    console.error("[DiscountEngine] Error obteniendo descuentos de menú:", error);
    return [];
  }
}

/**
 * Obtiene descuentos activos por fecha especial
 * @param {Date} date - Fecha a verificar
 * @returns {Promise<Array>} Lista de descuentos activos para la fecha
 */
export async function getActiveDateDiscounts(date = new Date()) {
  try {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Buscar descuentos activos que tengan restricciones de fecha/hora
    const discounts = await Discount.find({
      status: "APPLIED",
      $or: [
        { validFrom: { $ne: null } },
        { validUntil: { $ne: null } },
        { applicableDays: { $ne: null, $ne: [] } },
        { applicableHours: { $ne: null } },
      ],
    })
      .populate("promotionId")
      .lean();

    // Filtrar descuentos que aplican para esta fecha/hora específica
    return discounts.filter(discount => isDiscountValidAtTime(discount, targetDate));
  } catch (error) {
    console.error("[DiscountEngine] Error obteniendo descuentos de fecha:", error);
    return [];
  }
}

/**
 * Calcula el monto total de descuentos
 * @param {number} subtotal - Subtotal antes de descuentos
 * @param {Array} discounts - Lista de descuentos
 * @returns {number} Total de descuentos aplicados
 */
export function calculateDiscountAmount(subtotal, discounts = []) {
  if (!discounts || discounts.length === 0) return 0;

  let totalDiscount = 0;

  for (const discount of discounts) {
    if (discount.type === "PERCENT") {
      const discountAmount = subtotal * (discount.value / 100);
      totalDiscount += discountAmount;
    } else if (discount.type === "FLAT") {
      totalDiscount += discount.value;
    }
  }

  // El descuento no puede superar el subtotal
  return Math.min(totalDiscount, subtotal);
}

/**
 * Aplica descuentos a un subtotal
 * @param {number} subtotal - Subtotal antes de descuentos
 * @param {Array} discounts - Lista de descuentos a aplicar
 * @returns {Object} Objeto con subtotal, discountTotal, y total
 */
export function applyDiscounts(subtotal, discounts = []) {
  const discountTotal = calculateDiscountAmount(subtotal, discounts);
  const total = Math.max(0, subtotal - discountTotal);

  return {
    subtotal,
    discountTotal,
    total,
  };
}

/**
 * Valida si un descuento puede aplicarse
 * @param {Object} discount - Objeto de descuento
 * @param {number} subtotal - Subtotal de la orden
 * @returns {Object} Objeto con valid y reason
 */
export function validateDiscount(discount, subtotal) {
  if (!discount) {
    return { valid: false, reason: "Descuento no proporcionado" };
  }

  if (discount.status !== "APPLIED") {
    return { valid: false, reason: "Descuento no está activo" };
  }

  if (discount.type === "PERCENT") {
    if (discount.value <= 0 || discount.value > 100) {
      return { valid: false, reason: "Porcentaje inválido" };
    }
  }

  if (discount.type === "FLAT") {
    if (discount.value <= 0) {
      return { valid: false, reason: "Monto inválido" };
    }
    if (discount.value > subtotal) {
      return { valid: false, reason: "Descuento supera el subtotal" };
    }
  }

  return { valid: true };
}

/**
 * Obtiene el mejor descuento disponible para un subtotal
 * @param {Array} discounts - Lista de descuentos disponibles
 * @param {number} subtotal - Subtotal de la orden
 * @returns {Object|null} Mejor descuento o null
 */
export function getBestDiscount(discounts = [], subtotal) {
  if (!discounts || discounts.length === 0) return null;

  let bestDiscount = null;
  let bestAmount = 0;

  for (const discount of discounts) {
    const validation = validateDiscount(discount, subtotal);
    if (!validation.valid) continue;

    let discountAmount = 0;
    if (discount.type === "PERCENT") {
      discountAmount = subtotal * (discount.value / 100);
    } else if (discount.type === "FLAT") {
      discountAmount = discount.value;
    }

    if (discountAmount > bestAmount) {
      bestAmount = discountAmount;
      bestDiscount = discount;
    }
  }

  return bestDiscount;
}
