"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useClienteStore } from "@/stores/useClienteStore";
import {
  getMyFavorites,
  addFavorite as apiAddFavorite,
  removeFavorite as apiRemoveFavorite,
} from "@/lib/api/bartender";
import type { ProductPublicDTO } from "@/lib/types/api";

interface UseFavoritesReturn {
  favorites:      ProductPublicDTO[];
  favoriteIds:    Set<string>;
  loading:        boolean;
  isFavorite:     (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
}

/**
 * useFavorites
 * Mantiene el listado de favoritos del usuario autenticado.
 *
 * IMPORTANTE: el backend devuelve _id (Mongoose), pero ProductPublicDTO usa id.
 * La normalización se hace en getMyFavorites() dentro de bartender.ts.
 * Aquí solo asumimos que todos los objetos tienen `id: string` válido.
 */
export function useFavorites(): UseFavoritesReturn {
  const user  = useClienteStore((s) => s.user);
  const token = useClienteStore((s) => s.token);

  const [favorites, setFavorites] = useState<ProductPublicDTO[]>([]);
  const [loading,   setLoading]   = useState(false);

  const isAuthenticated = !!token && !!user;

  // ── Cargar favoritos cuando hay sesión activa ─────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    getMyFavorites()
      .then((data) => {
        // Filtrar entradas sin id válido (guardia defensiva)
        setFavorites(data.filter((f) => !!f?.id));
      })
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // Memoizar el Set para evitar recalcular en cada render
  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.id).filter(Boolean)),
    [favorites]
  );

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;

      const wasFav = favoriteIds.has(productId);

      // Optimistic update — usamos un placeholder mínimo válido
      if (wasFav) {
        setFavorites((prev) => prev.filter((f) => f.id !== productId));
      } else {
        setFavorites((prev) => [
          ...prev,
          { id: productId, name: "", description: "", price: 0, dynamicPrice: 0,
            image: "", type: "drink", drinkStyle: "classic", available: true,
            featured: false, category: "", tags: [], dietaryRestrictions: [] } satisfies ProductPublicDTO,
        ]);
      }

      try {
        if (wasFav) {
          await apiRemoveFavorite(productId);
        } else {
          await apiAddFavorite(productId);
          // Recargar para obtener los datos completos del producto
          const updated = await getMyFavorites();
          setFavorites(updated.filter((f) => !!f?.id));
        }
      } catch {
        // Revertir si falla
        if (wasFav) {
          // Al revertir, volvemos a cargar desde el servidor (más seguro que replicar el objeto)
          getMyFavorites()
            .then((data) => setFavorites(data.filter((f) => !!f?.id)))
            .catch(() => {});
        } else {
          setFavorites((prev) => prev.filter((f) => f.id !== productId));
        }
      }
    },
    [favoriteIds, isAuthenticated]
  );

  return { favorites, favoriteIds, loading, isFavorite, toggleFavorite };
}
