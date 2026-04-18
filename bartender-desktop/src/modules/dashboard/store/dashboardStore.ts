// store/dashboardStore.ts
import { create } from "zustand";

type DashboardState = {
  data: any | null;
  loading: boolean;

  setData: (data: any) => void;
  setLoading: (v: boolean) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  loading: false,

  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
}));