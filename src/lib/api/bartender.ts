import type { AxiosResponse } from "axios";
import type {
  ApiSuccess,
  AuthUser,
  ProductBrief,
  ProductPublicDTO,
  PublicMenu,
  RouletteDrinkRow,
  TableRow,
  OrderResponse,
  PromotionPublicDTO,
} from "@/lib/types/api";
import { api, errMessage } from "./client";

function extractData<T>(res: AxiosResponse): T {
  const body = res.data as
    | ApiSuccess<T>
    | { success?: boolean; message?: string };

  if (res.status >= 400) {
    const msg =
      typeof body === "object" &&
      body &&
      "message" in body &&
      typeof (body as { message?: string }).message === "string"
        ? (body as { message: string }).message
        : `Error ${res.status}`;
    throw new Error(msg);
  }

  if (typeof body === "object" && body && body.success === false) {
    throw new Error((body as { message?: string }).message ?? "Error");
  }

  if (
    typeof body === "object" &&
    body &&
    "data" in body &&
    (body as ApiSuccess<T>).data !== undefined
  ) {
    return (body as ApiSuccess<T>).data as T;
  }

  throw new Error("Respuesta inválida del servidor");
}

export async function getProducts(params?: {
  type?: "food" | "drink";
  available?: boolean;
  isActiveForPOS?: boolean;
}) {
  try {
    const res = await api.get("/products", {
      params: {
        ...(params?.type ? { type: params.type } : {}),
        ...(params?.available !== undefined
          ? { available: String(params.available) }
          : { available: "true" }),
        ...(params?.isActiveForPOS !== undefined
          ? { isActiveForPOS: String(params.isActiveForPOS) }
          : { isActiveForPOS: "true" }),
      },
    });
    return extractData<ProductBrief[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function getPublicProducts(params?: {
  type?: "food" | "drink";
  available?: boolean;
  featured?: boolean;
  category?: string;
  tags?: string[];
}) {
  try {
    const res = await api.get("/products/public", {
      params: {
        ...(params?.type ? { type: params.type } : {}),
        ...(params?.available !== undefined
          ? { available: String(params.available) }
          : {}),
        ...(params?.featured !== undefined
          ? { featured: String(params.featured) }
          : {}),
        ...(params?.category ? { category: params.category } : {}),
        ...(params?.tags ? { tags: params.tags.join(",") } : {}),
      },
    });
    return extractData<ProductPublicDTO[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function getPublicMenus(opts?: {
  type?: string;
  hideUnavailable?: boolean;
}) {
  try {
    const res = await api.get("/menus/public", {
      params: {
        hideUnavailable: opts?.hideUnavailable !== false ? "true" : "false",
        ...(opts?.type ? { type: opts.type } : {}),
      },
    });
    return extractData<PublicMenu[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function getTables() {
  try {
    const res = await api.get("/tables");
    return extractData<TableRow[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function openTableSession(tableId: string) {
  try {
    const res = await api.post(`/tables/${tableId}/open`);
    return extractData<{ sessionId: string; tableCode?: string | null; table: TableRow }>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

/**
 * Busca una mesa por su código de 3 dígitos.
 * Devuelve tableId, sessionId y tableNumber.
 */
export async function getTableByCode(code: string) {
  try {
    const res = await api.get(`/tables/code/${code}`);
    return extractData<{
      tableId:     string;
      tableNumber: number;
      sessionId:   string;
      tableCode:   string;
    }>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function createOrder(body: {
  table: string;
  sessionId: string;
  items: { product: string; quantity?: number; notes?: string }[];
  notes?: string;
  priority?: "low" | "normal" | "high";
}) {
  try {
    const res = await api.post("/orders", body);
    return extractData<OrderResponse>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function getPublicRouletteDrinks() {
  try {
    const res = await api.get("/roulette/public");
    return extractData<RouletteDrinkRow[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function spinRoulette() {
  try {
    const res = await api.post("/roulette/public/spin");
    return extractData<{
      result: RouletteDrinkRow;
      meta?: Record<string, unknown>;
    }>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function loginRequest(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  const data = extractData<{ token: string; user: AuthUser }>(res);
  return data;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
) {
  const res = await api.post("/auth/register", { name, email, password });
  return extractData<{ token: string; user: AuthUser }>(res);
}

export async function getAvailableReservationTables(params: {
  startTime: string;
  endTime: string;
  guests: number;
}) {
  try {
    const res = await api.get("/reservations/available/tables", {
      params: {
        startTime: params.startTime,
        endTime: params.endTime,
        guests: params.guests,
      },
    });
    return extractData<TableRow[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function createReservation(body: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startTime: string;
  endTime: string;
  guests: number;
  tableId?: string;
  notes?: string;
  source?: "web" | "app" | "admin";
  guestDietaryRestrictions?: Array<{
    guestName: string;
    restrictions: string[];
    notes?: string;
  }>;
}) {
  try {
    const res = await api.post("/reservations", {
      ...body,
      source: body.source ?? "web",
    });
    return extractData<unknown>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function checkReservationAvailability(params: {
  start: string;
  end: string;
  guests: number;
}) {
  try {
    const res = await api.get("/reservations/check-availability", {
      params: {
        start: params.start,
        end: params.end,
        guests: params.guests,
      },
    });

    return extractData<{ available: boolean }>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function getPublicPromotions() {
  try {
    const res = await api.get("/promotions/public");
    return extractData<PromotionPublicDTO[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export interface ProductCategoryPublic {
  id: string;
  name: string;
  count: number;
  drinks: number;
  food: number;
  sampleImage: string | null;
}

export async function getProductCategories(params?: { type?: "drink" | "food" }): Promise<ProductCategoryPublic[]> {
  try {
    const qs = params?.type ? `?type=${params.type}` : "";
    const res = await api.get(`/products/categories${qs}`);
    return extractData<ProductCategoryPublic[]>(res);
  } catch {
    return []; // No romper la Carta si falla
  }
}

/* =========================================================
   PERFIL DEL CLIENTE
========================================================= */

/** Actualizar nombre y/o teléfono del perfil propio */
export async function updateMyProfile(body: {
  name?: string;
  phone?: string;
}) {
  try {
    const res = await api.patch("/auth/profile", body);
    return extractData<{ _id: string; name: string; email: string; phone: string | null; avatar: string | null; role: string }>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

/** Cambiar contraseña (solo cuentas locales) */
export async function changeMyPassword(body: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const res = await api.patch("/auth/password", body);
    return extractData<null>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

/** Historial de pedidos del cliente autenticado */
export async function getMyOrderHistory(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  try {
    const qs = new URLSearchParams();
    if (params?.page)   qs.set("page",   String(params.page));
    if (params?.limit)  qs.set("limit",  String(params.limit));
    if (params?.status) qs.set("status", params.status);
    const res = await api.get(`/orders/my-history?${qs.toString()}`);
    return extractData<{
      data: Array<{
        _id: string;
        status: string;
        total: number;
        subtotal: number;
        itemCount: number;
        items: Array<{ name: string; quantity: number; status: string }>;
        createdAt: string;
        tableNumber: number | null;
        notes: string | null;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

/* =========================================================
   FAVORITOS
========================================================= */

export async function getMyFavorites() {
  try {
    const res = await api.get("/auth/favorites");
    return extractData<ProductPublicDTO[]>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function addFavorite(productId: string) {
  try {
    const res = await api.post("/auth/favorites", { productId });
    return extractData<null>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

export async function removeFavorite(productId: string) {
  try {
    const res = await api.delete(`/auth/favorites/${productId}`);
    return extractData<null>(res);
  } catch (e) {
    throw new Error(errMessage(e));
  }
}

/* =========================================================
   RESERVAS DEL CLIENTE
========================================================= */

export async function getMyReservations(params?: {
  upcoming?: boolean;
  limit?: number;
}) {
  try {
    const qs = new URLSearchParams();
    if (params?.upcoming) qs.set("upcoming", "true");
    if (params?.limit)    qs.set("limit", String(params.limit));
    const res = await api.get(`/reservations/my-history?${qs.toString()}`);
    return extractData<Array<{
      _id: string;
      status: string;
      startTime: string;
      endTime: string;
      guests: number;
      tableNumber?: number;
      notes?: string;
    }>>(res);
  } catch {
    return []; // silencioso — aún no implementado en backend
  }
}
