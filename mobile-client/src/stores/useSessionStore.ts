import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { socketService } from "../socket/socketService";

interface SessionState {
  serviceMode: "table" | "bar";
  tableId: string | null;
  tableNumber: number | null;
  sessionId: string | null;
  tableCode: string | null;

  setServiceMode: (mode: "table" | "bar") => void;
  setTableSession: (tableId: string, sessionId: string, tableNumber: number, tableCode?: string) => void;
  clearTableSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      serviceMode: "table",
      tableId: null,
      tableNumber: null,
      sessionId: null,
      tableCode: null,

      setServiceMode: (serviceMode) => set({ serviceMode }),

      setTableSession: (tableId, sessionId, tableNumber, tableCode) => {
        // Unir automáticamente al room de la mesa por WebSocket
        socketService.joinTable(tableId);

        set({
          serviceMode: "table",
          tableId,
          sessionId,
          tableNumber,
          tableCode: tableCode || null,
        });
      },

      clearTableSession: () => {
        const { tableId } = get();
        if (tableId) {
          socketService.leaveTable(tableId);
        }
        set({
          tableId: null,
          tableNumber: null,
          sessionId: null,
          tableCode: null,
        });
      },
    }),
    {
      name: "nebula-session-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
