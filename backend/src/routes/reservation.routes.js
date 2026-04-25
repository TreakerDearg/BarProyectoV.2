import { Router } from "express";
import {
  getReservations, createReservation, updateReservationStatus,
  deleteReservation, getAvailableTables, getReservationById
} from "../controllers/reservation.controller.js";
import { validate } from "../middlewares/validate.js";
import { createReservationSchema } from "../utils/schemas.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const adminOnly = [protect, authorizeRoles("admin", "manager")];

/* =========================================================
   PUBLIC / CLIENT FLOW
========================================================= */
// Buscar disponibilidad no requiere login
router.get("/available/tables", getAvailableTables);

// Crear reserva desde la web/app podría ser público o de client, por ahora sin protect
router.post("/", validate(createReservationSchema), createReservation);

/* =========================================================
   ADMIN FLOW
========================================================= */
router.get("/", ...adminOnly, getReservations);
router.get("/:id", ...adminOnly, getReservationById);

router.patch("/:id/status", ...adminOnly, updateReservationStatus);
router.delete("/:id", ...adminOnly, deleteReservation);

export default router;