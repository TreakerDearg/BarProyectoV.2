import { useState, useCallback, useEffect } from "react";
import {
  getRewards,
  createReward as createRewardService,
  updateReward as updateRewardService,
  deleteReward as deleteRewardService,
  getMyPoints as getMyPointsService,
} from "../services/rewardService";
import type { Reward, UserPointsSummary } from "../types/reward";

export const useRewards = () => {
  const [rewards, setRewards]   = useState<Reward[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);
  const [points,  setPoints]    = useState<UserPointsSummary | null>(null);

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
      setError(e.message || "Error al cargar recompensas");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==============================
     FETCH POINTS
  ============================== */
  const fetchPoints = useCallback(async () => {
    try {
      const data = await getMyPointsService();
      setPoints(data);
    } catch {
      // Non-critical — silently fail
    }
  }, []);

  /* ==============================
     CREATE
  ============================== */
  const createReward = useCallback(async (data: Partial<Reward>) => {
    try {
      const reward = await createRewardService(data);
      setRewards((prev) => [...prev, reward]);
      return { success: true, reward };
    } catch (err: unknown) {
      const e = err as Error;
      return { success: false, error: e.message };
    }
  }, []);

  /* ==============================
     UPDATE
  ============================== */
  const updateReward = useCallback(async (id: string, data: Partial<Reward>) => {
    try {
      const updated = await updateRewardService(id, data);
      setRewards((prev) => prev.map((r) => (r._id === id ? updated : r)));
      return { success: true, reward: updated };
    } catch (err: unknown) {
      const e = err as Error;
      return { success: false, error: e.message };
    }
  }, []);

  /* ==============================
     DELETE
  ============================== */
  const deleteReward = useCallback(async (id: string) => {
    try {
      await deleteRewardService(id);
      setRewards((prev) => prev.filter((r) => r._id !== id));
      return { success: true };
    } catch (err: unknown) {
      const e = err as Error;
      return { success: false, error: e.message };
    }
  }, []);

  /* ==============================
     INIT
  ============================== */
  useEffect(() => {
    fetchRewards();
    fetchPoints();
  }, [fetchRewards, fetchPoints]);

  return {
    rewards,
    loading,
    error,
    points,
    actions: {
      fetchRewards,
      fetchPoints,
      createReward,
      updateReward,
      deleteReward,
    },
  };
};
