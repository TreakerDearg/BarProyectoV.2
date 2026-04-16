import { Router } from "express";
import {
  getRoulette,
  saveRoulette,
} from "../controllers/roulette.controller.js";

const router = Router();

router.get("/", getRoulette);
router.post("/", saveRoulette);

export default router;