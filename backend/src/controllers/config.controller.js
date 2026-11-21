import SystemConfig from "../models/SystemConfig.js";
import Product from "../models/Product.js";
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
    if (updates.homeFeatured) {
      config.homeFeatured = { ...config.homeFeatured?.toObject?.() || {}, ...updates.homeFeatured };
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

/**
 * Obtiene los productos destacados configurados para la página de inicio (Público).
 */
export const getHomeFeatured = async (req, res, next) => {
  try {
    let config = await SystemConfig.findOne()
      .populate({
        path: "homeFeatured.productIds",
        select: "name price cost category type description image rating isAvailable available featured",
      })
      .lean();

    if (!config) {
      config = await SystemConfig.create({});
    }

    const homeFeatured = config.homeFeatured || {
      headline: "Selección de la Casa",
      subtitle: "Cócteles insignia y creaciones culinarias curadas por nuestro equipo.",
      badge: "Destacados de Barra & Cocina",
      maxItems: 6,
      productIds: [],
    };

    let populatedProducts = (homeFeatured.productIds || []).filter(Boolean);

    // Fallback: si no hay productos configurados o hay menos de 2, buscar automáticamente
    if (populatedProducts.length < 2) {
      const fallbackProducts = await Product.find({
        $or: [{ isAvailable: true }, { available: true }],
      })
        .sort({ featured: -1, rating: -1, createdAt: -1 })
        .limit(homeFeatured.maxItems || 6)
        .select("name price cost category type description image rating isAvailable available featured")
        .lean();

      populatedProducts = fallbackProducts;
    }

    const normalizedProducts = populatedProducts.map((p) => ({
      id: String(p._id || p.id),
      _id: p._id,
      name: p.name,
      price: p.price ?? 0,
      dynamicPrice: p.price ?? 0,
      cost: p.cost ?? 0,
      category: p.category ?? "General",
      type: p.type ?? "drink",
      description: p.description ?? "",
      image: p.image ?? "",
      rating: p.rating ?? 5,
      isAvailable: p.isAvailable ?? p.available ?? true,
      available: p.available ?? p.isAvailable ?? true,
      featured: p.featured ?? true,
    }));

    return ok(res, {
      headline: homeFeatured.headline || "Nuestra Selección de Autor",
      subtitle: homeFeatured.subtitle || "Las creaciones y platos más aclamados de nuestra barra y cocina",
      badge: homeFeatured.badge || "Recomendados de la Casa",
      maxItems: homeFeatured.maxItems || 6,
      productIds: (homeFeatured.productIds || []).map((p) => String(p._id || p)),
      products: normalizedProducts,
    }, "Destacados de inicio obtenidos correctamente");
  } catch (error) {
    logger.error("[Config] Error al obtener destacados de inicio:", error);
    next(error);
  }
};

/**
 * Actualiza la selección de destacados de la página de inicio (Admin/Manager).
 */
export const updateHomeFeatured = async (req, res, next) => {
  try {
    const { headline, subtitle, badge, maxItems, productIds } = req.body;

    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }

    if (!config.homeFeatured) {
      config.homeFeatured = {};
    }

    if (headline !== undefined) config.homeFeatured.headline = String(headline).trim();
    if (subtitle !== undefined) config.homeFeatured.subtitle = String(subtitle).trim();
    if (badge !== undefined) config.homeFeatured.badge = String(badge).trim();
    if (maxItems !== undefined) {
      const limit = Math.min(8, Math.max(2, Number(maxItems) || 6));
      config.homeFeatured.maxItems = limit;
    }

    if (Array.isArray(productIds)) {
      const limit = config.homeFeatured.maxItems || 6;
      config.homeFeatured.productIds = productIds.slice(0, limit);
    }

    config.updatedBy = req.user?.id || null;
    await config.save();

    logger.info(`[Config] Destacados de inicio actualizados por usuario ${req.user?.id}`);
    return ok(res, config.homeFeatured, "Destacados de inicio actualizados correctamente");
  } catch (error) {
    logger.error("[Config] Error al actualizar destacados de inicio:", error);
    next(error);
  }
};
