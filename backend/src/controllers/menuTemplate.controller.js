import MenuTemplate from "../models/MenuTemplate.js";
import { ok, created, badRequest, notFound } from "../utils/response.js";

export const getTemplates = async (req, res, next) => {
  try {
    const { category, isFavorite, isSystem } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (isFavorite !== undefined) filter.isFavorite = isFavorite === "true";
    if (isSystem !== undefined) filter.isSystem = isSystem === "true";

    const templates = await MenuTemplate.find(filter).sort({ isSystem: -1, usageCount: -1, name: 1 });
    return ok(res, templates);
  } catch (error) {
    next(error);
  }
};

export const getTemplateById = async (req, res, next) => {
  try {
    const template = await MenuTemplate.findById(req.params.id);
    if (!template) return notFound(res, "Plantilla no encontrada");
    return ok(res, template);
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const { name, description, category, icon, template } = req.body;

    if (!name || !template) {
      return badRequest(res, "Nombre y plantilla son obligatorios");
    }

    const newTemplate = await MenuTemplate.create({
      name,
      description,
      category: category || "custom",
      icon,
      template,
      isSystem: false,
      createdBy: req.user?._id,
    });

    return created(res, newTemplate, "Plantilla creada correctamente");
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const { name, description, category, icon, template, isFavorite } = req.body;

    const updated = await MenuTemplate.findByIdAndUpdate(
      req.params.id,
      { name, description, category, icon, template, isFavorite },
      { new: true, runValidators: true }
    );

    if (!updated) return notFound(res, "Plantilla no encontrada");
    return ok(res, updated, "Plantilla actualizada correctamente");
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    const template = await MenuTemplate.findById(req.params.id);
    if (!template) return notFound(res, "Plantilla no encontrada");

    if (template.isSystem) {
      return badRequest(res, "No se pueden eliminar plantillas del sistema");
    }

    await MenuTemplate.findByIdAndDelete(req.params.id);
    return ok(res, null, "Plantilla eliminada correctamente");
  } catch (error) {
    next(error);
  }
};

export const incrementUsage = async (req, res, next) => {
  try {
    const template = await MenuTemplate.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!template) return notFound(res, "Plantilla no encontrada");
    return ok(res, template);
  } catch (error) {
    next(error);
  }
};
