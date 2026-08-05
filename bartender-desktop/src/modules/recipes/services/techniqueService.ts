import api from "../../../services/api";
import type { Technique, Decoration } from "../types/technique";

/* =========================
   NORMALIZER (SAFE + CLEAN)
========================= */
const normalizeTechnique = (technique: Technique) => {
  return {
    name: technique.name?.trim() || "",
    description: technique.description?.trim() || "",
    category: technique.category || "build",
    icon: technique.icon || "🥤",
    instructions: technique.instructions?.trim() || "",
    equipment: Array.isArray(technique.equipment) ? technique.equipment : [],
    difficulty: technique.difficulty || "easy",
    time: Number(technique.time ?? 30),
  };
};

const normalizeDecoration = (decoration: Decoration) => {
  return {
    name: decoration.name?.trim() || "",
    type: decoration.type || "garnish",
    description: decoration.description?.trim() || "",
    icon: decoration.icon || "✨",
    category: decoration.category?.trim() || "",
    cost: Number(decoration.cost ?? 0),
  };
};

/* =========================
   TECHNIQUES
========================= */

export const getTechniques = async (): Promise<Technique[]> => {
  const { data } = await api.get("/techniques");

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

export const getTechnique = async (id: string): Promise<Technique> => {
  const { data } = await api.get(`/techniques/${id}`);
  return data;
};

export const createTechnique = async (
  technique: Technique
): Promise<Technique> => {
  const payload = normalizeTechnique(technique);

  if (!payload.name || !payload.category) {
    throw new Error("Nombre y categoría son obligatorios");
  }

  const { data } = await api.post("/techniques", payload);
  return data;
};

export const updateTechnique = async (
  id: string,
  technique: Technique
): Promise<Technique> => {
  const payload = normalizeTechnique(technique);
  const { data } = await api.patch(`/techniques/${id}`, payload);
  return data;
};

export const deleteTechnique = async (id: string): Promise<void> => {
  await api.delete(`/techniques/${id}`);
};

/* =========================
   DECORATIONS
========================= */

export const getDecorations = async (): Promise<Decoration[]> => {
  const { data } = await api.get("/decorations");

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

export const getDecoration = async (id: string): Promise<Decoration> => {
  const { data } = await api.get(`/decorations/${id}`);
  return data;
};

export const createDecoration = async (
  decoration: Decoration
): Promise<Decoration> => {
  const payload = normalizeDecoration(decoration);

  if (!payload.name || !payload.type) {
    throw new Error("Nombre y tipo son obligatorios");
  }

  const { data } = await api.post("/decorations", payload);
  return data;
};

export const updateDecoration = async (
  id: string,
  decoration: Decoration
): Promise<Decoration> => {
  const payload = normalizeDecoration(decoration);
  const { data } = await api.patch(`/decorations/${id}`, payload);
  return data;
};

export const deleteDecoration = async (id: string): Promise<void> => {
  await api.delete(`/decorations/${id}`);
};
