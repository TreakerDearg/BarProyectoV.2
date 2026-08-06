import express from "express";
import {
  getDecorations,
  getDecoration,
  createDecoration,
  updateDecoration,
  deleteDecoration,
} from "../controllers/decoration.controller.js";

const router = express.Router();

/* =========================
   DECORATION ROUTES
========================= */

// GET /decorations - Get all decorations (with optional filters)
router.get("/", getDecorations);

// GET /decorations/:id - Get one decoration
router.get("/:id", getDecoration);

// POST /decorations - Create decoration
router.post("/", createDecoration);

// PATCH /decorations/:id - Update decoration
router.patch("/:id", updateDecoration);

// DELETE /decorations/:id - Delete decoration
router.delete("/:id", deleteDecoration);

export default router;
