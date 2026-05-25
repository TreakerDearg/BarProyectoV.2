import { create } from "zustand";
import type { DashboardStats } from "../services/dashboardService";

export interface LiveActivityItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "reservation" | "order" | "discount" | "inventory" | "system";
}

export interface DashboardAlert {
  id: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
}

type DashboardState = {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastSync: string | null;
  socketConnected: boolean;
  liveActivities: LiveActivityItem[];
  alerts: DashboardAlert[];

  setData: (data: DashboardStats) => void;
  setLoading: (v: boolean) => void;
  setError: (error: string | null) => void;
  setLastSync: (iso: string) => void;
  setSocketConnected: (v: boolean) => void;
  updateKpis: (kpis: Partial<DashboardStats>) => void;
  patchService: (patch: Partial<DashboardStats>) => void;
  patchSales: (patch: Partial<DashboardStats>) => void;
  patchInventory: (patch: Partial<DashboardStats["inventory"]>) => void;
  patchMetrics: (metrics: {
    activeOrdersCount?: number;
    kitchenLoad?: number;
    barLoad?: number;
  }) => void;
  addActivity: (item: Omit<LiveActivityItem, "id">) => void;
  setActivitiesFromReservations: (reservations: unknown[]) => void;
  pushAlert: (alert: Omit<DashboardAlert, "id">) => void;
  dismissAlert: (id: string) => void;
};

const MAX_ACTIVITIES = 8;
const MAX_ALERTS = 5;

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  lastSync: null,
  socketConnected: false,
  liveActivities: [],
  alerts: [],

  setData: (data) =>
    set({
      data,
      error: null,
      lastSync: data.timestamp ?? new Date().toISOString(),
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastSync: (iso) => set({ lastSync: iso }),
  setSocketConnected: (socketConnected) => set({ socketConnected }),

  updateKpis: (kpis) =>
    set((state) => ({
      data: state.data ? { ...state.data, ...kpis } : null,
      lastSync: new Date().toISOString(),
    })),

  patchService: (patch) =>
    set((state) => ({
      data: state.data ? { ...state.data, ...patch } : null,
      lastSync: new Date().toISOString(),
    })),

  patchSales: (patch) =>
    set((state) => ({
      data: state.data ? { ...state.data, ...patch } : null,
      lastSync: new Date().toISOString(),
    })),

  patchInventory: (patch) =>
    set((state) => ({
      data: state.data
        ? {
            ...state.data,
            inventory: { ...state.data.inventory, ...patch },
          }
        : null,
      lastSync: new Date().toISOString(),
    })),

  patchMetrics: (metrics) =>
    set((state) => ({
      data: state.data ? { ...state.data, ...metrics } : null,
      lastSync: new Date().toISOString(),
    })),

  addActivity: (item) =>
    set((state) => ({
      liveActivities: [
        { ...item, id: `${item.type}-${Date.now()}` },
        ...state.liveActivities,
      ].slice(0, MAX_ACTIVITIES),
    })),

  setActivitiesFromReservations: (reservations) => {
    const list = Array.isArray(reservations) ? reservations : [];
    const items: LiveActivityItem[] = list.map(
      (
        res: {
          name?: string;
          customerName?: string;
          partySize?: number;
          guests?: number;
          startTime?: string;
        },
        i
      ) => ({
        id: `res-${i}-${res.startTime}`,
        title: "Reserva",
        desc: `${res.customerName ?? res.name ?? "Cliente"} · ${res.guests ?? res.partySize ?? "?"} personas`,
        time: res.startTime
          ? new Date(res.startTime).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
        type: "reservation" as const,
      })
    );
    set({ liveActivities: items });
  },

  pushAlert: (alert) =>
    set((state) => ({
      alerts: [
        { ...alert, id: `alert-${Date.now()}` },
        ...state.alerts,
      ].slice(0, MAX_ALERTS),
    })),

  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),
}));
