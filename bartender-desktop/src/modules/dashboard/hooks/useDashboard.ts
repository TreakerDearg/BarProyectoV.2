import { useCallback, useEffect, useRef } from "react";

import { fetchDashboard } from "../services/dashboardService";
import { useDashboardStore } from "../store/dashboardStore";
import {
  socketService,
  connectSalonSockets,
  getMainSocket,
} from "../../../services/socket";

const POLL_MS = 45_000;
const ORDER_REFRESH_DEBOUNCE_MS = 2_500;

export function useDashboard(view: string = "all", range: string = "7") {
  const {
    setData,
    setLoading,
    setError,
    setLastSync,
    setSocketConnected,
    updateKpis,
    patchMetrics,
    patchInventory,
    addActivity,
    setActivitiesFromReservations,
    pushAlert,
  } = useDashboardStore();

  const abortRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const orderRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketsReadyRef = useRef(false);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        if (!opts?.silent) setLoading(true);
        setError(null);

        const data = await fetchDashboard(controller.signal, view, range);
        setData(data);
        setActivitiesFromReservations(data.recentReservations ?? []);
        setLastSync(data.timestamp ?? new Date().toISOString());
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string };
        if (e?.name === "AbortError" || e?.name === "CanceledError") return;
        setError(e?.message ?? "No se pudo cargar el panel");
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [
      view,
      range,
      setData,
      setLoading,
      setError,
      setLastSync,
      setActivitiesFromReservations,
    ]
  );

  const scheduleOrderRefresh = useCallback(() => {
    if (orderRefreshRef.current) clearTimeout(orderRefreshRef.current);
    orderRefreshRef.current = setTimeout(() => load({ silent: true }), ORDER_REFRESH_DEBOUNCE_MS);
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (socketsReadyRef.current) return;
    socketsReadyRef.current = true;

    const token = localStorage.getItem("token") || undefined;
    connectSalonSockets(token);

    const main = getMainSocket();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    const trackingSocket = socketService.getSocket();
    trackingSocket?.on("connect", onConnect);
    trackingSocket?.on("disconnect", onDisconnect);
    main?.on("connect", onConnect);
    main?.on("disconnect", onDisconnect);

    if (socketService.isConnected() || main?.connected) {
      setSocketConnected(true);
    }

    const onKpiUpdate = (payload: { kpis?: Record<string, unknown> }) => {
      if (payload?.kpis) updateKpis(payload.kpis as Parameters<typeof updateKpis>[0]);
    };

    const onMetricsUpdate = (payload: {
      metrics?: {
        activeOrdersCount?: number;
        kitchenLoad?: number;
        barLoad?: number;
      };
    }) => {
      if (payload?.metrics) patchMetrics(payload.metrics);
    };

    const onActivityNew = (payload: {
      activityType?: string;
      description?: string;
      userName?: string;
      timestamp?: string;
      message?: string;
      type?: string;
    }) => {
      const ts = payload.timestamp ?? new Date().toISOString();
      addActivity({
        title: payload.activityType ?? payload.type ?? "Actividad",
        desc:
          payload.description ??
          payload.message ??
          payload.userName ??
          "Evento del sistema",
        time: new Date(ts).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "system",
      });
    };

    const onDiscountApplied = (payload: {
      amount?: number;
      reason?: string;
      table?: string;
      timestamp?: string;
    }) => {
      addActivity({
        title: "Descuento aplicado",
        desc: `${payload.reason ?? "Promoción"} · $${payload.amount ?? 0}${payload.table ? ` · Mesa ${payload.table}` : ""}`,
        time: payload.timestamp
          ? new Date(payload.timestamp).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Ahora",
        type: "discount",
      });
      if (view === "sales") {
        load({ silent: true });
      }
    };

    const onAlert = (payload: {
      type?: string;
      message?: string;
      severity?: "low" | "medium" | "high";
      timestamp?: string;
      data?: { lowStock?: number; outOfStock?: number };
    }) => {
      pushAlert({
        type: payload.type ?? "system",
        message: payload.message ?? "Nueva alerta",
        severity: payload.severity ?? "medium",
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });

      if (payload.type === "inventory") {
        if (payload.data) patchInventory(payload.data);
        if (view === "inventory") load({ silent: true });
      }
    };

    const onOrderEvent = () => scheduleOrderRefresh();

    const onPricingUpdate = () => {
      if (view === "service") load({ silent: true });
    };

    socketService.on("kpi:update", onKpiUpdate);
    socketService.on("metrics:update", onMetricsUpdate);
    socketService.on("activity:new", onActivityNew);
    socketService.on("discount:applied", onDiscountApplied);
    socketService.on("alert:create", onAlert);

    main?.on("order:created", onOrderEvent);
    main?.on("order:updated", onOrderEvent);
    main?.on("order:deleted", onOrderEvent);
    main?.on("pricing:multiplier_updated", onPricingUpdate);

    intervalRef.current = setInterval(() => load({ silent: true }), POLL_MS);

    return () => {
      abortRef.current?.abort();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (orderRefreshRef.current) clearTimeout(orderRefreshRef.current);

      trackingSocket?.off("connect", onConnect);
      trackingSocket?.off("disconnect", onDisconnect);
      main?.off("connect", onConnect);
      main?.off("disconnect", onDisconnect);

      socketService.off("kpi:update", onKpiUpdate);
      socketService.off("metrics:update", onMetricsUpdate);
      socketService.off("activity:new", onActivityNew);
      socketService.off("discount:applied", onDiscountApplied);
      socketService.off("alert:create", onAlert);

      main?.off("order:created", onOrderEvent);
      main?.off("order:updated", onOrderEvent);
      main?.off("order:deleted", onOrderEvent);
      main?.off("pricing:multiplier_updated", onPricingUpdate);

      socketsReadyRef.current = false;
    };
  }, [
    view,
    load,
    updateKpis,
    patchMetrics,
    patchInventory,
    addActivity,
    pushAlert,
    scheduleOrderRefresh,
    setSocketConnected,
  ]);

  const store = useDashboardStore();

  return { ...store, reload: load };
}
