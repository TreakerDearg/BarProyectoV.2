import api from "../../../services/api";
import type { Table } from "../types/table";
import socket from "../../../services/socket";

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
   TABLES (REST)
============================== */
export const getTables = async (): Promise<Table[]> => {
  return safeRequest<Table[]>(api.get("/tables"));
};

export const getTableById = async (id: string): Promise<Table> => {
  return safeRequest<Table>(api.get(`/tables/${id}`));
};

export const createTable = async (
  table: Partial<Table>
): Promise<Table> => {
  return safeRequest<Table>(
    api.post("/tables", {
      number: table.number,
      capacity: table.capacity,
      location: table.location ?? "indoor",
    })
  );
};

export const updateTable = async (
  id: string,
  table: Partial<Table>
): Promise<Table> => {
  return safeRequest<Table>(api.put(`/tables/${id}`, table));
};

export const deleteTable = async (id: string): Promise<void> => {
  await safeRequest(api.delete(`/tables/${id}`));
};

export const openTable = async (id: string): Promise<Table> => {
  return safeRequest<Table>(api.post(`/tables/${id}/open`));
};

export const closeTable = async (id: string): Promise<Table> => {
  return safeRequest<Table>(api.post(`/tables/${id}/close`));
};

/* ==============================
   TAGS
============================== */
export const addTableTag = async (
  tableId: string,
  tag: {
    label: string;
    type?: "allergy" | "diet" | "preference" | "warning" | "other";
    priority?: "low" | "medium" | "high";
  }
): Promise<Table> => {
  return safeRequest<Table>(
    api.post(`/tables/${tableId}/tags`, tag)
  );
};

export const removeTableTag = async (
  tableId: string,
  label: string
): Promise<Table> => {
  return safeRequest<Table>(
    api.delete(`/tables/${tableId}/tags/${label}`)
  );
};

export const clearTableTags = async (
  tableId: string
): Promise<Table> => {
  return safeRequest<Table>(
    api.delete(`/tables/${tableId}/tags`)
  );
};

/* ==============================
   🔥 REAL-TIME (SOCKET LAYER)
============================== */

/**
 * Escuchar cambios de una mesa específica
 */
export const joinTableRoom = (tableId: string) => {
  socket.emit("join:table", tableId);
};

export const leaveTableRoom = (tableId: string) => {
  socket.emit("leave:table", tableId);
};

/**
 * STREAM GLOBAL DE MESAS
 */
export const subscribeTables = (
  callback: (table: Table) => void
) => {
  const handler = (table: Table) => callback(table);

  socket.on("table:update", handler);

  return () => {
    socket.off("table:update", handler);
  };
};

/**
 * STREAM DE UNA MESA ESPECÍFICA (ROOM READY)
 */
export const subscribeTableRoom = (
  tableId: string,
  callback: (table: Table) => void
) => {
  joinTableRoom(tableId);

  const handler = (table: Table) => {
    if (table._id === tableId) {
      callback(table);
    }
  };

  socket.on("table:update", handler);

  return () => {
    socket.off("table:update", handler);
    leaveTableRoom(tableId);
  };
};

/**
 * CLEANUP GLOBAL (opcional)
 */
export const disconnectTableSocket = () => {
  socket.off("table:update");
};