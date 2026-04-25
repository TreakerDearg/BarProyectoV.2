import { Router } from "express";
import {
  getRouletteDrinks, createRouletteDrink, updateRouletteDrink,
  deleteRouletteDrink, spinRoulette
} from "../controllers/roulette.controller.js";
import { getRouletteLogs } from "../controllers/rouletteLog.controller.js";
import { validate } from "../middlewares/validate.js";
import { createRouletteDrinkSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   PUBLIC / CLIENT FLOW (requiere auth base)
========================================================= */
router.post("/spin", protect, spinRoulette);

/* =========================================================
   ADMIN FLOW
========================================================= */
router.get("/", ...adminOnly, getRouletteDrinks);
router.get("/logs", ...adminOnly, getRouletteLogs);

router.post("/", ...adminOnly, validate(createRouletteDrinkSchema), createRouletteDrink);
router.patch("/:id", ...adminOnly, updateRouletteDrink);
router.delete("/:id", ...adminOnly, deleteRouletteDrink);

export default router;