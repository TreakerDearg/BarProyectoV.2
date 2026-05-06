import type { AxiosResponse } from "axios";
import type {
  ApiSuccess,
  AuthUser,
  ProductBrief,
  PublicMenu,
  RouletteDrinkRow,
  TableRow,
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
    return extractData<{ sessionId: string; table: TableRow }>(res);
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
    return extractData<unknown>(res);
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
    const res = await api.post("/roulette/spin");
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