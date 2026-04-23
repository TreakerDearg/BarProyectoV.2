import { Router } from "express";

import {
  getReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
  getAvailableTables,
  getReservationById,
} from "../controllers/reservation.controller.js";

import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.get("/available/tables", asyncHandler(getAvailableTables));

router.get("/", asyncHandler(getReservations));
router.get("/:id", asyncHandler(getReservationById));

router.post("/", asyncHandler(createReservation));

router.patch("/:id/status", asyncHandler(updateReservationStatus));

router.delete("/:id", asyncHandler(deleteReservation));

export default router;