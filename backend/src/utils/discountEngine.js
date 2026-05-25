import Discount from "../models/Discount.js";
import Menu from "../models/Menu.js";

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
    // Nota: Esta función puede expandirse cuando se implemente
    // la relación directa entre Menu y Discount
    const discounts = await Discount.find({
      status: "APPLIED",
      reason: "OTHER", // Descuentos de menú especial
    }).lean();

    return discounts;
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
    const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Buscar descuentos que puedan aplicarse por fecha
    // Nota: Esta función puede expandirse cuando se agreguen
    // campos de fecha al modelo Discount
    const discounts = await Discount.find({
      status: "APPLIED",
    }).lean();

    // Filtrar descuentos que aplican para esta fecha
    // Por ahora, retornamos todos los descuentos activos
    // La lógica específica de fechas puede implementarse después
    return discounts;
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
