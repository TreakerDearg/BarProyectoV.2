/**
 * PromotionsPage (discounts/pages)
 *
 * Este archivo ya no contiene lógica propia.
 * Re-exporta la implementación canónica desde modules/promotions/pages,
 * que consume el backend real (/promotions, /promotions/:id/toggle, etc.)
 * y reemplaza la versión antigua basada en pricingService.
 *
 * Si necesitás el toggle de "Motor Automático" de precios dinámicos,
 * ese control vive en DynamicPricingPage.
 */
export { default } from "../../promotions/pages/PromotionsPage";
