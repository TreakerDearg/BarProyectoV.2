import Menu from "../models/Menu.js";
import Product from "../models/Product.js";
import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import Reward from "../models/Reward.js";
import Table from "../models/Table.js";
import Discount from "../models/Discount.js";
import Promotion from "../models/Promotion.js";
import SystemConfig from "../models/SystemConfig.js";
import { ok, badRequest } from "../utils/response.js";
import { logger } from "../config/logger.js";

/**
 * Exporta un snapshot completo descargable en formato JSON.
 */
export const exportDatabaseBackup = async (req, res, next) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `nebula-backup-${timestamp}.json`;

    const [
      menus,
      products,
      recipes,
      inventory,
      rewards,
      tables,
      discounts,
      promotions,
      config,
    ] = await Promise.all([
      Menu.find().lean(),
      Product.find().lean(),
      Recipe.find().lean(),
      InventoryItem.find().lean(),
      Reward.find().lean(),
      Table.find().lean(),
      Discount.find().lean(),
      Promotion.find().lean(),
      SystemConfig.findOne().lean(),
    ]);

    const backupData = {
      version: "3.0.0",
      system: "Bartender Nebula Control Center",
      exportedAt: new Date().toISOString(),
      exportedBy: req.user?.name || req.user?.email || "Admin",
      stats: {
        menusCount: menus.length,
        productsCount: products.length,
        recipesCount: recipes.length,
        inventoryCount: inventory.length,
        rewardsCount: rewards.length,
        tablesCount: tables.length,
        discountsCount: discounts.length,
        promotionsCount: promotions.length,
      },
      data: {
        config: config || {},
        menus,
        products,
        recipes,
        inventory,
        rewards,
        tables,
        discounts,
        promotions,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", Buffer.byteLength(jsonString));

    logger.info(`[Backup] Respaldo exportado exitosamente: ${filename}`);
    return res.send(jsonString);
  } catch (error) {
    logger.error("[Backup] Error al exportar respaldo:", error);
    next(error);
  }
};

/**
 * Obtiene métricas del estado de los datos del sistema para el panel de respaldos.
 */
export const getBackupStats = async (req, res, next) => {
  try {
    const [
      menusCount,
      productsCount,
      recipesCount,
      inventoryCount,
      rewardsCount,
      tablesCount,
    ] = await Promise.all([
      Menu.countDocuments(),
      Product.countDocuments(),
      Recipe.countDocuments(),
      InventoryItem.countDocuments(),
      Reward.countDocuments(),
      Table.countDocuments(),
    ]);

    const totalRecords =
      menusCount + productsCount + recipesCount + inventoryCount + rewardsCount + tablesCount;

    return ok(res, {
      totalRecords,
      breakdown: {
        menus: menusCount,
        products: productsCount,
        recipes: recipesCount,
        inventory: inventoryCount,
        rewards: rewardsCount,
        tables: tablesCount,
      },
      lastGeneratedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[Backup] Error al obtener estadísticas de respaldo:", error);
    next(error);
  }
};

/**
 * Restaura el catálogo desde un snapshot JSON.
 */
export const restoreDatabaseBackup = async (req, res, next) => {
  try {
    const { backup } = req.body;
    if (!backup || !backup.data) {
      return badRequest(res, "Archivo de respaldo inválido o estructura dañada");
    }

    const { data } = backup;
    let restoredCounts = {
      menus: 0,
      products: 0,
      recipes: 0,
      inventory: 0,
      rewards: 0,
    };

    if (Array.isArray(data.menus) && data.menus.length > 0) {
      for (const item of data.menus) {
        await Menu.findByIdAndUpdate(item._id, item, { upsert: true, returnDocument: "after" });
      }
      restoredCounts.menus = data.menus.length;
    }

    if (Array.isArray(data.products) && data.products.length > 0) {
      for (const item of data.products) {
        await Product.findByIdAndUpdate(item._id, item, { upsert: true, returnDocument: "after" });
      }
      restoredCounts.products = data.products.length;
    }

    if (Array.isArray(data.recipes) && data.recipes.length > 0) {
      for (const item of data.recipes) {
        await Recipe.findByIdAndUpdate(item._id, item, { upsert: true, returnDocument: "after" });
      }
      restoredCounts.recipes = data.recipes.length;
    }

    if (Array.isArray(data.inventory) && data.inventory.length > 0) {
      for (const item of data.inventory) {
        await InventoryItem.findByIdAndUpdate(item._id, item, { upsert: true, returnDocument: "after" });
      }
      restoredCounts.inventory = data.inventory.length;
    }

    if (Array.isArray(data.rewards) && data.rewards.length > 0) {
      for (const item of data.rewards) {
        await Reward.findByIdAndUpdate(item._id, item, { upsert: true, returnDocument: "after" });
      }
      restoredCounts.rewards = data.rewards.length;
    }

    logger.info(`[Backup] Restauración completada por usuario ${req.user?.id}`, restoredCounts);
    return ok(res, restoredCounts, "Restauración completada exitosamente");
  } catch (error) {
    logger.error("[Backup] Error durante la restauración:", error);
    next(error);
  }
};
