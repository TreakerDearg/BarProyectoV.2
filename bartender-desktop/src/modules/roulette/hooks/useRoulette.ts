import { useEffect, useMemo, useState, useCallback } from "react";
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

/* ==============================
   TYPES
============================== */
type LogLevel = "system" | "admin" | "event" | "alert";

interface RouletteLog {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
}

/* ==============================
   CONFIG
============================== */
const MAX_LOGS = 50;

/* ==============================
   HOOK
============================== */
export const useRoulette = () => {
  const [drinks, setDrinks] = useState<RouletteDrink[]>([]);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] =
    useState<RouletteSpinResult | null>(null);
  const [logs, setLogs] = useState<RouletteLog[]>([]);

  /* ==============================
     LOG ENGINE (ANTI DUPLICATE)
  ============================== */
  const pushLog = useCallback(
    (level: LogLevel, message: string) => {
      setLogs((prev) => {
        // ❗ evitar duplicados consecutivos
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
    },
    []
  );

  /* ==============================
     LOAD (SILENT)
  ============================== */
  const load = async (silent = false) => {
    setLoading(true);

    try {
      const data = await getRouletteDrinks();
      setDrinks(data);

      if (!silent) {
        pushLog("system", "Roulette sync OK");
      }
    } catch (err) {
      console.error(err);
      pushLog("alert", "Error cargando ruleta");
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     CREATE
  ============================== */
  const create = async (drink: Partial<RouletteDrink>) => {
    try {
      const newDrink = await createRouletteDrink(drink);

      setDrinks((prev) => [...prev, newDrink]);

      pushLog(
        "event",
        `Added '${newDrink.name}' to roulette`
      );
    } catch {
      pushLog("alert", "Error creando trago");
    }
  };

  /* ==============================
     UPDATE
  ============================== */
  const update = async (
    id: string,
    updates: Partial<RouletteDrink>
  ) => {
    const prevDrink = drinks.find((d) => d._id === id);
    if (!prevDrink) return;

    // optimistic
    setDrinks((prev) =>
      prev.map((d) =>
        d._id === id ? { ...d, ...updates } : d
      )
    );

    try {
      await updateRouletteDrink(id, updates);

      if (updates.weight !== undefined) {
        pushLog(
          "admin",
          `'${prevDrink.name}' weight ${prevDrink.weight} → ${updates.weight}`
        );
      }

      if (updates.active !== undefined) {
        pushLog(
          updates.active ? "system" : "alert",
          `${updates.active ? "Enabled" : "Disabled"} '${prevDrink.name}'`
        );
      }

      if (updates.color) {
        pushLog(
          "event",
          `Color changed for '${prevDrink.name}'`
        );
      }
    } catch (err) {
      console.error(err);
      pushLog("alert", "Update failed");
      await load(true);
    }
  };

  /* ==============================
     DELETE
  ============================== */
  const remove = async (id: string) => {
    const drink = drinks.find((d) => d._id === id);

    try {
      await deleteRouletteDrink(id);

      setDrinks((prev) =>
        prev.filter((d) => d._id !== id)
      );

      if (drink) {
        pushLog(
          "alert",
          `Removed '${drink.name}' from roulette`
        );
      }
    } catch {
      pushLog("alert", "Delete failed");
    }
  };

  /* ==============================
     SPIN (PREPARED FOR ANIMATION)
  ============================== */
  const spin = async () => {
    if (spinning) return;

    setSpinning(true);

    try {
      const result = await spinRoulette();

      // ⚠️ IMPORTANTE:
      // NO setLastResult todavía si vas a animar la ruleta
      // lo vamos a usar después en la wheel

      setLastResult(result);

      pushLog(
        "system",
        `Spin result → '${result.result.name}'`
      );

      return result;
    } catch {
      pushLog("alert", "Spin failed");
    } finally {
      setSpinning(false);
    }
  };

  /* ==============================
     DERIVED
  ============================== */
  const totalWeight = useMemo(() => {
    return drinks.reduce((acc, d) => acc + d.weight, 0);
  }, [drinks]);

  const drinksWithProbability = useMemo(() => {
    return drinks.map((d) => ({
      ...d,
      probability: totalWeight
        ? (d.weight / totalWeight) * 100
        : 0,
    }));
  }, [drinks, totalWeight]);

  /* ==============================
     SOCKETS (CONTROLLED)
  ============================== */
  useEffect(() => {
    rouletteSocket.onUpdate((data) => {
      setDrinks(data);
      pushLog("system", "Realtime sync");
    });

    rouletteSocket.onSpin((result) => {
      setLastResult(result);

      pushLog(
        "event",
        `Remote spin → '${result.result.name}'`
      );
    });

    return () => {
      rouletteSocket.offAll();
    };
  }, [pushLog]);

  /* ==============================
     INIT
  ============================== */
  useEffect(() => {
    load(true); // silent first load
  }, []);

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
    },
  };
};