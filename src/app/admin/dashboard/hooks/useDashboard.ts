import { useEffect, useRef } from "react";
import { fetchDashboard } from "../services/dashboardService";
import { useDashboardStore } from "../store/dashboardStore";

export function useDashboard(view: string = "all") {
  const { setData, setLoading } = useDashboardStore();

  const abortRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const load = async () => {
    try {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      const data = await fetchDashboard(controller.signal, view);

      setData(data);
    } catch (err: any) {
      if (err.name === "AbortError" || err.name === "CanceledError") return;
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
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [view]); // Reload when view changes

  return useDashboardStore();
}