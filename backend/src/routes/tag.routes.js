import express from "express";
import {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tag.controller.js";

const router = express.Router();

/* =========================
   TAG ROUTES
========================= */

// GET /tags - Get all tags (with optional filters)
router.get("/", getTags);

// GET /tags/:id - Get one tag
router.get("/:id", getTag);

// POST /tags - Create tag
router.post("/", createTag);

// PATCH /tags/:id - Update tag
router.patch("/:id", updateTag);

// DELETE /tags/:id - Delete tag
router.delete("/:id", deleteTag);

export default router;
