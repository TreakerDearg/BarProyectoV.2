import express from "express";
import {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../controllers/collection.controller";

const router = express.Router();

/* =========================
   COLLECTION ROUTES
========================= */

// GET /collections - Get all collections (with optional filters)
router.get("/", getCollections);

// GET /collections/:id - Get one collection
router.get("/:id", getCollection);

// POST /collections - Create collection
router.post("/", createCollection);

// PATCH /collections/:id - Update collection
router.patch("/:id", updateCollection);

// DELETE /collections/:id - Delete collection
router.delete("/:id", deleteCollection);

export default router;
