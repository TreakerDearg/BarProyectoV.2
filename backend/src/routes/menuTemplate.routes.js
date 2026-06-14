import { Router } from "express";
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementUsage,
} from "../controllers/menuTemplate.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { menuLimiter } from "../middlewares/rateLimit.js";
import { sanitize } from "../middlewares/sanitize.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   GET ALL TEMPLATES
========================================================= */
router.get("/", menuLimiter, sanitize, getTemplates);

/* =========================================================
   GET TEMPLATE BY ID
========================================================= */
router.get("/:id", menuLimiter, sanitize, getTemplateById);

/* =========================================================
   CREATE TEMPLATE (ADMIN)
========================================================= */
router.post("/", ...adminOnly, menuLimiter, sanitize, createTemplate);

/* =========================================================
   UPDATE TEMPLATE (ADMIN)
========================================================= */
router.put("/:id", ...adminOnly, menuLimiter, sanitize, updateTemplate);

/* =========================================================
   DELETE TEMPLATE (ADMIN)
========================================================= */
router.delete("/:id", ...adminOnly, menuLimiter, deleteTemplate);

/* =========================================================
   INCREMENT USAGE COUNT
========================================================= */
router.patch("/:id/usage", menuLimiter, incrementUsage);

export default router;
