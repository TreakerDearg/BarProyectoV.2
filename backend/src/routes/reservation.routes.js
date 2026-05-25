import { Router } from "express";
import {
  getReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
  getAvailableTables,
  getReservationById,
  checkAvailability,
  cleanupExpiredReservations,
  getAvailabilityHeatmap,
  updateReservation,
} from "../controllers/reservation.controller.js";
import { validate } from "../middlewares/validate.js";
import { createReservationSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   PUBLIC / CLIENT FLOW (rutas estáticas primero)
========================================================= */
router.get("/available/tables", getAvailableTables);
router.get("/check-availability", checkAvailability);
router.get("/availability-heatmap", getAvailabilityHeatmap);

router.post("/", validate(createReservationSchema), createReservation);

/* =========================================================
   ADMIN FLOW
========================================================= */
router.get("/", ...adminOnly, getReservations);
router.post("/cleanup-expired", ...adminOnly, cleanupExpiredReservations);

router.get("/:id", ...adminOnly, getReservationById);
router.patch("/:id/status", ...adminOnly, updateReservationStatus);
router.put("/:id", ...adminOnly, updateReservation);
router.delete("/:id", ...adminOnly, deleteReservation);

export default router;
