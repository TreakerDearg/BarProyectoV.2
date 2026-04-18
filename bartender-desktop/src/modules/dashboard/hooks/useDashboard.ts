// hooks/useDashboard.ts
import { useEffect } from "react";
import { fetchDashboard } from "../services/dashboardService";
import { useDashboardStore } from "../store/dashboardStore";

export function useDashboard() {
  const { setData, setLoading } = useDashboardStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const data = await fetchDashboard();
        setData(data);
      } catch (err) {
        console.error("Dashboard error:", err);
      }

      setLoading(false);
    };

    load();

    const interval = setInterval(load, 30000);

    return () => clearInterval(interval);
  }, []);

  return useDashboardStore();
}