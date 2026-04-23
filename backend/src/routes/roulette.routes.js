import { Router } from "express";
import {
  getRouletteDrinks,
  createRouletteDrink,
  updateRouletteDrink,
  deleteRouletteDrink,
  spinRoulette,
} from "../controllers/roulette.controller.js";

import {
  getRouletteLogs,
} from "../controllers/rouletteLog.controller.js";

const router = Router();

/* =========================
   ACTIONS (PRIMERO)
    evita conflictos con :id
========================= */
router.post("/spin", spinRoulette);

/* =========================
   LOGS
========================= */
router.get("/logs", getRouletteLogs);

/* =========================
   CRUD
========================= */
router.get("/", getRouletteDrinks);
router.post("/", createRouletteDrink);
router.patch("/:id", updateRouletteDrink);
router.delete("/:id", deleteRouletteDrink);

export default router;