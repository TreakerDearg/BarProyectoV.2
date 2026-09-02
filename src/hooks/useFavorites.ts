"use client";

import { useState, useEffect, useCallback } from "react";
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

export function useFavorites(): UseFavoritesReturn {
  const user  = useClienteStore((s) => s.user);
  const token = useClienteStore((s) => s.token);

  const [favorites, setFavorites] = useState<ProductPublicDTO[]>([]);
  const [loading,   setLoading]   = useState(false);

  const isAuthenticated = !!token && !!user;

  // Cargar favoritos cuando hay sesión activa
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    getMyFavorites()
      .then(setFavorites)
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const favoriteIds = new Set(favorites.map((f) => f.id));

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favorites] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;

      const wasFav = favoriteIds.has(productId);

      // Optimistic update
      if (wasFav) {
        setFavorites((prev) => prev.filter((f) => f.id !== productId));
      } else {
        // Agregar un placeholder mínimo para que el Set se actualice
        setFavorites((prev) => [
          ...prev,
          { id: productId } as ProductPublicDTO,
        ]);
      }

      try {
        if (wasFav) {
          await apiRemoveFavorite(productId);
        } else {
          await apiAddFavorite(productId);
          // Recargar para obtener los datos completos del producto
          const updated = await getMyFavorites();
          setFavorites(updated);
        }
      } catch {
        // Revertir si falla
        if (wasFav) {
          setFavorites((prev) => [
            ...prev,
            { id: productId } as ProductPublicDTO,
          ]);
        } else {
          setFavorites((prev) => prev.filter((f) => f.id !== productId));
        }
      }
    },
    [favoriteIds, isAuthenticated]
  );

  return { favorites, favoriteIds, loading, isFavorite, toggleFavorite };
}
