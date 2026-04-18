import { Router } from "express";

import {
  getReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
  getAvailableTables,
  getReservationById,
} from "../controllers/reservation.controller.js";

const router = Router();

/* ==============================
   BASE
============================== */

/**
 *  Obtener reservas
 * Query:
 * ?status=pending | confirmed | seated | completed | cancelled | no-show
 */
router.get("/", getReservations);

/**
 *  Obtener una reserva
 */
router.get("/:id", getReservationById);

/**
 *  Crear reserva
 */
router.post("/", createReservation);

/* ==============================
   FLOW
============================== */

/**
 *  Cambiar estado
 * body: { status }
 */
router.patch("/:id/status", updateReservationStatus);

/* ==============================
   UTILIDADES 
============================== */

/**
 *  Obtener mesas disponibles
 * Query:
 * ?startTime=ISO
 * ?endTime=ISO
 * ?guests=number
 */
router.get("/available/tables", getAvailableTables);

/* ==============================
   DELETE
============================== */

/**
 *  Eliminar reserva
 */
router.delete("/:id", deleteReservation);

export default router;