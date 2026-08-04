/**
 * WORKSPACE ROUTES
 * Rutas para el Smart Workspace
 */

import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getWorkspace,
  getWorkspaceNavigation,
  getWorkspaceWidgets,
  getWorkspaceFeatures,
} from "../controllers/workspace.controller.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

/**
 * @route   GET /workspace
 * @desc    Obtiene el Workspace completo
 * @access  Private
 */
router.get("/", getWorkspace);

/**
 * @route   GET /workspace/navigation
 * @desc    Obtiene solo la navegación
 * @access  Private
 */
router.get("/navigation", getWorkspaceNavigation);

/**
 * @route   GET /workspace/widgets
 * @desc    Obtiene solo los widgets
 * @access  Private
 */
router.get("/widgets", getWorkspaceWidgets);

/**
 * @route   GET /workspace/features
 * @desc    Obtiene solo las funcionalidades
 * @access  Private
 */
router.get("/features", getWorkspaceFeatures);

export default router;
