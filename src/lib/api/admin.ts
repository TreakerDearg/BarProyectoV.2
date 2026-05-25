import { api, errMessage } from "./client";
import type { AxiosResponse } from "axios";

// Helper genérico para extraer data como en bartender.ts
function extractData<T>(res: AxiosResponse): T {
  const body = res.data;

  if (res.status >= 400) {
    const msg = typeof body === "object" && body && "message" in body
      ? (body as any).message
      : `Error ${res.status}`;
    throw new Error(msg);
  }

  if (typeof body === "object" && body && body.success === false) {
    throw new Error((body as any).message ?? "Error");
  }

  if (typeof body === "object" && body && "data" in body) {
    return (body as any).data as T;
  }

  return body as T;
}

// ----------------------------------------------------------------------------
// EMPLOYEES (USERS)
// ----------------------------------------------------------------------------
export async function getEmployees() {
  try {
    const res = await api.get("/users");
    return extractData<any[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function createEmployee(data: any) {
  try {
    const res = await api.post("/users", data);
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function updateEmployee(id: string, data: any) {
  try {
    const res = await api.put(`/users/${id}`, data);
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function deleteEmployee(id: string) {
  try {
    const res = await api.delete(`/users/${id}`);
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

// ----------------------------------------------------------------------------
// PRODUCTS
// ----------------------------------------------------------------------------
export async function getAdminProducts(params?: Record<string, any>) {
  try {
    const res = await api.get("/products/admin", { params }); // o endpoint general
    return extractData<any[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function createProduct(data: any) {
  try {
    const res = await api.post("/products", data);
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const res = await api.put(`/products/${id}`, data);
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function deleteProduct(id: string) {
  try {
    const res = await api.delete(`/products/${id}`);
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

// ----------------------------------------------------------------------------
// TABLES
// ----------------------------------------------------------------------------
export async function getAdminTables() {
  try {
    const res = await api.get("/tables");
    return extractData<any[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function createTable(data: any) {
  try {
    const res = await api.post("/tables", data);
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function updateTable(id: string, data: any) {
  try {
    const res = await api.put(`/tables/${id}`, data);
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function deleteTable(id: string) {
  try {
    const res = await api.delete(`/tables/${id}`);
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

// ----------------------------------------------------------------------------
// ORDERS
// ----------------------------------------------------------------------------
export async function getAdminOrders(params?: Record<string, any>) {
  try {
    const res = await api.get("/orders", { params });
    return extractData<any[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

// ----------------------------------------------------------------------------
// DASHBOARD STATS
// ----------------------------------------------------------------------------
export async function getDashboardStats() {
  try {
    const res = await api.get("/dashboard/stats");
    return extractData<any>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

// Otros métodos para modules (menus, inventory, reservations, etc.) se agregarían aquí
