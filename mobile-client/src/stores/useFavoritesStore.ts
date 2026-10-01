// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Favorites Store
// Favoritos locales persistidos. Si hay token, sincroniza con /auth/favorites.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addFavorite, removeFavorite, getMyFavorites } from '../api/authApi';
import { useAuthStore } from './useAuthStore';

interface FavoritesState {
  favorites: string[];  // array de productId
  loading:   boolean;

  isFavorite:      (productId: string) => boolean;
  toggleFavorite:  (productId: string) => Promise<void>;
  loadFromBackend: () => Promise<void>;
  clearFavorites:  () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      loading:   false,

      isFavorite: (productId) => get().favorites.includes(productId),

      toggleFavorite: async (productId) => {
        const { favorites, isFavorite } = get();
        const token = useAuthStore.getState().token;
        const wasFav = isFavorite(productId);

        // Optimistic update
        set({
          favorites: wasFav
            ? favorites.filter((id) => id !== productId)
            : [...favorites, productId],
        });

        // Sync con backend si hay sesión
        if (token) {
          try {
            if (wasFav) {
              await removeFavorite(productId);
            } else {
              await addFavorite(productId);
            }
          } catch {
            // Revertir si falla
            set({ favorites });
          }
        }
      },

      loadFromBackend: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;
        set({ loading: true });
        try {
          const ids = await getMyFavorites();
          set({ favorites: ids });
        } catch {
          // Silencioso — se usan los favoritos locales
        } finally {
          set({ loading: false });
        }
      },

      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name:    'nebula-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
