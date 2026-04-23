import { Router } from "express";
import {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  openTable,
  closeTable,
  addTableTag,
  removeTableTag,
  clearTableTags,

} from "../controllers/table.controller.js";

import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();


/* ==============================
   TABLES
============================== */
router.get("/", asyncHandler(getTables));
router.get("/:id", asyncHandler(getTableById));

/* ==============================
   CRUD
============================== */
router.post("/", asyncHandler(createTable));
router.put("/:id", asyncHandler(updateTable));
router.delete("/:id", asyncHandler(deleteTable));

/* ==============================
   POS ACTIONS
============================== */
router.post("/:id/open", asyncHandler(openTable));
router.post("/:id/close", asyncHandler(closeTable));

/* ==============================
   TAGS
============================== */
router.post("/:id/tags", asyncHandler(addTableTag));
router.delete("/:id/tags/:label", asyncHandler(removeTableTag));
router.delete("/:id/tags", asyncHandler(clearTableTags));

export default router;