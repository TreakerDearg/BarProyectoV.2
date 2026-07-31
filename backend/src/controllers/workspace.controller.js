/**
 * WORKSPACE CONTROLLER
 * Endpoints para obtener el Workspace dinámico
 */

import User from "../models/User.js";
import { resolveWorkspace } from "../workspace/WorkspaceResolver.js";
import { executeIdentityDecision } from "../identity/decision/IdentityDecisionEngine.js";
import { logger } from "../config/logger.js";
import {
  ok, unauthorized, forbidden, serverError,
} from "../utils/response.js";

/**
 * GET /workspace
 * Obtiene el Workspace completo para el usuario autenticado
 */
export const getWorkspace = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const platform = req.headers['x-platform'] || 'web';
    
    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return unauthorized(res, "Usuario no encontrado");
    }
    
    // Ejecutar Identity Decision Engine
    const identityResponse = await executeIdentityDecision(user, {
      platform,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    
    // Verificar si el usuario puede acceder
    if (!identityResponse.canAccess) {
      return forbidden(res, identityResponse.blockMessage?.message || "No puedes acceder en este momento");
    }
    
    // Resolver Workspace
    const context = {
      platform,
      customization: user.customization || {},
      branchId: user.branchId || null,
    };
    
    const workspace = resolveWorkspace(identityResponse, context);
    
    logger.info(`[Workspace] Workspace generado para usuario ${user.email} (${user.role})`);
    
    return ok(res, workspace, "Workspace generado exitosamente");
    
  } catch (error) {
    logger.error("[Workspace] Error en getWorkspace:", error);
    return serverError(res, "Error al generar workspace");
  }
};

/**
 * GET /workspace/navigation
 * Obtiene solo la navegación del Workspace
 */
export const getWorkspaceNavigation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const platform = req.headers['x-platform'] || 'web';
    
    const user = await User.findById(userId);
    if (!user) {
      return unauthorized(res, "Usuario no encontrado");
    }
    
    const identityResponse = await executeIdentityDecision(user, { platform });
    
    if (!identityResponse.canAccess) {
      return forbidden(res, "No puedes acceder en este momento");
    }
    
    const workspace = resolveWorkspace(identityResponse, { platform });
    
    return ok(res, {
      navigation: workspace.navigation,
      shortcuts: workspace.shortcuts,
    }, "Navegación generada exitosamente");
    
  } catch (error) {
    logger.error("[Workspace] Error en getWorkspaceNavigation:", error);
    return serverError(res, "Error al generar navegación");
  }
};

/**
 * GET /workspace/widgets
 * Obtiene solo los widgets del Workspace
 */
export const getWorkspaceWidgets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const platform = req.headers['x-platform'] || 'web';
    
    const user = await User.findById(userId);
    if (!user) {
      return unauthorized(res, "Usuario no encontrado");
    }
    
    const identityResponse = await executeIdentityDecision(user, { platform });
    
    if (!identityResponse.canAccess) {
      return forbidden(res, "No puedes acceder en este momento");
    }
    
    const workspace = resolveWorkspace(identityResponse, { platform });
    
    return ok(res, {
      widgets: workspace.widgets,
      landingPage: workspace.landingPage,
    }, "Widgets generados exitosamente");
    
  } catch (error) {
    logger.error("[Workspace] Error en getWorkspaceWidgets:", error);
    return serverError(res, "Error al generar widgets");
  }
};

/**
 * GET /workspace/features
 * Obtiene solo las funcionalidades del Workspace
 */
export const getWorkspaceFeatures = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const platform = req.headers['x-platform'] || 'web';
    
    const user = await User.findById(userId);
    if (!user) {
      return unauthorized(res, "Usuario no encontrado");
    }
    
    const identityResponse = await executeIdentityDecision(user, { platform });
    
    if (!identityResponse.canAccess) {
      return forbidden(res, "No puedes acceder en este momento");
    }
    
    const workspace = resolveWorkspace(identityResponse, { platform });
    
    return ok(res, {
      features: workspace.features,
      permissions: workspace.permissions,
    }, "Funcionalidades generadas exitosamente");
    
  } catch (error) {
    logger.error("[Workspace] Error en getWorkspaceFeatures:", error);
    return serverError(res, "Error al generar funcionalidades");
  }
};
