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
  menu: Partial<any>,
  options?: { allowEmptyCategories?: boolean; imageFile?: File }
): Promise<any> => {
  // If image file is provided, use FormData
  if (options?.imageFile) {
    const formData = new FormData();
    
    // Add menu data as JSON string
    formData.append('data', JSON.stringify({
      ...menu,
      allowEmptyCategories: options.allowEmptyCategories
    }));
    
    // Add image file
    formData.append('image', options.imageFile);
    
    return safeRequest<any>(api.post("/menus", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }));
  }
  
  // Otherwise, send as JSON
  return safeRequest<any>(api.post("/menus", {
    ...menu,
    allowEmptyCategories: options?.allowEmptyCategories
  }));
};

export const updateMenu = async (
  id: string,
  menu: Partial<any>,
  options?: { allowEmptyCategories?: boolean; imageFile?: File }
): Promise<any> => {
  // If image file is provided, use FormData
  if (options?.imageFile) {
    const formData = new FormData();
    
    // Add menu data as JSON string
    formData.append('data', JSON.stringify({
      ...menu,
      allowEmptyCategories: options.allowEmptyCategories
    }));
    
    // Add image file
    formData.append('image', options.imageFile);
    
    return safeRequest<any>(api.put(`/menus/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }));
  }
  
  // Otherwise, send as JSON
  return safeRequest<any>(api.put(`/menus/${id}`, {
    ...menu,
    allowEmptyCategories: options?.allowEmptyCategories
  }));
};

export const deleteMenu = async (id: string): Promise<void> => {
  await safeRequest(api.delete(`/menus/${id}`));
};
