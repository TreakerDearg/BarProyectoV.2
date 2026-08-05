import express from "express";
import {
  getTechniques,
  getTechnique,
  createTechnique,
  updateTechnique,
  deleteTechnique,
} from "../controllers/technique.controller";

const router = express.Router();

/* =========================
   TECHNIQUE ROUTES
========================= */

// GET /techniques - Get all techniques (with optional filters)
router.get("/", getTechniques);

// GET /techniques/:id - Get one technique
router.get("/:id", getTechnique);

// POST /techniques - Create technique
router.post("/", createTechnique);

// PATCH /techniques/:id - Update technique
router.patch("/:id", updateTechnique);

// DELETE /techniques/:id - Delete technique
router.delete("/:id", deleteTechnique);

export default router;
