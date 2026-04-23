// hooks/useDashboard.ts
import { useEffect, useRef } from "react";
import { fetchDashboard } from "../services/dashboardService";
import { useDashboardStore } from "../store/dashboardStore";

export function useDashboard() {
  const { setData, setLoading } = useDashboardStore();

  const abortRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const load = async () => {
    try {
      // cancelar request anterior si existe
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      const data = await fetchDashboard(controller.signal);

      setData(data);
    } catch (err: any) {
      if (err.name === "CanceledError") return;

      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    intervalRef.current = setInterval(() => {
      load();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return useDashboardStore();
}