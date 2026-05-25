import { useEffect, useRef, useCallback } from "react";
import socket from "@/lib/api/socket";
import {
  getRouletteDrinks,
  getRouletteLogs,
  createRouletteDrink,
  updateRouletteDrink,
  deleteRouletteDrink,
  batchUpdateRouletteDrinks,
  spinRouletteAdmin,
  type RouletteDrink,
} from "../services/rouletteService";
import { useRouletteStore } from "../store/rouletteStore";

// Cache constants
const CACHE_KEY_DRINKS = "roulette_drinks_cache";
const CACHE_KEY_LOGS = "roulette_logs_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/* =========================
   CACHE HELPERS
========================= */
const getCachedData = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data as T;
  } catch {
    return null;
  }
};

const setCachedData = <T>(key: string, data: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore cache errors
  }
};

const clearCache = (key: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore cache errors
  }
};

export function useRouletteAdmin() {
  const {
    drinks,
    logs,
    loading,
    spinning,
    lastResult,
    error,
    setDrinks,
    setLogs,
    setLoading,
    setSpinning,
    setLastResult,
    setError,
    updateDrink,
    addDrink,
    removeDrink,
    addLog,
  } = useRouletteStore();

  const abortRef = useRef<AbortController | null>(null);

  /* =========================
     LOAD DRINKS (WITH CACHE)
  ========================= */
  const loadDrinks = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first unless force refresh
      if (!forceRefresh) {
        const cached = getCachedData<RouletteDrink[]>(CACHE_KEY_DRINKS);
        if (cached) {
          setDrinks(cached);
          setLoading(false);
          // Background refresh
          getRouletteDrinks().then((freshData) => {
            setDrinks(freshData);
            setCachedData(CACHE_KEY_DRINKS, freshData);
          }).catch(() => {
            // Keep cached data on error
          });
          return;
        }
      }

      const data = await getRouletteDrinks();
      setDrinks(data);
      setCachedData(CACHE_KEY_DRINKS, data);
    } catch (err: any) {
      setError(err.message || "Error loading drinks");
    } finally {
      setLoading(false);
    }
  }, [setDrinks, setLoading, setError]);

  /* =========================
     LOAD LOGS (WITH CACHE)
  ========================= */
  const loadLogs = useCallback(async (forceRefresh = false) => {
    try {
      // Try cache first unless force refresh
      if (!forceRefresh) {
        const cached = getCachedData<any[]>(CACHE_KEY_LOGS);
        if (cached) {
          setLogs(cached);
          // Background refresh
          getRouletteLogs().then((freshData) => {
            setLogs(freshData);
            setCachedData(CACHE_KEY_LOGS, freshData);
          }).catch(() => {
            // Keep cached data on error
          });
          return;
        }
      }

      const data = await getRouletteLogs();
      setLogs(data);
      setCachedData(CACHE_KEY_LOGS, data);
    } catch (err: any) {
      console.error("Error loading logs:", err);
    }
  }, [setLogs]);

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    loadDrinks();
    loadLogs();
  }, [loadDrinks, loadLogs]);

  /* =========================
     CREATE DRINK
  ========================= */
  const createDrink = useCallback(
    async (drink: Partial<RouletteDrink>) => {
      try {
        setError(null);
        const newDrink = await createRouletteDrink(drink);
        addDrink(newDrink);
        clearCache(CACHE_KEY_DRINKS); // Invalidate cache
        return newDrink;
      } catch (err: any) {
        setError(err.message || "Error creating drink");
        throw err;
      }
    },
    [addDrink, setError]
  );

  /* =========================
     UPDATE DRINK
  ========================= */
  const updateDrinkServer = useCallback(
    async (id: string, updates: Partial<RouletteDrink>) => {
      try {
        setError(null);
        // Optimistic update
        updateDrink(id, updates);
        const updated = await updateRouletteDrink(id, updates);
        // Update with server response
        updateDrink(id, updated);
        clearCache(CACHE_KEY_DRINKS); // Invalidate cache
        return updated;
      } catch (err: any) {
        setError(err.message || "Error updating drink");
        // Reload to get correct state
        loadDrinks(true);
        throw err;
      }
    },
    [updateDrink, setError, loadDrinks]
  );

  /* =========================
     DELETE DRINK
  ========================= */
  const deleteDrink = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await deleteRouletteDrink(id);
        removeDrink(id);
        clearCache(CACHE_KEY_DRINKS); // Invalidate cache
      } catch (err: any) {
        setError(err.message || "Error deleting drink");
        throw err;
      }
    },
    [removeDrink, setError]
  );

  /* =========================
     BATCH UPDATE
  ========================= */
  const batchUpdate = useCallback(
    async (updates: Array<{ id: string; weight?: number; active?: boolean }>) => {
      try {
        setError(null);
        const result = await batchUpdateRouletteDrinks(updates);
        clearCache(CACHE_KEY_DRINKS); // Invalidate cache
        // Reload to get correct state
        loadDrinks(true);
        return result;
      } catch (err: any) {
        setError(err.message || "Error in batch update");
        throw err;
      }
    },
    [loadDrinks, setError]
  );

  /* =========================
     SPIN ROULETTE
  ========================= */
  const spin = useCallback(async () => {
    try {
      setSpinning(true);
      setError(null);
      const result = await spinRouletteAdmin();
      setLastResult(result.result);
      clearCache(CACHE_KEY_DRINKS); // Invalidate drinks cache
      clearCache(CACHE_KEY_LOGS); // Invalidate logs cache
      // Reload to get updated stats
      loadDrinks(true);
      loadLogs(true);
      return result;
    } catch (err: any) {
      setError(err.message || "Error spinning roulette");
      throw err;
    } finally {
      setSpinning(false);
    }
  }, [setSpinning, setLastResult, setError, loadDrinks, loadLogs]);

  /* =========================
     AUTO BALANCE
  ========================= */
  const autoBalance = useCallback(
    async (mode: "equal" | "smart" = "smart") => {
      const activeDrinks = drinks.filter((d) => d.active);
      if (!activeDrinks.length) return;

      let updated: Array<{ id: string; weight: number }> = [];

      if (mode === "equal") {
        const weight = Math.floor(100 / activeDrinks.length);
        updated = activeDrinks.map((d) => ({ id: d._id, weight }));
      } else if (mode === "smart") {
        const now = Date.now();
        updated = activeDrinks.map((d) => {
          const spins = d.totalSpins ?? 0;
          const last = d.lastSelectedAt
            ? new Date(d.lastSelectedAt).getTime()
            : 0;
          const recency = last > 0 ? Math.min((now - last) / 3600000, 24) : 24;

          const weight =
            (1 / (spins + 1)) * 50 +
            (recency / 24) * 30 +
            (d.category === "premium" ? 20 : 10);

          return { id: d._id, weight: Math.round(weight) };
        });
      }

      return batchUpdate(updated);
    },
    [drinks, batchUpdate]
  );

  /* =========================
     DERIVED STATS
  ========================= */
  const stats = {
    totalDrinks: drinks.length,
    activeDrinks: drinks.filter((d) => d.active).length,
    totalSpins: drinks.reduce((sum, d) => sum + (d.totalSpins ?? 0), 0),
    totalWins: drinks.reduce((sum, d) => sum + (d.totalWins ?? 0), 0),
    rarityDistribution: drinks.reduce((acc, d) => {
      acc[d.rarity] = (acc[d.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  /* =========================
     SOCKET.IO REALTIME SYNC
  ========================= */
  useEffect(() => {
    // Listen for roulette updates from other clients/desktop
    const handleRouletteUpdate = (updatedDrinks: RouletteDrink[]) => {
      setDrinks(updatedDrinks);
    };

    const handleRouletteSpin = (data: { result: RouletteDrink; meta: any }) => {
      setLastResult(data.result);
      // Reload to get updated stats
      loadDrinks(true);
      loadLogs(true);
    };

    socket.on("roulette:update", handleRouletteUpdate);
    socket.on("roulette:spin", handleRouletteSpin);

    return () => {
      socket.off("roulette:update", handleRouletteUpdate);
      socket.off("roulette:spin", handleRouletteSpin);
    };
  }, [loadDrinks, loadLogs, setDrinks, setLastResult]);

  return {
    // State
    drinks,
    logs,
    loading,
    spinning,
    lastResult,
    error,
    stats,

    // Actions
    loadDrinks,
    loadLogs,
    createDrink,
    updateDrink: updateDrinkServer,
    deleteDrink,
    batchUpdate,
    spin,
    autoBalance,
  };
}
