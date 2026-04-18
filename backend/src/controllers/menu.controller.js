import Menu from "../models/Menu.js";
import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import mongoose from "mongoose";

/* ==============================
   HELPER: CHECK AVAILABILITY
============================== */
const checkAvailability = (recipe, inventoryMap) => {
  if (!recipe) return false;

  for (const ing of recipe.ingredients) {
    const item = inventoryMap[ing.inventoryItem?.toString()];
    if (!item || item.stock < ing.quantity) {
      return false;
    }
  }

  return true;
};

/* ==============================
   GET MENUS (ADMIN)
============================== */
export const getMenus = async (req, res) => {
  try {
    const { type, active } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (active !== undefined) filter.active = active === "true";

    const menus = await Menu.find(filter)
      .populate("categories.products.product")
      .sort({ createdAt: -1 });

    res.json(menus);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET PUBLIC MENU ( INTELIGENTE)
============================== */
export const getPublicMenu = async (req, res) => {
  try {
    const { type, hideUnavailable = "false" } = req.query;

    const filter = {
      active: true,
      isPublic: true,
    };

    if (type) filter.type = type;

    let menus = await Menu.find(filter)
      .populate("categories.products.product");

    //  1. Obtener todos los productIds
    const productIds = [];

    menus.forEach(menu => {
      menu.categories.forEach(cat => {
        cat.products.forEach(p => {
          productIds.push(p.product?._id);
        });
      });
    });

    //  2. Traer recetas
    const recipes = await Recipe.find({
      product: { $in: productIds },
    });

    const recipeMap = {};
    recipes.forEach(r => {
      recipeMap[r.product.toString()] = r;
    });

    //  3. Traer inventario
    const ingredientIds = recipes.flatMap(r =>
      r.ingredients.map(i => i.inventoryItem)
    );

    const inventoryItems = await InventoryItem.find({
      _id: { $in: ingredientIds },
    });

    const inventoryMap = {};
    inventoryItems.forEach(i => {
      inventoryMap[i._id.toString()] = i;
    });

    //  4. Procesar disponibilidad
    const result = menus.map(menu => {
      const m = menu.toObject();

      m.categories = m.categories.map(cat => {
        let products = cat.products.map(p => {
          const productId = p.product?._id?.toString();
          const recipe = recipeMap[productId];

          const available =
            p.available &&
            checkAvailability(recipe, inventoryMap);

          return {
            ...p,
            available,
          };
        });

        //  ocultar si se pide
        if (hideUnavailable === "true") {
          products = products.filter(p => p.available);
        }

        return {
          ...cat,
          products,
        };
      });

      return m;
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET ONE MENU
============================== */
export const getMenuById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const menu = await Menu.findById(req.params.id)
      .populate("categories.products.product");

    if (!menu) {
      return res.status(404).json({
        error: "Menú no encontrado",
      });
    }

    res.json(menu);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   CREATE MENU
============================== */
export const createMenu = async (req, res) => {
  try {
    const { name, categories } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "El nombre es obligatorio",
      });
    }

    if (categories && !Array.isArray(categories)) {
      return res.status(400).json({
        error: "Categorías inválidas",
      });
    }

    const menu = new Menu(req.body);

    const saved = await menu.save();

    const populated = await saved.populate(
      "categories.products.product"
    );

    res.status(201).json(populated);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   UPDATE MENU
============================== */
export const updateMenu = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const allowedFields = [
      "name",
      "description",
      "categories",
      "active",
      "type",
      "isPublic",
    ];

    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updated = await Menu.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate("categories.products.product");

    if (!updated) {
      return res.status(404).json({
        error: "Menú no encontrado",
      });
    }

    res.json(updated);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   DELETE MENU
============================== */
export const deleteMenu = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const deleted = await Menu.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        error: "Menú no encontrado",
      });
    }

    res.json({ message: "Menú eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};