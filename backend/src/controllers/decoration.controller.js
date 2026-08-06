import Decoration from "../models/Decoration.js";

/* =========================
   GET ALL DECORATIONS
========================= */
export const getDecorations = async (req, res) => {
  try {
    const { type, category, isActive } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const decorations = await Decoration.find(filter).sort({ type: 1, category: 1, name: 1 });

    res.json({
      success: true,
      data: decorations,
      total: decorations.length,
    });
  } catch (error) {
    console.error("[Decoration] Error fetching decorations:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar decoraciones",
      error: error.message,
    });
  }
};

/* =========================
   GET ONE DECORATION
========================= */
export const getDecoration = async (req, res) => {
  try {
    const { id } = req.params;

    const decoration = await Decoration.findById(id);

    if (!decoration) {
      return res.status(404).json({
        success: false,
        message: "Decoración no encontrada",
      });
    }

    res.json({
      success: true,
      data: decoration,
    });
  } catch (error) {
    console.error("[Decoration] Error fetching decoration:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar decoración",
      error: error.message,
    });
  }
};

/* =========================
   CREATE DECORATION
========================= */
export const createDecoration = async (req, res) => {
  try {
    const { name, description, type, category, icon, image, imagePublicId, cost } = req.body;

    // Validation
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Nombre y tipo son obligatorios",
      });
    }

    const decoration = await Decoration.create({
      name: name.trim(),
      description: description?.trim() || "",
      type,
      category: category?.trim() || "",
      icon: icon || "✨",
      image: image || "",
      imagePublicId: imagePublicId || "",
      cost: Number(cost) || 0,
    });

    res.status(201).json({
      success: true,
      data: decoration,
      message: "Decoración creada exitosamente",
    });
  } catch (error) {
    console.error("[Decoration] Error creating decoration:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear decoración",
      error: error.message,
    });
  }
};

/* =========================
   UPDATE DECORATION
========================= */
export const updateDecoration = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, category, icon, image, imagePublicId, cost, isActive } = req.body;

    const decoration = await Decoration.findById(id);

    if (!decoration) {
      return res.status(404).json({
        success: false,
        message: "Decoración no encontrada",
      });
    }

    // Update fields
    if (name !== undefined) decoration.name = name.trim();
    if (description !== undefined) decoration.description = description.trim();
    if (type !== undefined) decoration.type = type;
    if (category !== undefined) decoration.category = category.trim();
    if (icon !== undefined) decoration.icon = icon;
    if (image !== undefined) decoration.image = image;
    if (imagePublicId !== undefined) decoration.imagePublicId = imagePublicId;
    if (cost !== undefined) decoration.cost = Number(cost);
    if (isActive !== undefined) decoration.isActive = isActive;

    await decoration.save();

    res.json({
      success: true,
      data: decoration,
      message: "Decoración actualizada exitosamente",
    });
  } catch (error) {
    console.error("[Decoration] Error updating decoration:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar decoración",
      error: error.message,
    });
  }
};

/* =========================
   DELETE DECORATION
========================= */
export const deleteDecoration = async (req, res) => {
  try {
    const { id } = req.params;

    const decoration = await Decoration.findById(id);

    if (!decoration) {
      return res.status(404).json({
        success: false,
        message: "Decoración no encontrada",
      });
    }

    await Decoration.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Decoración eliminada exitosamente",
    });
  } catch (error) {
    console.error("[Decoration] Error deleting decoration:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar decoración",
      error: error.message,
    });
  }
};
