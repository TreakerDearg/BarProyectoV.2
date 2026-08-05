import api from "../../../services/api";
import type { RecipeCollection, RecipeTag } from "../types/collection";

/* =========================
   NORMALIZER (SAFE + CLEAN)
========================= */
const normalizeCollection = (collection: RecipeCollection) => {
  return {
    name: collection.name?.trim() || "",
    description: collection.description?.trim() || "",
    icon: collection.icon || "📁",
    color: collection.color || "#6366f1",
    tags: Array.isArray(collection.tags) ? collection.tags : [],
    isSystem: collection.isSystem || false,
  };
};

const normalizeTag = (tag: RecipeTag) => {
  return {
    name: tag.name?.trim() || "",
    category: tag.category || "style",
    color: tag.color || "#6366f1",
  };
};

/* =========================
   COLLECTIONS
========================= */

export const getCollections = async (): Promise<RecipeCollection[]> => {
  const { data } = await api.get("/collections");

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

export const getCollection = async (id: string): Promise<RecipeCollection> => {
  const { data } = await api.get(`/collections/${id}`);
  return data;
};

export const createCollection = async (
  collection: RecipeCollection
): Promise<RecipeCollection> => {
  const payload = normalizeCollection(collection);

  if (!payload.name) {
    throw new Error("Nombre es obligatorio");
  }

  const { data } = await api.post("/collections", payload);
  return data;
};

export const updateCollection = async (
  id: string,
  collection: RecipeCollection
): Promise<RecipeCollection> => {
  const payload = normalizeCollection(collection);
  const { data } = await api.patch(`/collections/${id}`, payload);
  return data;
};

export const deleteCollection = async (id: string): Promise<void> => {
  await api.delete(`/collections/${id}`);
};

/* =========================
   TAGS
========================= */

export const getTags = async (): Promise<RecipeTag[]> => {
  const { data } = await api.get("/tags");

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

export const getTag = async (id: string): Promise<RecipeTag> => {
  const { data } = await api.get(`/tags/${id}`);
  return data;
};

export const createTag = async (tag: RecipeTag): Promise<RecipeTag> => {
  const payload = normalizeTag(tag);

  if (!payload.name || !payload.category) {
    throw new Error("Nombre y categoría son obligatorios");
  }

  const { data } = await api.post("/tags", payload);
  return data;
};

export const updateTag = async (
  id: string,
  tag: RecipeTag
): Promise<RecipeTag> => {
  const payload = normalizeTag(tag);
  const { data } = await api.patch(`/tags/${id}`, payload);
  return data;
};

export const deleteTag = async (id: string): Promise<void> => {
  await api.delete(`/tags/${id}`);
};
