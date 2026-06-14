import { Router } from "express";
import {
  getMenus, getMenuById, getPublicMenu, getMenuBySlug, getFeaturedMenus, searchMenus,
  createMenu, updateMenu, deleteMenu
} from "../controllers/menu.controller.js";
import { validate } from "../middlewares/validate.js";
import { createMenuSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.js";
import { menuLimiter, publicMenuLimiter } from "../middlewares/rateLimit.js";
import { sanitize } from "../middlewares/sanitize.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   PUBLIC
========================================================= */
router.get("/public", publicMenuLimiter, sanitize, getPublicMenu);
router.get("/public/featured", publicMenuLimiter, sanitize, getFeaturedMenus);
router.get("/public/search", publicMenuLimiter, sanitize, searchMenus);
router.get("/public/slug/:slug", publicMenuLimiter, sanitize, getMenuBySlug);

/* =========================================================
   ADMIN
========================================================= */
router.get("/", ...adminOnly, menuLimiter, sanitize, getMenus);
router.get("/:id", ...adminOnly, menuLimiter, sanitize, getMenuById);
router.post("/", ...adminOnly, menuLimiter, sanitize, uploadSingle("image"), validate(createMenuSchema), createMenu);
router.put("/:id", ...adminOnly, menuLimiter, sanitize, uploadSingle("image"), updateMenu);
router.delete("/:id", ...adminOnly, menuLimiter, deleteMenu);

export default router;