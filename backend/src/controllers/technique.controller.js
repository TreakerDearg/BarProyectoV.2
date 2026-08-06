import Technique from "../models/Technique.js";

/* =========================
   GET ALL TECHNIQUES
========================= */
export const getTechniques = async (req, res) => {
  try {
    const { category, difficulty, isActive } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const techniques = await Technique.find(filter).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: techniques,
      total: techniques.length,
    });
  } catch (error) {
    console.error("[Technique] Error fetching techniques:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar técnicas",
      error: error.message,
    });
  }
};

/* =========================
   GET ONE TECHNIQUE
========================= */
export const getTechnique = async (req, res) => {
  try {
    const { id } = req.params;

    const technique = await Technique.findById(id);

    if (!technique) {
      return res.status(404).json({
        success: false,
        message: "Técnica no encontrada",
      });
    }

    res.json({
      success: true,
      data: technique,
    });
  } catch (error) {
    console.error("[Technique] Error fetching technique:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar técnica",
      error: error.message,
    });
  }
};

/* =========================
   CREATE TECHNIQUE
========================= */
export const createTechnique = async (req, res) => {
  try {
    const { name, description, category, icon, instructions, equipment, difficulty, time } = req.body;

    // Validation
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Nombre y categoría son obligatorios",
      });
    }

    const technique = await Technique.create({
      name: name.trim(),
      description: description?.trim() || "",
      category,
      icon: icon || "🥤",
      instructions: instructions?.trim() || "",
      equipment: Array.isArray(equipment) ? equipment : [],
      difficulty: difficulty || "easy",
      time: Number(time) || 30,
    });

    res.status(201).json({
      success: true,
      data: technique,
      message: "Técnica creada exitosamente",
    });
  } catch (error) {
    console.error("[Technique] Error creating technique:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear técnica",
      error: error.message,
    });
  }
};

/* =========================
   UPDATE TECHNIQUE
========================= */
export const updateTechnique = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, icon, instructions, equipment, difficulty, time, isActive } = req.body;

    const technique = await Technique.findById(id);

    if (!technique) {
      return res.status(404).json({
        success: false,
        message: "Técnica no encontrada",
      });
    }

    // Update fields
    if (name !== undefined) technique.name = name.trim();
    if (description !== undefined) technique.description = description.trim();
    if (category !== undefined) technique.category = category;
    if (icon !== undefined) technique.icon = icon;
    if (instructions !== undefined) technique.instructions = instructions.trim();
    if (equipment !== undefined) technique.equipment = Array.isArray(equipment) ? equipment : [];
    if (difficulty !== undefined) technique.difficulty = difficulty;
    if (time !== undefined) technique.time = Number(time);
    if (isActive !== undefined) technique.isActive = isActive;

    await technique.save();

    res.json({
      success: true,
      data: technique,
      message: "Técnica actualizada exitosamente",
    });
  } catch (error) {
    console.error("[Technique] Error updating technique:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar técnica",
      error: error.message,
    });
  }
};

/* =========================
   DELETE TECHNIQUE
========================= */
export const deleteTechnique = async (req, res) => {
  try {
    const { id } = req.params;

    const technique = await Technique.findById(id);

    if (!technique) {
      return res.status(404).json({
        success: false,
        message: "Técnica no encontrada",
      });
    }

    await Technique.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Técnica eliminada exitosamente",
    });
  } catch (error) {
    console.error("[Technique] Error deleting technique:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar técnica",
      error: error.message,
    });
  }
};
