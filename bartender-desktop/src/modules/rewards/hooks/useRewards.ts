import { useState, useCallback, useEffect } from "react";
import {
  getRewards,
  createReward as createRewardService,
  updateReward as updateRewardService,
  deleteReward as deleteRewardService,
  getRewardsKpis as getRewardsKpisService,
  getRedemptionsHistory as getRedemptionsHistoryService,
  validateVoucher as validateVoucherService,
  claimVoucher as claimVoucherService,
} from "../services/rewardService";
import type {
  Reward,
  RewardsKPIs,
  RedemptionRecord,
  VoucherValidationResult,
} from "../types/reward";

export const useRewards = () => {
  const [rewards, setRewards]         = useState<Reward[]>([]);
  const [kpis, setKpis]               = useState<RewardsKPIs | null>(null);
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  /* ==============================
     FETCH REWARDS
  ============================== */
  const fetchRewards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRewards();
      setRewards(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Error al cargar catálogo de recompensas");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==============================
     FETCH KPIS
  ============================== */
  const fetchKpis = useCallback(async () => {
    try {
      const data = await getRewardsKpisService();
      setKpis(data);
    } catch (err) {
      console.error("[useRewards] Error al cargar KPIs:", err);
    }
  }, []);

  /* ==============================
     FETCH REDEMPTIONS
  ============================== */
  const fetchRedemptions = useCallback(async () => {
    try {
      const data = await getRedemptionsHistoryService();
      setRedemptions(data);
    } catch (err) {
      console.error("[useRewards] Error al cargar historial de canjes:", err);
    }
  }, []);

  /* ==============================
     CREATE
  ============================== */
  const createReward = useCallback(async (data: Partial<Reward>) => {
    try {
      const reward = await createRewardService(data);
      setRewards((prev) => [reward, ...prev]);
      fetchKpis();
      return { success: true, reward };
    } catch (err: unknown) {
      const e = err as Error;
      return { success: false, error: e.message };
    }
  }, [fetchKpis]);

  /* ==============================
     UPDATE
  ============================== */
  const updateReward = useCallback(async (id: string, data: Partial<Reward>) => {
    try {
      const updated = await updateRewardService(id, data);
      setRewards((prev) => prev.map((r) => (r._id === id ? updated : r)));
      fetchKpis();
      return { success: true, reward: updated };
    } catch (err: unknown) {
      const e = err as Error;
      return { success: false, error: e.message };
    }
  }, [fetchKpis]);

  /* ==============================
     DELETE
  ============================== */
  const deleteReward = useCallback(async (id: string) => {
    try {
      await deleteRewardService(id);
      setRewards((prev) => prev.filter((r) => r._id !== id));
      fetchKpis();
      return { success: true };
    } catch (err: unknown) {
      const e = err as Error;
      return { success: false, error: e.message };
    }
  }, [fetchKpis]);

  /* ==============================
     TOGGLE ACTIVE
  ============================== */
  const toggleActive = useCallback(async (id: string, currentActive: boolean) => {
    return updateReward(id, { active: !currentActive });
  }, [updateReward]);

  /* ==============================
     VALIDATE VOUCHER
  ============================== */
  const validateVoucher = useCallback(async (code: string): Promise<VoucherValidationResult> => {
    return validateVoucherService(code);
  }, []);

  /* ==============================
     CLAIM VOUCHER
  ============================== */
  const claimVoucher = useCallback(async (code: string, orderId?: string) => {
    const res = await claimVoucherService(code, orderId);
    fetchKpis();
    fetchRedemptions();
    return res;
  }, [fetchKpis, fetchRedemptions]);

  /* ==============================
     INIT
  ============================== */
  useEffect(() => {
    fetchRewards();
    fetchKpis();
    fetchRedemptions();
  }, [fetchRewards, fetchKpis, fetchRedemptions]);

  return {
    rewards,
    kpis,
    redemptions,
    loading,
    error,
    actions: {
      fetchRewards,
      fetchKpis,
      fetchRedemptions,
      createReward,
      updateReward,
      deleteReward,
      toggleActive,
      validateVoucher,
      claimVoucher,
    },
  };
};
