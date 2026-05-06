import api from "../../../services/api";
import socket from "../../../services/socket";
import type { Reservation } from "../types/reservation";

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
   SOCKET MANAGER (PRO CLEAN)
============================== */
export const reservationSocket = {
  /* ---------- INIT SYNC ---------- */
  onInitial: (cb: (data: any) => void) => {
    socket.on("reservation:list", (data) => {
      cb(data);
    });
  },

  /* ---------- CREATE ---------- */
  onCreated: (cb: (data: Reservation) => void) => {
    socket.on("reservation:created", (data) => {
      if (data?._id) cb(data);
    });
  },

  /* ---------- UPDATE ---------- */
  onUpdated: (cb: (data: Reservation) => void) => {
    socket.on("reservation:update", (data) => {
      if (data?._id) cb(data);
    });
  },

  /* ---------- DELETE ---------- */
  onDeleted: (cb: (id: string) => void) => {
    socket.on("reservation:delete", (id) => {
      if (id) cb(id);
    });
  },

  /* ---------- TABLE SYNC ---------- */
  onTableUpdate: (cb: (data: any) => void) => {
    socket.on("table:update", cb);
  },

  /* ---------- CLEANUP ---------- */
  offAll: () => {
    socket.off("reservation:list");
    socket.off("reservation:created");
    socket.off("reservation:update");
    socket.off("reservation:delete");
    socket.off("table:update");
  },
};

/* ==============================
   API - GET ALL
============================== */
export const getReservations = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<any> => {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);

  return safeRequest<any>(
    api.get(`/reservations?${query.toString()}`)
  );
};

/* ==============================
   API - GET BY ID
============================== */
export const getReservationById = async (
  id: string
): Promise<Reservation> => {
  return safeRequest<Reservation>(
    api.get(`/reservations/${id}`)
  );
};

/* ==============================
   API - CREATE
============================== */
export const createReservation = async (reservation: any) => {
  if (!reservation?.startTime || !reservation?.endTime) {
    throw new Error("Fechas inválidas");
  }

  const payload = {
    customerName: reservation.customerName,
    customerPhone: reservation.customerPhone,
    customerEmail: reservation.customerEmail || "",
    guests: Number(reservation.guests),
    tableId: reservation.tableId || null,
    startTime: new Date(reservation.startTime).toISOString(),
    endTime: new Date(reservation.endTime).toISOString(),
    notes: reservation.notes || "",
    status: reservation.status || "pending",
    source: "admin",
  };

  return safeRequest<Reservation>(
    api.post("/reservations", payload)
  );
};

/* ==============================
   API - UPDATE STATUS
============================== */
export const updateReservationStatus = async (
  id: string,
  status: Reservation["status"]
) => {
  if (!id) throw new Error("ID inválido");

  return safeRequest<Reservation>(
    api.patch(`/reservations/${id}/status`, { status })
  );
};

/* ==============================
   API - DELETE
============================== */
export const deleteReservation = async (id: string) => {
  if (!id) throw new Error("ID inválido");

  return safeRequest(
    api.delete(`/reservations/${id}`)
  );
};

/* ==============================
   AVAILABLE TABLES
============================== */
export const getAvailableTables = async (params?: {
  startTime?: string;
  endTime?: string;
  guests?: number;
}) => {
  const query = new URLSearchParams();

  if (params?.startTime) query.append("startTime", params.startTime);
  if (params?.endTime) query.append("endTime", params.endTime);
  if (params?.guests) query.append("guests", String(params.guests));

  const data = await safeRequest(
    api.get(
      `/reservations/available/tables?${query.toString()}`
    )
  );

  return Array.isArray(data) ? data : [];
};