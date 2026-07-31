/**
 * ECOSYSTEM CONTROLLER
 * Endpoints para gestionar el ecosistema Bartender
 */

import { logger } from "../config/logger.js";
import {
  ok, unauthorized, forbidden, badRequest, serverError,
} from "../utils/response.js";
import ecosystemService from "../ecosystem/EcosystemService.js";

/**
 * GET /ecosystem/state
 * Obtiene el estado completo del ecosistema para el usuario autenticado
 */
export const getEcosystemState = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const state = await ecosystemService.getUserEcosystemState(userId);
    
    logger.info(`[Ecosystem] Estado obtenido para usuario ${userId}`);
    
    return ok(res, state, "Estado del ecosistema obtenido exitosamente");
    
  } catch (error) {
    logger.error("[Ecosystem] Error en getEcosystemState:", error);
    return serverError(res, "Error al obtener estado del ecosistema");
  }
};

/**
 * GET /ecosystem/sessions
 * Obtiene todas las sesiones activas del usuario
 */
export const getUserSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const sessions = await ecosystemService.getUserSessions(userId);
    
    return ok(res, sessions, "Sesiones obtenidas exitosamente");
    
  } catch (error) {
    logger.error("[Ecosystem] Error en getUserSessions:", error);
    return serverError(res, "Error al obtener sesiones");
  }
};

/**
 * GET /ecosystem/devices
 * Obtiene todos los dispositivos del usuario
 */
export const getUserDevices = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const devices = await ecosystemService.getUserDevices(userId);
    
    return ok(res, devices, "Dispositivos obtenidos exitosamente");
    
  } catch (error) {
    logger.error("[Ecosystem] Error en getUserDevices:", error);
    return serverError(res, "Error al obtener dispositivos");
  }
};

/**
 * GET /ecosystem/devices/stats
 * Obtiene estadísticas de dispositivos del usuario
 */
export const getUserDeviceStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const stats = await ecosystemService.getUserDeviceStats(userId);
    
    return ok(res, stats, "Estadísticas de dispositivos obtenidas exitosamente");
    
  } catch (error) {
    logger.error("[Ecosystem] Error en getUserDeviceStats:", error);
    return serverError(res, "Error al obtener estadísticas de dispositivos");
  }
};

/**
 * POST /ecosystem/sessions/:sessionId/close
 * Cierra una sesión específica
 */
export const closeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body || {};
    
    await ecosystemService.closeSession(userId, sessionId, reason || 'user_action');
    
    logger.info(`[Ecosystem] Sesión cerrada: ${sessionId} por usuario ${userId}`);
    
    return ok(res, { sessionId }, "Sesión cerrada exitosamente");
    
  } catch (error) {
    logger.error("[Ecosystem] Error en closeSession:", error);
    return serverError(res, "Error al cerrar sesión");
  }
};

/**
 * POST /ecosystem/sessions/close-all
 * Cierra todas las sesiones del usuario
 */
export const closeAllSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body || {};
    
    await ecosystemService.closeAllSessions(userId, reason || 'global_logout');
    
    logger.info(`[Ecosystem] Todas las sesiones cerradas para usuario ${userId}`);
    
    return ok(res, { success: true }, "Todas las sesiones cerradas exitosamente");
    
  } catch (error) {
    logger.error("[Ecosystem] Error en closeAllSessions:", error);
    return serverError(res, "Error al cerrar todas las sesiones");
  }
};

/**
 * POST /ecosystem/sessions/close-others
 * Cierra todas las sesiones excepto la actual
 */
export const closeAllOtherSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentSessionId, reason } = req.body;
    
    if (!currentSessionId) {
      return badRequest(res, "currentSessionId es requerido");
    }
    
    await ecosystemService.closeAllOtherSessions(userId, currentSessionId, reason || 'global_logout');
    
    logger.info(`[Ecosystem] Otras sesiones cerradas para usuario ${userId}`);
    
    return ok(res, { success: true }, "Otras sesiones cerradas exitosamente");
    
  } catch (error) {
    logger.error("[Ecosystem] Error en closeAllOtherSessions:", error);
    return serverError(res, "Error al cerrar otras sesiones");
  }
};

/**
 * GET /ecosystem/online-users
 * Obtiene todos los usuarios online (solo administradores)
 */
export const getOnlineUsers = async (req, res, next) => {
  try {
    // Solo administradores pueden ver usuarios online
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return forbidden(res, "No tienes permiso para ver usuarios online");
    }
    
    const users = ecosystemService.getOnlineUsersList();
    
    return ok(res, users, "Usuarios online obtenidos exitosamente");
    
  } catch (error) {
    logger.error("[Ecosystem] Error en getOnlineUsers:", error);
    return serverError(res, "Error al obtener usuarios online");
  }
};

/**
 * GET /ecosystem/stats
 * Obtiene estadísticas del ecosistema (solo administradores)
 */
export const getEcosystemStats = async (req, res, next) => {
  try {
    // Solo administradores pueden ver estadísticas
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return forbidden(res, "No tienes permiso para ver estadísticas");
    }
    
    const stats = await ecosystemService.getEcosystemStats();
    
    return ok(res, stats, "Estadísticas del ecosistema obtenidas exitosamente");
    
  } catch (error) {
    logger.error("[Ecosystem] Error en getEcosystemStats:", error);
    return serverError(res, "Error al obtener estadísticas");
  }
};
