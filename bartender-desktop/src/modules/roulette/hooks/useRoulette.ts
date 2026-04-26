import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  getRouletteDrinks,
  createRouletteDrink,
  updateRouletteDrink,
  deleteRouletteDrink,
  spinRoulette,
  rouletteSocket,
} from "../services/rouletteService";

import type {
  RouletteDrink,
  RouletteSpinResult,
} from "../types/roulette";

/* ============================== */
type LogLevel = "system" | "admin" | "event" | "alert";

interface RouletteLog {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
}

const MAX_LOGS = 50;

/* ============================== */
export const useRoulette = () => {
  const [drinks, setDrinks] = useState<RouletteDrink[]>([]);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] =
    useState<RouletteSpinResult | null>(null);
  const [logs, setLogs] = useState<RouletteLog[]>([]);

  const drinksRef = useRef<RouletteDrink[]>([]);

  /* ==============================
     KEEP REF SYNC
  ============================== */
  useEffect(() => {
    drinksRef.current = drinks;
  }, [drinks]);

  /* ==============================
     LOG ENGINE
  ============================== */
  const pushLog = useCallback((level: LogLevel, message: string) => {
    setLogs((prev) => {
      if (prev[0]?.message === message) return prev;

      return [
        {
          id: crypto.randomUUID(),
          level,
          message,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, MAX_LOGS - 1),
      ];
    });
  }, []);

  /* ==============================
     LOAD
  ============================== */
  const load = useCallback(async (silent = false) => {
    setLoading(true);

    try {
      const data = await getRouletteDrinks();
      setDrinks(data);

      if (!silent) pushLog("system", "Roulette synced");
    } catch {
      pushLog("alert", "Error loading roulette");
    } finally {
      setLoading(false);
    }
  }, [pushLog]);

  /* ==============================
     CREATE
  ============================== */
  const create = useCallback(async (drink: Partial<RouletteDrink>) => {
    try {
      const newDrink = await createRouletteDrink(drink);

      setDrinks((prev) => [...prev, newDrink]);
      pushLog("event", `Added '${newDrink.name}'`);
    } catch {
      pushLog("alert", "Create failed");
    }
  }, [pushLog]);

  /* ==============================
     UPDATE (SAFE + NO STALE)
  ============================== */
  const update = useCallback(
    async (id: string, updates: Partial<RouletteDrink>) => {
      const prev = drinksRef.current;

      setDrinks((current) =>
        current.map((d) =>
          d._id === id ? { ...d, ...updates } : d
        )
      );

      try {
        await updateRouletteDrink(id, updates);

        const target = prev.find((d) => d._id === id);

        if (!target) return;

        if (updates.weight !== undefined) {
          pushLog(
            "admin",
            `${target.name}: ${target.weight} → ${updates.weight}`
          );
        }
      } catch {
        setDrinks(prev);
        pushLog("alert", "Update failed (rollback)");
      }
    },
    [pushLog]
  );

  /* ==============================
     DELETE
  ============================== */
  const remove = useCallback(async (id: string) => {
    const prev = drinksRef.current;
    const drink = prev.find((d) => d._id === id);

    setDrinks((current) =>
      current.filter((d) => d._id !== id)
    );

    try {
      await deleteRouletteDrink(id);

      if (drink) pushLog("alert", `Removed '${drink.name}'`);
    } catch {
      setDrinks(prev);
      pushLog("alert", "Delete failed");
    }
  }, [pushLog]);

  /* ==============================
     SPIN (SMART UPDATE)
  ============================== */
  const spin = useCallback(async () => {
    if (spinning) return;

    setSpinning(true);

    try {
      const result = await spinRoulette();

      setLastResult(result);

      //  actualizar stats localmente
      setDrinks((prev) =>
        prev.map((d) =>
          d._id === result.result._id
            ? {
                ...d,
                totalSpins: (d.totalSpins ?? 0) + 1,
                lastSelectedAt: new Date().toISOString(),
              }
            : d
        )
      );

      pushLog("system", `Result → ${result.result.name}`);

      return result;
    } catch {
      pushLog("alert", "Spin failed");
    } finally {
      setSpinning(false);
    }
  }, [spinning, pushLog]);

  /* ==============================
     AUTO BALANCE PRO
  ============================== */
  const autoBalance = useCallback(
    async (mode: "equal" | "smart" | "smooth" = "smart") => {
      const current = drinksRef.current.filter((d) => d.active);

      if (!current.length) return;

      let updated: RouletteDrink[] = [];

      if (mode === "equal") {
        const weight = Math.floor(100 / current.length);

        updated = current.map((d) => ({
          ...d,
          weight,
        }));
      }

      if (mode === "smooth") {
        const avg =
          current.reduce((acc, d) => acc + d.weight, 0) /
          current.length;

        updated = current.map((d) => ({
          ...d,
          weight: Math.round((d.weight + avg) / 2),
        }));
      }

      if (mode === "smart") {
        const now = Date.now();

        updated = current.map((d) => {
          const spins = d.totalSpins ?? 0;

          const last = d.lastSelectedAt
            ? new Date(d.lastSelectedAt).getTime()
            : 0;

          const recency =
            last > 0
              ? Math.min((now - last) / 3600000, 24)
              : 24;

          const weight =
            (1 / (spins + 1)) * 50 +
            (recency / 24) * 30 +
            (d.category === "premium" ? 20 : 10);

          return {
            ...d,
            weight: Math.round(weight),
          };
        });
      }

      //  APPLY UI
      setDrinks((prev) =>
        prev.map((d) => {
          const found = updated.find((u) => u._id === d._id);
          return found ? found : d;
        })
      );

      //  SINGLE BATCH (mejor práctica real sería endpoint batch)
      await Promise.all(
        updated.map((d) =>
          updateRouletteDrink(d._id, { weight: d.weight })
        )
      );

      pushLog("admin", `AutoBalance → ${mode.toUpperCase()}`);
    },
    [pushLog]
  );

  /* ==============================
     DERIVED
  ============================== */
  const totalWeight = useMemo(() => {
    return drinks
      .filter((d) => d.active)
      .reduce((acc, d) => acc + d.weight, 0);
  }, [drinks]);

  const drinksWithProbability = useMemo(() => {
    return drinks.map((d) => ({
      ...d,
      probability:
        d.active && totalWeight
          ? (d.weight / totalWeight) * 100
          : 0,
    }));
  }, [drinks, totalWeight]);

  /* ==============================
     SOCKETS (MERGE SAFE)
  ============================== */
  useEffect(() => {
    rouletteSocket.onUpdate((data) => {
      setDrinks((prev) => {
        // merge inteligente
        const map = new Map(prev.map((d) => [d._id, d]));

        data.forEach((d) => map.set(d._id, d));

        return Array.from(map.values());
      });

      pushLog("system", "Realtime sync");
    });

    rouletteSocket.onSpin((result) => {
      setLastResult(result);
      pushLog("event", `Remote → ${result.result.name}`);
    });

    return () => rouletteSocket.offAll();
  }, [pushLog]);

  /* ==============================
     INIT
  ============================== */
  useEffect(() => {
    load(true);
  }, [load]);

  return {
    drinks: drinksWithProbability,
    loading,
    spinning,
    lastResult,
    totalWeight,
    logs,

    actions: {
      load,
      create,
      update,
      remove,
      spin,
      autoBalance, 
    },
  };
};