const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const INVENTORY_API = `${API_URL}/inventory`;

/* ==============================
   TYPES
============================== */
export interface InventoryItem {
  _id: string;
  name: string;
  stock: number;
  unit: "ml" | "g" | "unit" | "oz";
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryDTO {
  name: string;
  stock: number;
  unit: "ml" | "g" | "unit" | "oz";
  category: string;
}

/* ==============================
   GENERIC FETCH HELPER
============================== */
const fetchAPI = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    let errorMessage = "Error en la solicitud";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignorar si no se puede parsear el error
    }
    throw new Error(errorMessage);
  }

  // Evita errores cuando la respuesta no tiene contenido
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
};

/* ==============================
   SERVICES
============================== */

// Obtener todos los ingredientes
export const getInventory = async (): Promise<InventoryItem[]> => {
  return fetchAPI<InventoryItem[]>(INVENTORY_API, {
    cache: "no-store",
  });
};

// Obtener un ingrediente por ID
export const getInventoryItem = async (
  id: string
): Promise<InventoryItem> => {
  return fetchAPI<InventoryItem>(`${INVENTORY_API}/${id}`);
};

// Crear un ingrediente
export const createItem = async (
  data: InventoryDTO
): Promise<InventoryItem> => {
  return fetchAPI<InventoryItem>(INVENTORY_API, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Actualizar un ingrediente
export const updateItem = async (
  id: string,
  data: Partial<InventoryDTO>
): Promise<InventoryItem> => {
  return fetchAPI<InventoryItem>(`${INVENTORY_API}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// Eliminar un ingrediente
export const deleteItem = async (id: string): Promise<void> => {
  await fetchAPI<void>(`${INVENTORY_API}/${id}`, {
    method: "DELETE",
  });
};