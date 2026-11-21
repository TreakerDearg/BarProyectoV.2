import api from "../../../services/api";
import type {
  Reward,
  UserPointsSummary,
  RedeemResult,
  VoucherValidationResult,
  RedemptionRecord,
  RewardsKPIs,
} from "../types/reward";

const BASE = "/rewards";

/* ==============================
   SAFE WRAPPER
============================== */
const safeRequest = async <T>(promise: Promise<{ data: unknown }>): Promise<T> => {
  try {
    const { data } = await promise;
    return data as T;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
    const msg = err.response?.data?.error || err.response?.data?.message || err.message || "Error inesperado";
    throw new Error(msg);
  }
};

/* ==============================
   GET ALL REWARDS (admin)
============================== */
export const getRewards = async (): Promise<Reward[]> => {
  const data = await safeRequest<Reward[]>(api.get(BASE));
  return Array.isArray(data) ? data : [];
};

/* ==============================
   CREATE REWARD
============================== */
export const createReward = async (data: Partial<Reward>): Promise<Reward> => {
  return safeRequest<Reward>(api.post(BASE, data));
};

/* ==============================
   UPDATE REWARD
============================== */
export const updateReward = async (id: string, data: Partial<Reward>): Promise<Reward> => {
  if (!id) throw new Error("ID inválido");
  return safeRequest<Reward>(api.patch(`${BASE}/${id}`, data));
};

/* ==============================
   DELETE REWARD
============================== */
export const deleteReward = async (id: string): Promise<{ id: string; deleted: boolean }> => {
  if (!id) throw new Error("ID inválido");
  return safeRequest(api.delete(`${BASE}/${id}`));
};

/* ==============================
   GET MY POINTS (legacy/client)
============================== */
export const getMyPoints = async (): Promise<UserPointsSummary> => {
  return safeRequest<UserPointsSummary>(api.get(`${BASE}/my-points`));
};

/* ==============================
   REDEEM REWARD (client voucher gen)
============================== */
export const redeemReward = async (id: string): Promise<RedeemResult> => {
  if (!id) throw new Error("ID inválido");
  return safeRequest<RedeemResult>(api.post(`${BASE}/redeem/${id}`));
};

/* ==============================
   VALIDATE VOUCHER (staff at bar)
============================== */
export const validateVoucher = async (code: string): Promise<VoucherValidationResult> => {
  if (!code) throw new Error("Código requerido");
  return safeRequest<VoucherValidationResult>(api.post(`${BASE}/voucher/validate`, { code }));
};

/* ==============================
   CLAIM VOUCHER (staff at bar)
============================== */
export const claimVoucher = async (
  code: string,
  orderId?: string
): Promise<{ success: boolean; message: string; order?: unknown }> => {
  if (!code) throw new Error("Código requerido");
  return safeRequest(api.post(`${BASE}/voucher/claim`, { code, orderId }));
};

/* ==============================
   GET REDEMPTIONS HISTORY (admin)
============================== */
export const getRedemptionsHistory = async (): Promise<RedemptionRecord[]> => {
  const data = await safeRequest<RedemptionRecord[]>(api.get(`${BASE}/redemptions`));
  return Array.isArray(data) ? data : [];
};

/* ==============================
   GET REWARDS KPIS (admin)
============================== */
export const getRewardsKpis = async (): Promise<RewardsKPIs> => {
  return safeRequest<RewardsKPIs>(api.get(`${BASE}/kpis`));
};
