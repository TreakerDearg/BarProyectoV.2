/**
 * ECOSYSTEM ROUTES
 * Rutas para el Bartender Identity Ecosystem
 */

import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getEcosystemState,
  getUserSessions,
  getUserDevices,
  getUserDeviceStats,
  closeSession,
  closeAllSessions,
  closeAllOtherSessions,
  getOnlineUsers,
  getEcosystemStats,
} from "../controllers/ecosystem.controller.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

/**
 * @route   GET /ecosystem/state
 * @desc    Obtiene el estado completo del ecosistema
 * @access  Private
 */
router.get("/state", getEcosystemState);

/**
 * @route   GET /ecosystem/sessions
 * @desc    Obtiene todas las sesiones activas del usuario
 * @access  Private
 */
router.get("/sessions", getUserSessions);

/**
 * @route   GET /ecosystem/devices
 * @desc    Obtiene todos los dispositivos del usuario
 * @access  Private
 */
router.get("/devices", getUserDevices);

/**
 * @route   GET /ecosystem/devices/stats
 * @desc    Obtiene estadísticas de dispositivos del usuario
 * @access  Private
 */
router.get("/devices/stats", getUserDeviceStats);

/**
 * @route   POST /ecosystem/sessions/:sessionId/close
 * @desc    Cierra una sesión específica
 * @access  Private
 */
router.post("/sessions/:sessionId/close", closeSession);

/**
 * @route   POST /ecosystem/sessions/close-all
 * @desc    Cierra todas las sesiones del usuario
 * @access  Private
 */
router.post("/sessions/close-all", closeAllSessions);

/**
 * @route   POST /ecosystem/sessions/close-others
 * @desc    Cierra todas las sesiones excepto la actual
 * @access  Private
 */
router.post("/sessions/close-others", closeAllOtherSessions);

/**
 * @route   GET /ecosystem/online-users
 * @desc    Obtiene todos los usuarios online (solo admins)
 * @access  Private (Admin/Owner)
 */
router.get("/online-users", getOnlineUsers);

/**
 * @route   GET /ecosystem/stats
 * @desc    Obtiene estadísticas del ecosistema (solo admins)
 * @access  Private (Admin/Owner)
 */
router.get("/stats", getEcosystemStats);

export default router;
