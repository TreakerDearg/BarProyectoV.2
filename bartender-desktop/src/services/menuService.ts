import { api } from "../services/api";
import type { Menu } from "../types/menu";

export const getMenus = async (): Promise<Menu[]> => {
  const { data } = await api.get("/menus");
  return data;
};

export const createMenu = async (menu: Menu): Promise<Menu> => {
  const { data } = await api.post("/menus", menu);
  return data;
};

export const updateMenu = async (
  id: string,
  menu: Menu
): Promise<Menu> => {
  const { data } = await api.put(`/menus/${id}`, menu);
  return data;
};

export const deleteMenu = async (id: string): Promise<void> => {
  await api.delete(`/menus/${id}`);
};