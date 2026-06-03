/* =========================================================
   ROUTES INDEX — Bartender System
   Punto central de registro de todas las rutas de la API.
========================================================= */
import { Router } from "express";

import authRoutes        from "./auth.routes.js";
import userRoutes        from "./user.routes.js";
import productRoutes     from "./product.routes.js";
import inventoryRoutes   from "./inventory.routes.js";
import recipeRoutes      from "./recipe.routes.js";
import orderRoutes       from "./order.routes.js";
import rouletteRoutes    from "./roulette.routes.js";
import tableRoutes       from "./table.routes.js";
import reservationRoutes from "./reservation.routes.js";
import menuRoutes        from "./menu.routes.js";
import dashboardRoutes   from "./dashboard.routes.js";
import discountRoutes    from "./discount.routes.js";
import dynamicPricingRoutes from "./dynamicPricing.routes.js";
import promotionRoutes    from "./promotion.routes.js";
import pricingEventRoutes from "./pricingEvent.routes.js";
import paymentRoutes      from "./payment.routes.js";
import trackingRoutes    from "./tracking.routes.js";
import attendanceRoutes  from "./attendance.routes.js";
import performanceRoutes from "./performance.routes.js";
import uploadRoutes      from "./upload.routes.js";
import auditRoutes       from "./audit.routes.js";
import alertsRoutes      from "./alerts.routes.js";

const router = Router();

/* =========================================================
   REGISTRO CENTRALIZADO
   Todos los prefijos de la API viven aquí.
========================================================= */
router.use("/auth",         authRoutes);
router.use("/users",        userRoutes);
router.use("/products",     productRoutes);
router.use("/inventory",    inventoryRoutes);
router.use("/recipes",      recipeRoutes);
router.use("/orders",       orderRoutes);
router.use("/roulette",     rouletteRoutes);
router.use("/tables",       tableRoutes);
router.use("/reservations", reservationRoutes);
router.use("/menus",        menuRoutes);
router.use("/dashboard",    dashboardRoutes);
router.use("/discounts",    discountRoutes);
router.use("/payments",     paymentRoutes);
router.use("/dynamic-pricing", dynamicPricingRoutes);
router.use("/promotions",   promotionRoutes);
router.use("/pricing-events", pricingEventRoutes);
router.use("/tracking",     trackingRoutes);
router.use("/attendance",   attendanceRoutes);
router.use("/performance",  performanceRoutes);
router.use("/upload",       uploadRoutes);
router.use("/audit",        auditRoutes);
router.use("/alerts",       alertsRoutes);

export default router;
