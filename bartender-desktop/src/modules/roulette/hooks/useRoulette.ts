import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  getRouletteDrinks,
  createRouletteDrink,
  updateRouletteDrink,
  deleteRouletteDrink,
  spinRoulette,
  rouletteSocket,
  batchUpdateRouletteDrinks,
} from "../services/rouletteService";

import type {
  RouletteDrink,
  RouletteSpinResult,
  SpinPhase,
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

/* ==============================
   HELPER: calculateTargetAngle
   Finds the winner slice center angle and adds 8-12 full rotations.
   Uses weight/totalWeight (desktop drinks don't expose probability directly).
============================== */
export function calculateTargetAngle(
  drinks: RouletteDrink[],
  winner: RouletteDrink,
  totalWeight: number
): number {
  let accumulated = 0;

  for (const drink of drinks) {
    const sliceAngle = (drink.weight / totalWeight) * 360;

    if (drink._id === winner._id) {
      const centerOfSlice = accumulated + sliceAngle / 2;
      // 270° → top position (pointer). Consistent with polarToCartesian in RouletteSliceRoyale.
      const baseOffset = (270 - centerOfSlice + 360) % 360;
      const fullRotations = 8 + Math.floor(Math.random() * 5); // 8-12 spins
      return fullRotations * 360 + baseOffset;
    }

    accumulated += sliceAngle;
  }

  // Fallback: 10 rotations
  return 10 * 360;
}

/* ============================== */
export const useRoulette = () => {
  const [drinks, setDrinks] = useState<RouletteDrink[]>([]);
  const [loading, setLoading] = useState(false);

  // ── SpinPhase machine ─────────────────────────────────────────
  const [phase, setPhase] = useState<SpinPhase>("idle");
  const [pendingResult, setPendingResult] = useState<RouletteSpinResult | null>(null);
  const [revealedResult, setRevealedResult] = useState<RouletteSpinResult | null>(null);
  const [targetAngle, setTargetAngle] = useState<number | null>(null);

  const [logs, setLogs] = useState<RouletteLog[]>([]);

  const drinksRef = useRef<RouletteDrink[]>([]);
  const landingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref mirror of pendingResult — keeps onWheelLanded closure fresh even if
  // a socket-driven re-render fires between "revealing" and the 400 ms timer.
  const pendingResultRef = useRef<RouletteSpinResult | null>(null);

  // ── Backward compat aliases ───────────────────────────────────
  // spinning: true while wheel is in motion (not idle, not revealed)
  const spinning = phase !== "idle" && phase !== "revealed";
  // lastResult: alias for revealedResult (consumed by RouletteStats etc.)
  const lastResult = revealedResult;

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
    // Foolproof validation: Check for duplicate drinks
    const productId = typeof drink.product === "object" ? drink.product?._id : drink.product;
    const existingDrink = drinksRef.current.find((d) => {
      const dProductId = typeof d.product === "object" ? d.product?._id : d.product;
      return d && dProductId === productId;
    });

    if (existingDrink) {
      pushLog("alert", `Duplicate drink: ${drink.name}`);
      return { success: false, error: "duplicate" };
    }

    if (!drink.name) {
      pushLog("alert", "Missing drink name");
      return { success: false, error: "missing_name" };
    }

    if (drink.weight && (drink.weight < 1 || drink.weight > 1000)) {
      pushLog("alert", "Invalid weight range");
      return { success: false, error: "invalid_weight" };
    }

    const drinkWithDefaults = {
      ...drink,
      weight: drink.weight || 10,
      rarity: drink.rarity || "COMMON",
      active: drink.active !== undefined ? drink.active : true,
    };

    try {
      const newDrink = await createRouletteDrink(drinkWithDefaults);

      if (!newDrink) throw new Error("Server returned null response");
      if (!newDrink.name) throw new Error("Server returned drink without name");
      if (!newDrink._id) throw new Error("Server returned drink without ID");

      setDrinks((prev) => [...prev, newDrink]);
      pushLog("event", `Added '${newDrink.name}' (Weight: ${newDrink.weight}, Rarity: ${newDrink.rarity})`);
      return { success: true, drink: newDrink };
    } catch (error: unknown) {
      console.error("Error creating drink:", error);
      pushLog("alert", "Create failed");
      return { success: false, error: error instanceof Error ? error.message : "unknown" };
    }
  }, [pushLog]);

  /* ==============================
     UPDATE (SAFE + NO STALE)
  ============================== */
  const update = useCallback(
    async (id: string, updates: Partial<RouletteDrink>) => {
      const prev = drinksRef.current;

      setDrinks((current) =>
        current.map((d) => (d._id === id ? { ...d, ...updates } : d))
      );

      try {
        await updateRouletteDrink(id, updates);

        const target = prev.find((d) => d._id === id);
        if (!target) return;

        if (updates.weight !== undefined) {
          pushLog("admin", `${target.name}: ${target.weight} → ${updates.weight}`);
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

    if (!drink) {
      pushLog("alert", "Drink not found");
      return { success: false, error: "not_found" };
    }

    const activeDrinks = prev.filter((d) => d && d.active);
    if (activeDrinks.length === 1 && drink.active) {
      pushLog("alert", "Cannot remove last active drink");
      return { success: false, error: "last_active" };
    }

    setDrinks((current) => current.filter((d) => d._id !== id));

    try {
      await deleteRouletteDrink(id);
      pushLog("alert", `Removed '${drink.name}' (Weight: ${drink.weight}, Rarity: ${drink.rarity})`);
      return { success: true };
    } catch (error: unknown) {
      console.error("Error removing drink:", error);
      setDrinks(prev);
      pushLog("alert", "Delete failed");
      return { success: false, error: error instanceof Error ? error.message : "unknown" };
    }
  }, [pushLog]);

  /* ==============================
     SPIN — SpinPhase machine
     idle → launching → spinning (call backend) → revealing (set pendingResult + targetAngle)
  ============================== */
  const spin = useCallback(async () => {
    if (phase !== "idle") return;

    setPhase("launching");

    // Brief launching phase, then start spinning animation
    await new Promise<void>((resolve) => setTimeout(resolve, 150));

    setPhase("spinning");

    try {
      const result = await spinRoulette();

      // Calculate target angle using current drinks
      const currentDrinks = drinksRef.current;
      const tw = currentDrinks.filter((d) => d.active).reduce((a, d) => a + d.weight, 0);
      const angle = calculateTargetAngle(currentDrinks, result.result, tw);

      setPendingResult(result);
      pendingResultRef.current = result;
      setTargetAngle(angle);
      setPhase("revealing");

      // Update local spin stats
      setDrinks((prev) =>
        prev.map((d) =>
          d._id === result.result._id
            ? { ...d, totalSpins: (d.totalSpins ?? 0) + 1, lastSelectedAt: new Date().toISOString() }
            : d
        )
      );

      pushLog("system", `Result → ${result.result.name}`);

      return result;
    } catch {
      pushLog("alert", "Spin failed");
      setPhase("idle");
    }
  }, [phase, pushLog]);

  /* ==============================
     onWheelLanded — called by RouletteWheelRoyale when animation completes
     revealing → landing → (400ms) → revealed
  ============================== */
  const onWheelLanded = useCallback(() => {
    setPhase("landing");

    // Clear any stale timer
    if (landingTimerRef.current) clearTimeout(landingTimerRef.current);

    landingTimerRef.current = setTimeout(() => {
      // Read from ref instead of closed-over state to avoid stale value
      // if a socket update fires between "revealing" and this timer.
      const result = pendingResultRef.current;
      setRevealedResult(result);
      setPendingResult(null);
      pendingResultRef.current = null;
      setPhase("revealed");
    }, 400);
  }, []);

  // Cleanup landing timer on unmount
  useEffect(() => {
    return () => {
      if (landingTimerRef.current) clearTimeout(landingTimerRef.current);
    };
  }, []);

  /* ==============================
     AUTO BALANCE PRO
  ============================== */
  const autoBalance = useCallback(
    async (mode: "equal" | "smart" | "smooth" = "smart") => {
      const current = drinksRef.current.filter((d) => d && d.active);
      if (!current.length) return;

      let updated: RouletteDrink[] = [];

      if (mode === "equal") {
        const weight = Math.floor(100 / current.length);
        updated = current.map((d) => ({ ...d, weight }));
      }

      if (mode === "smooth") {
        const avg = current.reduce((acc, d) => acc + d.weight, 0) / current.length;
        updated = current.map((d) => ({
          ...d,
          weight: Math.round((d.weight + avg) / 2),
        }));
      }

      if (mode === "smart") {
        const now = Date.now();
        updated = current.map((d) => {
          const spins = d.totalSpins ?? 0;
          const last = d.lastSelectedAt ? new Date(d.lastSelectedAt).getTime() : 0;
          const recency = last > 0 ? Math.min((now - last) / 3600000, 24) : 24;
          const weight =
            (1 / (spins + 1)) * 50 + (recency / 24) * 30 + (d.category === "premium" ? 20 : 10);
          return { ...d, weight: Math.round(weight) };
        });
      }

      setDrinks((prev) =>
        prev.map((d) => {
          const found = updated.find((u) => u._id === d._id);
          return found ? found : d;
        })
      );

      const batchUpdates = updated.map((d) => ({ id: d._id, weight: d.weight }));
      await batchUpdateRouletteDrinks(batchUpdates);

      pushLog("admin", `AutoBalance → ${mode.toUpperCase()}`);
    },
    [pushLog]
  );

  /* ==============================
     DERIVED
  ============================== */
  const totalWeight = useMemo(() => {
    return drinks.filter((d) => d && d.active).reduce((acc, d) => acc + d.weight, 0);
  }, [drinks]);

  const drinksWithProbability = useMemo(() => {
    return drinks
      .filter((d) => d !== null)
      .map((d) => ({
        ...d,
        probability: d.active && totalWeight ? (d.weight / totalWeight) * 100 : 0,
      }));
  }, [drinks, totalWeight]);

  /* ==============================
     SOCKETS (MERGE SAFE)
  ============================== */
  useEffect(() => {
    rouletteSocket.onUpdate((data) => {
      setDrinks((prev) => {
        const map = new Map(prev.map((d) => [d._id, d]));
        data.forEach((d) => map.set(d._id, d));
        return Array.from(map.values());
      });
      pushLog("system", "Realtime sync");
    });

    rouletteSocket.onSpin((result) => {
      // Remote spins: show immediately as revealed (no local animation)
      setRevealedResult(result);
      pushLog("event", `Remote → ${result.result.name}`);
    });

    return () => rouletteSocket.offAll();
  }, [pushLog]);

  /* ==============================
     INIT
  ============================== */
  useEffect(() => {
    load();
  }, [load]);

  /* ==============================
     EXPORT
  ============================== */
  return {
    drinks,
    loading,
    // SpinPhase machine
    phase,
    pendingResult,
    revealedResult,
    targetAngle,
    onWheelLanded,
    // Backward compat aliases
    spinning,
    lastResult,
    // Other
    logs,
    totalWeight,
    drinksWithProbability,
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
