import { Router } from "express";

import {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,

  openTable,
  closeTable,
  assignOrderToTable,
  getTableOrders,


  addTableTag,
  removeTableTag,
  clearTableTags,
} from "../controllers/table.controller.js";

const router = Router();

/* ==============================
   BASE
============================== */

/**
 *  Obtener mesas
 * Query:
 * ?status=available | occupied | reserved
 * ?location=indoor | outdoor | bar
 */
router.get("/", getTables);

/**
 *  Obtener una mesa
 */
router.get("/:id", getTableById);

/* ==============================
   GESTIÓN
============================== */

/**
 *  Crear mesa
 */
router.post("/", createTable);

/**
 *  Actualizar mesa
 */
router.put("/:id", updateTable);

/**
 *  Eliminar mesa
 */
router.delete("/:id", deleteTable);

/* ==============================
   OPERACIONES (CORE)
============================== */

/**
 *  Abrir mesa
 */
router.patch("/:id/open", openTable);

/**
 *  Cerrar mesa
 */
router.patch("/:id/close", closeTable);

/**
 *  Asignar orden
 */
router.post("/:id/orders", assignOrderToTable);

/**
 *  Obtener órdenes
 */
router.get("/:id/orders", getTableOrders);

/* ==============================
   TAGS 
============================== */

/**
 *  Agregar tag
 * body: { label, type, priority }
 */
router.post("/:id/tags", addTableTag);

/**
 *  Eliminar tag (por label)
 */
router.delete("/:id/tags/:label", removeTableTag);

/**
 *  Limpiar todos los tags
 */
router.delete("/:id/tags", clearTableTags);

export default router;