// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — usePointsStore
// Zustand store for loyalty points. Loads from backend when user is logged in.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import type { ApiResponse } from '../types/api';

interface PointsData {
  balance:      number;
  totalEarned:  number;
}

interface PointsState {
  balance:      number;
  totalEarned:  number;
  loading:      boolean;
  loadPoints:   () => Promise<void>;
  resetPoints:  () => void;
}

export const usePointsStore = create<PointsState>()(
  persist(
    (set) => ({
      balance:     0,
      totalEarned: 0,
      loading:     false,

      loadPoints: async () => {
        set({ loading: true });
        try {
          const res = await api.get<ApiResponse<PointsData>>('/points/my');
          const data = res.data.data;
          set({
            balance:     data.balance     ?? 0,
            totalEarned: data.totalEarned ?? 0,
          });
        } catch {
          // silently fail — keep last persisted values
        } finally {
          set({ loading: false });
        }
      },

      resetPoints: () => set({ balance: 0, totalEarned: 0 }),
    }),
    {
      name:    'nebula-points-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
