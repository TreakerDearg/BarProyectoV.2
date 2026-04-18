import { Router } from "express";

import {
  getMenus,
  getMenuById,
  getPublicMenu,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../controllers/menu.controller.js";

const router = Router();

/* ==============================
   PUBLIC ROUTES (CLIENT SIDE)
============================== */

/**
 *  Menú público inteligente
 * - Aplica stock dinámico
 * - Puede ocultar productos sin stock
 *
 * Query:
 * ?type=drink | food | mixed
 * ?hideUnavailable=true
 */
router.get("/public", getPublicMenu);

/* ==============================
   ADMIN ROUTES
============================== */

/**
 *  Obtener todos los menús
 * Query:
 * ?type=drink
 * ?active=true
 */
router.get("/", getMenus);

/**
 * 🔍Obtener un menú por ID
 */
router.get("/:id", getMenuById);

/**
 * ➕ Crear menú
 */
router.post("/", createMenu);

/**
 *  Actualizar menú
 */
router.put("/:id", updateMenu);

/**
 *  Eliminar menú
 */
router.delete("/:id", deleteMenu);

export default router;