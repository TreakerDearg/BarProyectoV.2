import api from "./api";
import type { Menu } from "../types/menu";

/* =========================
   RESPONSE NORMALIZER 
========================= */
function unwrap<T>(res: any): T {
  if (!res) return res;

  if (Array.isArray(res.data)) return res.data;
  if (res.data?.data) return res.data.data;

  return res.data;
}

/* =========================
   GET ALL
========================= */
export const getMenus = async (): Promise<Menu[]> => {
  const res = await api.get("/menus");
  const data = unwrap<Menu[]>(res);

  return Array.isArray(data) ? data : [];
};

/* =========================
   GET ONE
========================= */
export const getMenuById = async (id: string): Promise<Menu> => {
  const res = await api.get(`/menus/${id}`);
  return unwrap<Menu>(res);
};

/* =========================
   CREATE
========================= */
export const createMenu = async (
  menu: any,
  options?: { allowEmptyCategories?: boolean }
): Promise<Menu> => {
  const payload = buildPayload(menu, options?.allowEmptyCategories);

  const res = await api.post("/menus", payload);
  return unwrap<Menu>(res);
};

/* =========================
   UPDATE
========================= */
export const updateMenu = async (
  id: string,
  menu: any,
  options?: { allowEmptyCategories?: boolean }
): Promise<Menu> => {
  const payload = buildPayload(menu, options?.allowEmptyCategories);

  const res = await api.put(`/menus/${id}`, payload);
  return unwrap<Menu>(res);
};

/* =========================
   DELETE
========================= */
export const deleteMenu = async (id: string): Promise<void> => {
  await api.delete(`/menus/${id}`);
};

function buildPayload(menu: any, allowEmptyCategories = false) {
  if (!menu) throw new Error("Datos inválidos");

  if (!menu.name?.trim()) {
    throw new Error("Nombre requerido");
  }

  if (!Array.isArray(menu.categories) || menu.categories.length === 0) {
    throw new Error("Debe tener al menos una categoría");
  }

  const categories = Array.isArray(menu.categories) ? menu.categories.map((cat: any, index: number) => {
    if (!cat.name) {
      throw new Error(`Categoría #${index + 1} sin nombre`);
    }

    if (!allowEmptyCategories && (!Array.isArray(cat.products) || cat.products.length === 0)) {
      throw new Error(`La categoría "${cat.name}" está vacía`);
    }

    const products = Array.isArray(cat.products) && cat.products.length > 0 ? cat.products.map((p: any, i: number) => {
      if (!p.product) {
        throw new Error(`Producto inválido en ${cat.name}`);
      }

      return {
        product: p.product,
        price: p.price ?? null, //  alineado con schema backend
        available: p.available ?? true,
        order: i, //  importante (no position)
      };
    }) : [];

    return {
      name: cat.name,
      description: cat.description || "",
      order: index,
      products,
    };
  }) : [];

  return {
    name: menu.name.trim(),
    description: menu.description?.trim() || "",
    active: menu.active ?? true,

    //  CLAVE PARA NO ROMPER
    type: menu.type || "mixed",

    isPublic: menu.isPublic ?? true,

    allowEmptyCategories,

    categories,
  };
}