import { Router } from "express";
import {
  getPublicMenus,
  getPublicMenuBySlug,
  getFeaturedPublicMenus,
  searchPublicMenus
} from "../controllers/menuPublic.controller.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

/* =========================================================
   PUBLIC API V1
========================================================= */

// Apply rate limiting to all public endpoints
router.use(rateLimiter);

/* =========================================================
   MENUS
========================================================= */
router.get("/", getPublicMenus);
router.get("/featured", getFeaturedPublicMenus);
router.get("/search", searchPublicMenus);
router.get("/slug/:slug", getPublicMenuBySlug);

export default router;
