import { Router } from "express";
import {
  getMenus, getMenuById, getPublicMenu,
  createMenu, updateMenu, deleteMenu
} from "../controllers/menu.controller.js";
import { validate } from "../middlewares/validate.js";
import { createMenuSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   PUBLIC
========================================================= */
router.get("/public", getPublicMenu);

/* =========================================================
   ADMIN
========================================================= */
router.get("/", ...adminOnly, getMenus);
router.get("/:id", ...adminOnly, getMenuById);
router.post("/", ...adminOnly, uploadSingle('image'), validate(createMenuSchema), createMenu);
router.put("/:id", ...adminOnly, uploadSingle('image'), updateMenu);
router.delete("/:id", ...adminOnly, deleteMenu);

export default router;