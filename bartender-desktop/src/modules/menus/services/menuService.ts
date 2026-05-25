import api from "../../../services/api";

/* ==============================
   SAFE WRAPPER
============================== */
const safeRequest = async <T>(promise: Promise<any>): Promise<T> => {
  try {
    const { data } = await promise;
    return data as T;
  } catch (error: any) {
    const msg =
      error?.response?.data?.error ||
      error?.message ||
      "Unexpected error";
    throw new Error(msg);
  }
};

/* ==============================
   MENUS (REST)
============================== */
export const getMenus = async (): Promise<any[]> => {
  return safeRequest<any[]>(api.get("/menus"));
};

export const getMenuById = async (id: string): Promise<any> => {
  return safeRequest<any>(api.get(`/menus/${id}`));
};

export const createMenu = async (
  menu: Partial<any>
): Promise<any> => {
  return safeRequest<any>(api.post("/menus", menu));
};

export const updateMenu = async (
  id: string,
  menu: Partial<any>
): Promise<any> => {
  return safeRequest<any>(api.put(`/menus/${id}`, menu));
};

export const deleteMenu = async (id: string): Promise<void> => {
  await safeRequest(api.delete(`/menus/${id}`));
};
