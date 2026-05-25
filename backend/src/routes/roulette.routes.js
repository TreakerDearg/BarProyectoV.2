import { Router } from "express";
import {
  getRouletteDrinks,
  getPublicRouletteDrinks,
  createRouletteDrink,
  updateRouletteDrink,
  deleteRouletteDrink,
  spinRoulette,
  batchUpdateRouletteDrinks,
  simulateRoulette,
} from "../controllers/roulette.controller.js";
import {
  getAllUserRouletteStats,
  getMyRouletteStats,
  getRouletteConfigEndpoint,
  updateRouletteConfigEndpoint,
} from "../controllers/userRouletteStats.controller.js";
import { getRouletteLogs, getRouletteAnalytics } from "../controllers/rouletteLog.controller.js";
import { validate } from "../middlewares/validate.js";
import { createRouletteDrinkSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   PUBLIC / CLIENT / EMPLOYEE FLOW
========================================================= */
router.get("/public", getPublicRouletteDrinks);
router.post("/public/spin", spinRoulette);
router.post("/spin", protect, spinRoulette);
router.get("/my-stats", protect, getMyRouletteStats);

/* =========================================================
   ADMIN FLOW
========================================================= */
router.get("/", ...adminOnly, getRouletteDrinks);
router.get("/logs", ...adminOnly, getRouletteLogs);
router.get("/analytics", ...adminOnly, getRouletteAnalytics);

router.post("/simulate", ...adminOnly, simulateRoulette);
router.get("/config", ...adminOnly, getRouletteConfigEndpoint);
router.put("/config", ...adminOnly, updateRouletteConfigEndpoint);
router.get("/employees-stats", ...adminOnly, getAllUserRouletteStats);

router.post("/", ...adminOnly, validate(createRouletteDrinkSchema), createRouletteDrink);
router.patch("/:id", ...adminOnly, updateRouletteDrink);
router.delete("/:id", ...adminOnly, deleteRouletteDrink);
router.patch("/batch", ...adminOnly, batchUpdateRouletteDrinks);

export default router;