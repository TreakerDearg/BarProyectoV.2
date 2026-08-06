import Tag from "../models/Tag.js";

/* =========================
   GET ALL TAGS
========================= */
export const getTags = async (req, res) => {
  try {
    const { category, isActive } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const tags = await Tag.find(filter).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: tags,
      total: tags.length,
    });
  } catch (error) {
    console.error("[Tag] Error fetching tags:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar etiquetas",
      error: error.message,
    });
  }
};

/* =========================
   GET ONE TAG
========================= */
export const getTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Etiqueta no encontrada",
      });
    }

    res.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error("[Tag] Error fetching tag:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar etiqueta",
      error: error.message,
    });
  }
};

/* =========================
   CREATE TAG
========================= */
export const createTag = async (req, res) => {
  try {
    const { name, category, color } = req.body;

    // Validation
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Nombre y categoría son obligatorios",
      });
    }

    const tag = await Tag.create({
      name: name.trim(),
      category,
      color: color || "#6366f1",
    });

    res.status(201).json({
      success: true,
      data: tag,
      message: "Etiqueta creada exitosamente",
    });
  } catch (error) {
    console.error("[Tag] Error creating tag:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear etiqueta",
      error: error.message,
    });
  }
};

/* =========================
   UPDATE TAG
========================= */
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, color, isActive } = req.body;

    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Etiqueta no encontrada",
      });
    }

    // Update fields
    if (name !== undefined) tag.name = name.trim();
    if (category !== undefined) tag.category = category;
    if (color !== undefined) tag.color = color;
    if (isActive !== undefined) tag.isActive = isActive;

    await tag.save();

    res.json({
      success: true,
      data: tag,
      message: "Etiqueta actualizada exitosamente",
    });
  } catch (error) {
    console.error("[Tag] Error updating tag:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar etiqueta",
      error: error.message,
    });
  }
};

/* =========================
   DELETE TAG
========================= */
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Etiqueta no encontrada",
      });
    }

    await Tag.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Etiqueta eliminada exitosamente",
    });
  } catch (error) {
    console.error("[Tag] Error deleting tag:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar etiqueta",
      error: error.message,
    });
  }
};
