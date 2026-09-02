import api from "../../../services/api";
import type { Promotion } from "../types/promotion";

/* =========================================================
   SAFE WRAPPER  (mismo patrón que reservationService)
========================================================= */
const safeRequest = async <T>(promise: Promise<any>): Promise<T> => {
  try {
    const res = await promise;
    // api.ts ya devuelve response.data — si tiene { data } anidado, lo desenvuelve
    const payload = res?.data ?? res;
    return payload as T;
  } catch (error: any) {
    const msg =
      error?.message ||
      error?.response?.data?.message ||
      "Error inesperado en promociones";
    throw new Error(msg);
  }
};

/* =========================================================
   GET ALL
========================================================= */
export const getPromotions = async (): Promise<Promotion[]> => {
  const list = await safeRequest<Promotion[]>(api.get("/promotions"));
  return Array.isArray(list) ? list : [];
};

/* =========================================================
   CREATE
========================================================= */
export const createPromotion = async (
  data: Omit<Promotion, "_id" | "createdAt" | "updatedAt" | "createdBy">
): Promise<Promotion> => {
  return safeRequest<Promotion>(api.post("/promotions", data));
};

/* =========================================================
   UPDATE  (PUT /:id)
========================================================= */
export const updatePromotion = async (
  id: string,
  data: Partial<Omit<Promotion, "_id" | "createdAt" | "updatedAt" | "createdBy">>
): Promise<Promotion> => {
  return safeRequest<Promotion>(api.put(`/promotions/${id}`, data));
};

/* =========================================================
   TOGGLE ACTIVE  (PATCH /:id/toggle)
========================================================= */
export const togglePromotion = async (
  id: string
): Promise<{ isActive: boolean }> => {
  return safeRequest<{ isActive: boolean }>(
    api.patch(`/promotions/${id}/toggle`)
  );
};

/* =========================================================
   DELETE
========================================================= */
export const deletePromotion = async (id: string): Promise<void> => {
  await safeRequest<void>(api.delete(`/promotions/${id}`));
};
