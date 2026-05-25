import DynamicPricingRule from "../models/DynamicPricingRule.js";
import Promotion from "../models/Promotion.js";

/**
 * Calculates the final price of a product based on current dynamic pricing rules and active promotions.
 * 
 * @param {Object} product - The product object (must have price and category).
 * @returns {Promise<Number>} - The final calculated price.
 */
export const calculateProductPrice = async (product) => {
  let finalPrice = product.price;

  // 1. Apply Dynamic Pricing (Multiplier)
  const globalRule = await DynamicPricingRule.findOne({ name: "GLOBAL_BASE", isActive: true });
  if (globalRule) {
    finalPrice *= globalRule.multiplier;
  }

  // 2. Apply active Promotions
  const autoPromoRule = await DynamicPricingRule.findOne({ name: "GLOBAL_AUTO_PROMOTIONS" });
  const isAutoPromotionsEnabled = autoPromoRule ? autoPromoRule.isActive : true;

  if (!isAutoPromotionsEnabled) {
    return Math.round(finalPrice * 100) / 100;
  }

  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" });
  const currentTime = now.getHours() * 100 + now.getMinutes(); // e.g. 16:30 -> 1630

  const activePromotions = await Promotion.find({
    isActive: true,
    $or: [
      { applicableProducts: product._id },
      { applicableCategories: product.category }
    ],
    "schedule.daysOfWeek": currentDay,
  });

  for (const promo of activePromotions) {
    const promoStart = parseInt(promo.schedule.startTime.replace(":", ""));
    const promoEnd = parseInt(promo.schedule.endTime.replace(":", ""));

    if (currentTime >= promoStart && currentTime <= promoEnd) {
      if (promo.type === "PERCENT") {
        finalPrice *= (1 - promo.value / 100);
      } else if (promo.type === "FLAT") {
        finalPrice = Math.max(0, finalPrice - promo.value);
      }
      // If multiple promos apply, we apply them sequentially or pick the best one?
      // For now, sequential application.
    }
  }

  return Math.round(finalPrice * 100) / 100; // Round to 2 decimals
};
