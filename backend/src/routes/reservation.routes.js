import { Router } from "express";
import {
  getReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
} from "../controllers/reservation.controller.js";

const router = Router();

router.get("/", getReservations);
router.post("/", createReservation);
router.patch("/:id/status", updateReservationStatus);
router.delete("/:id", deleteReservation);

export default router;