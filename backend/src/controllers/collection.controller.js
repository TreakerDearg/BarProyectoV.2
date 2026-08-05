import Collection from "../models/Collection";

/* =========================
   GET ALL COLLECTIONS
========================= */
export const getCollections = async (req, res) => {
  try {
    const { isSystem, isActive } = req.query;

    const filter = {};
    if (isSystem !== undefined) filter.isSystem = isSystem === "true";
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const collections = await Collection.find(filter).sort({ isSystem: -1, name: 1 });

    res.json({
      success: true,
      data: collections,
      total: collections.length,
    });
  } catch (error) {
    console.error("[Collection] Error fetching collections:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar colecciones",
      error: error.message,
    });
  }
};

/* =========================
   GET ONE COLLECTION
========================= */
export const getCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Colección no encontrada",
      });
    }

    res.json({
      success: true,
      data: collection,
    });
  } catch (error) {
    console.error("[Collection] Error fetching collection:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar colección",
      error: error.message,
    });
  }
};

/* =========================
   CREATE COLLECTION
========================= */
export const createCollection = async (req, res) => {
  try {
    const { name, description, icon, color, tags, isSystem } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nombre es obligatorio",
      });
    }

    const collection = await Collection.create({
      name: name.trim(),
      description: description?.trim() || "",
      icon: icon || "📁",
      color: color || "#6366f1",
      tags: Array.isArray(tags) ? tags : [],
      isSystem: isSystem || false,
    });

    res.status(201).json({
      success: true,
      data: collection,
      message: "Colección creada exitosamente",
    });
  } catch (error) {
    console.error("[Collection] Error creating collection:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear colección",
      error: error.message,
    });
  }
};

/* =========================
   UPDATE COLLECTION
========================= */
export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, tags, recipeCount, isActive } = req.body;

    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Colección no encontrada",
      });
    }

    // Update fields
    if (name !== undefined) collection.name = name.trim();
    if (description !== undefined) collection.description = description.trim();
    if (icon !== undefined) collection.icon = icon;
    if (color !== undefined) collection.color = color;
    if (tags !== undefined) collection.tags = Array.isArray(tags) ? tags : [];
    if (recipeCount !== undefined) collection.recipeCount = Number(recipeCount);
    if (isActive !== undefined) collection.isActive = isActive;

    await collection.save();

    res.json({
      success: true,
      data: collection,
      message: "Colección actualizada exitosamente",
    });
  } catch (error) {
    console.error("[Collection] Error updating collection:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar colección",
      error: error.message,
    });
  }
};

/* =========================
   DELETE COLLECTION
========================= */
export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Colección no encontrada",
      });
    }

    if (collection.isSystem) {
      return res.status(400).json({
        success: false,
        message: "No se pueden eliminar colecciones del sistema",
      });
    }

    await Collection.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Colección eliminada exitosamente",
    });
  } catch (error) {
    console.error("[Collection] Error deleting collection:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar colección",
      error: error.message,
    });
  }
};
