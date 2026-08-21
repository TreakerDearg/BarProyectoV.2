"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  getPublicRouletteDrinks,
  spinRoulette,
} from "@/lib/api/bartender";
import { useClienteStore } from "@/stores/useClienteStore";
import type { RouletteDrinkRow } from "@/lib/types/api";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type RoulettePhase =
  | "loading"   // cargando tragos desde la API
  | "idle"      // lista, esperando interacción
  | "spinning"  // rueda girando + esperando resultado del backend
  | "revealing" // resultado recibido, animación terminando en el segmento
  | "result"    // resultado completo, mostrando modal
  | "error"     // error de red o de lógica
  | "empty";    // no hay tragos configurados

export interface SpinResult {
  drink: RouletteDrinkRow;
  targetAngle: number; // ángulo en grados al que debe parar la rueda
}

export interface RouletteState {
  phase: RoulettePhase;
  drinks: RouletteDrinkRow[];
  result: SpinResult | null;
  error: string | null;
  isAddingToCart: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Calcula el ángulo de destino para que el puntero (arriba, -90°)
 * apunte al centro del segmento ganador.
 *
 * La rueda usa conic-gradient(from -90deg), por lo tanto el segmento
 * del primer item empieza en -90° (top). El puntero está en la parte
 * superior de la rueda (posición 0°).
 *
 * Para que el puntero quede sobre el segmento winner, debemos rotar
 * la rueda de forma que el centro de ese segmento quede en la posición
 * del puntero (top = 0° real = 270° del conic).
 *
 * Fórmula:
 *   startAngle = suma de los slices anteriores (en grados desde -90°)
 *   sliceAngle = slice del segmento winner
 *   centerOfSlice = startAngle + sliceAngle / 2
 *
 * La rueda must rotate by:
 *   baseOffset = 270 - centerOfSlice  (para llevar el centro al top)
 *   totalRotation = N * 360 + baseOffset  (N vueltas + ajuste final)
 *   donde N >= 5 para que la animación se vea como "girando de verdad"
 */
export function calculateTargetAngle(
  drinks: RouletteDrinkRow[],
  winnerDrink: RouletteDrinkRow
): number {
  const total = drinks.reduce((s, d) => s + (d.probability ?? 0), 0) || 1;
  let accumulated = 0;

  for (const drink of drinks) {
    const pct = ((drink.probability ?? 0) / total) * 100;
    const sliceDeg = (pct / 100) * 360;

    if (drink._id === winnerDrink._id) {
      const centerOfSlice = accumulated + sliceDeg / 2;
      // 270 grados: la posición top en el conic-gradient (from -90deg)
      const baseOffset = (270 - centerOfSlice + 360) % 360;
      // Siempre al menos 5 vueltas completas para que se vea dramático
      const fullRotations = 5 + Math.floor(Math.random() * 3); // 5-7 vueltas
      return fullRotations * 360 + baseOffset;
    }

    accumulated += sliceDeg;
  }

  // Fallback: solo vueltas sin segmento específico
  return 6 * 360;
}

// ─────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────

export function useRoulette() {
  const [state, setState] = useState<RouletteState>({
    phase: "loading",
    drinks: [],
    result: null,
    error: null,
    isAddingToCart: false,
  });

  // Ref para evitar re-render loops al usar setState dentro de callbacks
  const drinksRef = useRef<RouletteDrinkRow[]>([]);

  // ── Carga inicial de tragos ─────────────────────────────────────
  useEffect(() => {
    let alive = true;

    setState((s) => ({ ...s, phase: "loading" }));

    getPublicRouletteDrinks()
      .then((data) => {
        if (!alive) return;
        drinksRef.current = data;
        setState((s) => ({
          ...s,
          drinks: data,
          phase: data.length === 0 ? "empty" : "idle",
          error: null,
        }));
      })
      .catch((e: Error) => {
        if (!alive) return;
        setState((s) => ({
          ...s,
          phase: "error",
          error: e.message || "No se pudo cargar la ruleta",
        }));
      });

    return () => {
      alive = false;
    };
  }, []);

  // ── Iniciar giro ────────────────────────────────────────────────
  const spin = useCallback(async () => {
    const currentDrinks = drinksRef.current;
    if (!currentDrinks.length) return;

    // Pasar a fase spinning inmediatamente (la rueda empieza a girar)
    setState((s) => ({
      ...s,
      phase: "spinning",
      result: null,
      error: null,
    }));

    try {
      // Llamar al backend mientras la rueda gira visualmente
      const { result: winnerDrink } = await spinRoulette();

      const targetAngle = calculateTargetAngle(
        currentDrinks,
        winnerDrink as RouletteDrinkRow
      );

      // Pasar a "revealing": la rueda ahora termina en el ángulo exacto
      setState((s) => ({
        ...s,
        phase: "revealing",
        result: {
          drink: winnerDrink as RouletteDrinkRow,
          targetAngle,
        },
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        phase: "error",
        error:
          e instanceof Error
            ? e.message
            : "No pudimos preparar la ruleta. Intentá nuevamente.",
      }));
    }
  }, []);

  // ── Cuando la animación termina → mostrar resultado ─────────────
  const onAnimationComplete = useCallback(() => {
    setState((s) => {
      if (s.phase !== "revealing") return s;
      return { ...s, phase: "result" };
    });
  }, []);

  // ── Agregar al carrito ──────────────────────────────────────────
  const addToCart = useCallback(async () => {
    setState((s) => ({ ...s, isAddingToCart: true }));

    try {
      const { useClienteStore: getStore } = await import(
        "@/stores/useClienteStore"
      );
      const store = getStore.getState();
      const drink = state.result?.drink;

      if (drink?.product) {
        const price =
          (drink.product.dynamicPrice ?? drink.product.price) ?? 0;
        store.addToCart({
          productId: drink.product._id,
          name: drink.product.name,
          quantity: 1,
          notes: "",
          price,
        });
      }

      setState((s) => ({ ...s, phase: "idle", result: null, isAddingToCart: false }));
    } catch {
      setState((s) => ({
        ...s,
        isAddingToCart: false,
        error: "No se pudo agregar al carrito",
      }));
    }
  }, [state.result]);

  // ── Volver a girar ──────────────────────────────────────────────
  const spinAgain = useCallback(() => {
    setState((s) => ({ ...s, phase: "idle", result: null, error: null }));
  }, []);

  // ── Reintentar carga ────────────────────────────────────────────
  const retry = useCallback(() => {
    let alive = true;

    setState((s) => ({ ...s, phase: "loading", error: null }));

    getPublicRouletteDrinks()
      .then((data) => {
        if (!alive) return;
        drinksRef.current = data;
        setState((s) => ({
          ...s,
          drinks: data,
          phase: data.length === 0 ? "empty" : "idle",
          error: null,
        }));
      })
      .catch((e: Error) => {
        if (!alive) return;
        setState((s) => ({
          ...s,
          phase: "error",
          error: e.message || "No se pudo cargar la ruleta",
        }));
      });

    return () => {
      alive = false;
    };
  }, []);

  // ── Cerrar modal sin acción ──────────────────────────────────────
  const dismissResult = useCallback(() => {
    setState((s) => ({ ...s, phase: "idle", result: null }));
  }, []);

  return {
    ...state,
    spin,
    onAnimationComplete,
    addToCart,
    spinAgain,
    retry,
    dismissResult,
  };
}
