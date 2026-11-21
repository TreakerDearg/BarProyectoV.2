import SystemConfig from "../models/SystemConfig.js";
import { ok, badRequest } from "../utils/response.js";
import { logger } from "../config/logger.js";

/**
 * Obtiene la configuración activa del sistema.
 * Si no existe, crea un registro por defecto.
 */
export const getSystemConfig = async (req, res, next) => {
  try {
    let config = await SystemConfig.findOne().lean();
    if (!config) {
      config = await SystemConfig.create({});
    }
    return ok(res, config, "Configuración obtenida correctamente");
  } catch (error) {
    logger.error("[Config] Error al obtener configuración:", error);
    next(error);
  }
};

/**
 * Actualiza la configuración del sistema (solo administradores).
 */
export const updateSystemConfig = async (req, res, next) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== "object") {
      return badRequest(res, "Cuerpo de configuración inválido");
    }

    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }

    if (updates.business) {
      config.business = { ...config.business.toObject(), ...updates.business };
    }
    if (updates.pos) {
      config.pos = { ...config.pos.toObject(), ...updates.pos };
    }
    if (updates.loyalty) {
      config.loyalty = { ...config.loyalty.toObject(), ...updates.loyalty };
    }

    config.updatedBy = req.user?.id || null;
    await config.save();

    logger.info(`[Config] Configuración actualizada por usuario ${req.user?.id}`);
    return ok(res, config, "Configuración actualizada exitosamente");
  } catch (error) {
    logger.error("[Config] Error al actualizar configuración:", error);
    next(error);
  }
};
