const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const TABLE_API = `${API_URL}/tables`;

/* ==============================
   TIPOS
============================== */
export type TableLocation = "indoor" | "outdoor" | "bar";
export type TableStatus = "available" | "reserved" | "occupied";

export interface Table {
  _id: string;
  number: number;
  capacity: number;
  location: TableLocation;
  status: TableStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTableDTO {
  number: number;
  capacity: number;
  location: TableLocation;
}

export interface UpdateTableDTO extends Partial<CreateTableDTO> {
  status?: TableStatus;
}

/* ==============================
   MANEJO DE ERRORES
============================== */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = "Error en la solicitud";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

/* ==============================
   HEADERS
============================== */
const getHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/* ==============================
   SERVICIOS
============================== */

// Obtener todas las mesas
export const getTables = async (): Promise<Table[]> => {
  const res = await fetch(TABLE_API, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  return handleResponse<Table[]>(res);
};

// Obtener una mesa por ID
export const getTableById = async (id: string): Promise<Table> => {
  const res = await fetch(`${TABLE_API}/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse<Table>(res);
};

// Crear una mesa
export const createTable = async (
  data: CreateTableDTO
): Promise<Table> => {
  const res = await fetch(TABLE_API, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<Table>(res);
};

// Actualizar una mesa
export const updateTable = async (
  id: string,
  data: UpdateTableDTO
): Promise<Table> => {
  const res = await fetch(`${TABLE_API}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<Table>(res);
};

// Actualizar estado de la mesa
export const updateTableStatus = async (
  id: string,
  status: TableStatus
): Promise<Table> => {
  const res = await fetch(`${TABLE_API}/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });

  return handleResponse<Table>(res);
};

// Eliminar una mesa
export const deleteTable = async (id: string): Promise<void> => {
  const res = await fetch(`${TABLE_API}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al eliminar la mesa");
  }
};

// Obtener mesas disponibles
export const getAvailableTables = async (): Promise<Table[]> => {
  const tables = await getTables();
  return tables.filter((table) => table.status === "available");
};

// Obtener mesas por capacidad
export const getTablesByCapacity = async (
  guests: number
): Promise<Table[]> => {
  const tables = await getTables();
  return tables.filter(
    (table) =>
      table.capacity >= guests && table.status === "available"
  );
};