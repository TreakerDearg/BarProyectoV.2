import { Router } from "express";
import {
  getTables, getTableById, createTable, updateTable, deleteTable,
  openTable, closeTable, addTableTag, removeTableTag, clearTableTags
} from "../controllers/table.controller.js";
import { validate } from "../middlewares/validate.js";
import { createTableSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   READ ROUTES
========================================================= */
router.get("/", getTables);
router.get("/:id", getTableById);

/* =========================================================
   POS FLOW (abrir/cerrar mesa)
========================================================= */
// En el futuro, protect y validar roles de POS
router.post("/:id/open", openTable);
router.post("/:id/close", closeTable);

/* =========================================================
   CRUD TABLES (ADMIN ONLY)
========================================================= */
router.post("/", ...adminOnly, validate(createTableSchema), createTable);
router.put("/:id", ...adminOnly, updateTable);
router.delete("/:id", ...adminOnly, deleteTable);

/* =========================================================
   TAGS
========================================================= */
router.post("/:id/tags", addTableTag);
router.delete("/:id/tags/:label", removeTableTag);
router.delete("/:id/tags", clearTableTags);

export default router;