"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getPublicPromotions } from "@/lib/api/bartender";
import type { PromotionPublicDTO } from "@/lib/types/api";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface ProductPromotion {
  promoId: string;
  promoName: string;
  type: string;         // "PERCENT" | "FLAT" | "2X1" | "CUSTOM"
  value: number;
  /** Precio final calculado. null si no se puede calcular (2X1, CUSTOM). */
  promoPrice: number | null;
  /** Etiqueta legible para mostrar al usuario */
  label: string;
}

export interface UsePromotionsState {
  promotions: PromotionPublicDTO[];
  loading: boolean;
  /** Error de red — nunca debe romper la carta */
  error: string | null;
  /** true si hubo error pero la carta puede seguir funcionando */
  hasError: boolean;
}

export interface UsePromotionsActions {
  /** Devuelve la mejor promoción para un productId dado, o null si no hay */
  getProductPromotion: (productId: string, basePrice: number) => ProductPromotion | null;
  retry: () => void;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function calcPromoPrice(
  basePrice: number,
  type: string,
  value: number
): number | null {
  switch (type) {
    case "PERCENT":
      return Math.max(0, Math.round(basePrice * (1 - value / 100) * 100) / 100);
    case "FLAT":
      return Math.max(0, Math.round((basePrice - value) * 100) / 100);
    case "2X1":
    case "CUSTOM":
    default:
      return null; // No se calcula un precio fijo
  }
}

function buildLabel(type: string, value: number): string {
  switch (type) {
    case "PERCENT":
      return `-${value}%`;
    case "FLAT":
      return `-$${value.toLocaleString("es-AR")}`;
    case "2X1":
      return "2×1";
    case "CUSTOM":
      return "Promo";
    default:
      return "Oferta";
  }
}

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────

export function usePromotions(): UsePromotionsState & UsePromotionsActions {
  const [promotions, setPromotions] = useState<PromotionPublicDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const aliveRef = useRef(true);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicPromotions();
      if (!aliveRef.current) return;
      setPromotions(data);
      setError(null);
    } catch (e) {
      if (!aliveRef.current) return;
      // No propagamos el error para no romper la carta
      setError(
        e instanceof Error ? e.message : "No se pudieron cargar las promociones"
      );
      setPromotions([]); // Carta sigue funcionando sin promociones
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    fetchPromotions();
    return () => {
      aliveRef.current = false;
    };
  }, [fetchPromotions]);

  // ── Mapa productId → mejor promoción ──────────────────────────
  // Precalculado para lookup O(1) en ProductCard
  const productPromoMap = useMemo(() => {
    const map = new Map<string, PromotionPublicDTO>();
    for (const promo of promotions) {
      if (!promo.active) continue;
      for (const ap of promo.applicableProducts) {
        // Guardia defensiva — ap puede ser undefined o sin id si el backend falla
        if (!ap?.id) continue;
        const existing = map.get(ap.id);
        if (!existing) {
          map.set(ap.id, promo);
        } else {
          // Comparar valor: mayor descuento gana
          const existingDiscount =
            existing.type === "PERCENT"
              ? existing.value
              : existing.type === "FLAT"
              ? (existing.value / (ap.price || 1)) * 100
              : 0;
          const newDiscount =
            promo.type === "PERCENT"
              ? promo.value
              : promo.type === "FLAT"
              ? (promo.value / (ap.price || 1)) * 100
              : 0;
          if (newDiscount > existingDiscount) {
            map.set(ap.id, promo);
          }
        }
      }
    }
    return map;
  }, [promotions]);

  const getProductPromotion = useCallback(
    (productId: string, basePrice: number): ProductPromotion | null => {
      const promo = productPromoMap.get(productId);
      if (!promo) return null;
      const promoPrice = calcPromoPrice(basePrice, promo.type, promo.value);
      return {
        promoId: promo.id,
        promoName: promo.name,
        type: promo.type,
        value: promo.value,
        promoPrice,
        label: buildLabel(promo.type, promo.value),
      };
    },
    [productPromoMap]
  );

  return {
    promotions,
    loading,
    error,
    hasError: error !== null,
    getProductPromotion,
    retry: fetchPromotions,
  };
}
