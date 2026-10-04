// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — usePointsStore
// Zustand store for loyalty points. Loads from backend when user is logged in.
// Persisted to AsyncStorage — optimistic updates via addLocal().
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyPoints } from '../api/rewardApi';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Movement {
  type:        string;
  amount:      number;
  description: string;
  createdAt:   string;
}

interface PointsState {
  balance:       number;
  totalEarned:   number;
  totalRedeemed: number;
  movements:     Movement[];
  loading:       boolean;
  loadPoints:    () => Promise<void>;
  resetPoints:   () => void;
  /** Optimistically add/deduct points locally (syncs on next loadPoints) */
  addLocal:      (amount: number, description: string) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const usePointsStore = create<PointsState>()(
  persist(
    (set) => ({
      balance:       0,
      totalEarned:   0,
      totalRedeemed: 0,
      movements:     [],
      loading:       false,

      loadPoints: async () => {
        set({ loading: true });
        try {
          const data = await getMyPoints();
          set({
            balance:       data.balance       ?? 0,
            totalEarned:   data.totalEarned   ?? 0,
            totalRedeemed: data.totalRedeemed ?? 0,
            movements:     data.movements     ?? [],
            loading:       false,
          });
        } catch {
          // silently fail — keep last persisted values
          set({ loading: false });
        }
      },

      resetPoints: () =>
        set({ balance: 0, totalEarned: 0, totalRedeemed: 0, movements: [] }),

      addLocal: (amount: number, description: string) =>
        set((state) => ({
          balance: Math.max(0, state.balance + amount),
          totalEarned:
            amount > 0 ? state.totalEarned + amount : state.totalEarned,
          totalRedeemed:
            amount < 0 ? state.totalRedeemed + Math.abs(amount) : state.totalRedeemed,
          movements: [
            {
              type:        amount > 0 ? 'earn' : 'redeem',
              amount,
              description,
              createdAt: new Date().toISOString(),
            },
            ...state.movements,
          ].slice(0, 50),
        })),
    }),
    {
      name:    'nebula-points-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        balance:       s.balance,
        totalEarned:   s.totalEarned,
        totalRedeemed: s.totalRedeemed,
        movements:     s.movements,
      }),
    }
  )
);
