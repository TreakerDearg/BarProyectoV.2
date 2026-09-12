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
  getRoulettedrinkRecipe,
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
   PUBLIC / CLIENT FLOW
========================================================= */
router.get("/public",       getPublicRouletteDrinks);   // includes recipe data
router.post("/public/spin", spinRoulette);               // unauthenticated spin
router.post("/spin",        protect, spinRoulette);      // authenticated spin (pity system)
router.get("/my-stats",     protect, getMyRouletteStats);

/* =========================================================
   ADMIN FLOW — strictly ordered so /batch doesn't clash with /:id
========================================================= */
router.get("/",               ...adminOnly, getRouletteDrinks);
router.get("/logs",           ...adminOnly, getRouletteLogs);
router.get("/analytics",      ...adminOnly, getRouletteAnalytics);
router.post("/simulate",      ...adminOnly, simulateRoulette);
router.get("/config",         ...adminOnly, getRouletteConfigEndpoint);
router.put("/config",         ...adminOnly, updateRouletteConfigEndpoint);
router.get("/employees-stats",...adminOnly, getAllUserRouletteStats);

// Must come BEFORE /:id routes to avoid Express matching "batch" as an id
router.patch("/batch",        ...adminOnly, batchUpdateRouletteDrinks);

router.post("/",              ...adminOnly, validate(createRouletteDrinkSchema), createRouletteDrink);
router.patch("/:id",          ...adminOnly, updateRouletteDrink);
router.delete("/:id",         ...adminOnly, deleteRouletteDrink);
router.get("/:id/recipe",     ...adminOnly, getRoulettedrinkRecipe);

export default router;