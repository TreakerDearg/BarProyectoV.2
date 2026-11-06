/**
 * useOrders — Hook centralizado para el módulo de órdenes.
 * Extrae toda la lógica de estado de OrdersPage.
 *
 * REGLA: Solo lógica. Cero JSX ni estilos.
 */
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getOrders,
  deleteOrder,
  updateOrderStatus,
  updateOrderItemStatus,
} from "../services/orderService";
import type { Order } from "../types/order";
import {
  connectSalonSockets,
  onOrderCreated,
  onOrderUpdated,
  onOrderDeleted,
} from "../../../services/socket";
import { useSalonUiStore } from "../../../store/salonUiStore";

/* ── Tipos exportados ──────────────────────────────────────── */
export type FilterStatus =
  | "all"
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled";

export type ItemStatus = "pending" | "preparing" | "ready" | "served";

export interface SelectedItem {
  _id?: string;
  orderId?: string;
  status?: string;
  quantity?: number;
  notes?: string;
  product?: { name?: string; category?: string; type?: string };
}

/* ── Helper de prioridad ───────────────────────────────────── */
export function getOrderPriority(order: Order): number {
  if (!order.createdAt) return 0;
  const minutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  if (minutes > 20) return 3;
  if (minutes > 10) return 2;
  return 1;
}

/* ── Hook principal ────────────────────────────────────────── */
export function useOrders() {
  const [orders, setOrders]                   = useState<Order[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [filter, setFilter]                   = useState<FilterStatus>("pending");
  const [searchQuery, setSearchQuery]         = useState("");
  const [tableNumberFilter, setTableNumberFilter] = useState<number | null>(null);
  const [activeFilters, setActiveFilters]     = useState<Record<string, string[]>>({});
  const [selectedItem, setSelectedItem]       = useState<SelectedItem | null>(null);
  const [itemStatusLoading, setItemStatusLoading] = useState(false);
  const [editingOrder, setEditingOrder]       = useState<Order | null>(null);

  const salonMode   = useSalonUiStore((s) => s.mode);
  const setSalonMode = useSalonUiStore((s) => s.setMode);

  /* ── Fetch ─────────────────────────────────────────────────── */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar las comandas");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Socket real-time ──────────────────────────────────────── */
  useEffect(() => {
    fetchOrders();
    connectSalonSockets();

    const unwrapOrder = (payload: { order?: Order } | Order): Order =>
      (payload as { order?: Order }).order ?? (payload as Order);

    const upsert = (payload: { order?: Order } | Order) => {
      const order = unwrapOrder(payload);
      const orderId = order._id ?? (order as Order & { id?: string }).id;
      if (!orderId) return;
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o._id === orderId);
        const normalized = { ...order, _id: orderId };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = normalized;
          return next;
        }
        return [normalized, ...prev];
      });
    };

    const handleDeleteOrder = (
      payload: Order | string | { id: string }
    ) => {
      const id =
        typeof payload === "string"
          ? payload
          : "id" in payload
          ? payload.id
          : payload._id;
      if (id) setOrders((prev) => prev.filter((o) => o._id !== id));
    };

    const cleanups = [
      onOrderCreated((p) => upsert(p.order as unknown as Order)),
      onOrderUpdated((p) => upsert(p.order as unknown as Order)),
      onOrderDeleted((p) => handleDeleteOrder(p.order?.id ?? "")),
    ];

    return () => cleanups.forEach((fn) => fn());
  }, [fetchOrders]);

  /* ── Handlers ──────────────────────────────────────────────── */
  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteOrder(id);
    } catch {
      setError("No se pudo anular la comanda");
    }
  }, []);

  const handleStatusChange = useCallback(
    async (id: string, status: Order["status"]) => {
      try {
        const updated = await updateOrderStatus(id, status);
        setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
      } catch {
        setError("Error al cambiar el estado de la comanda");
      }
    },
    []
  );

  const handleItemStatusChange = useCallback(
    async (orderId: string, itemId: string, status: ItemStatus) => {
      try {
        setItemStatusLoading(true);
        const updated = await updateOrderItemStatus(orderId, itemId, status);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? updated : o))
        );
        const item = updated.items.find((i) => i._id === itemId);
        if (item) {
          setSelectedItem({
            _id:      item._id,
            orderId,
            status:   item.status,
            quantity: item.quantity,
            notes:    (item as { notes?: string }).notes,
            product:
              typeof item.product === "object" && item.product !== null
                ? {
                    name:     (item.product as { name?: string }).name,
                    category: (item.product as { category?: string }).category,
                    type:     (item.product as { type?: string }).type,
                  }
                : undefined,
          });
        }
      } catch {
        setError("No se pudo actualizar el ítem");
      } finally {
        setItemStatusLoading(false);
      }
    },
    []
  );

  const handleEditOrder = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o._id === orderId);
      if (order) setEditingOrder(order);
    },
    [orders]
  );

  /* ── Órdenes derivadas (filtrado + ordenamiento) ───────────── */
  const processedOrders = useMemo(() => {
    let list = orders.filter((o) =>
      filter === "all" ? true : o.status === filter
    );

    if (salonMode === "simple") {
      list = list.filter(
        (o) => o.status === "pending" || o.status === "in-progress"
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          (o.table as { number?: number })?.number
            ?.toString()
            .includes(q) ||
          o.items.some((i) =>
            (i.product as { name?: string })?.name
              ?.toLowerCase()
              .includes(q)
          )
      );
    }

    if (tableNumberFilter !== null) {
      list = list.filter(
        (o) =>
          (o.table as { number?: number })?.number === tableNumberFilter
      );
    }

    if (activeFilters["status"]?.length > 0) {
      list = list.filter((o) =>
        activeFilters["status"]!.includes(o.status)
      );
    }

    if (activeFilters["priority"]?.length > 0) {
      list = list.filter((o) => {
        const priority = getOrderPriority(o);
        const filters  = activeFilters["priority"]!;
        if (filters.includes("critical") && priority !== 3) return false;
        if (filters.includes("high") && priority !== 2 && priority !== 3)
          return false;
        if (filters.includes("normal") && priority !== 1) return false;
        return true;
      });
    }

    return list.sort((a, b) => {
      const pa = getOrderPriority(a);
      const pb = getOrderPriority(b);
      if (pb !== pa) return pb - pa;
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tA - tB;
    });
  }, [orders, filter, searchQuery, salonMode, activeFilters, tableNumberFilter]);

  /* ── Stats ─────────────────────────────────────────────────── */
  const stats = useMemo(
    () => ({
      total:      orders.length,
      pending:    orders.filter((o) => o.status === "pending").length,
      inProgress: orders.filter((o) => o.status === "in-progress").length,
      critical:   orders.filter(
        (o) => getOrderPriority(o) === 3 && o.status !== "completed"
      ).length,
    }),
    [orders]
  );

  /* ── Números de mesa disponibles para los chips ────────────── */
  const availableTableNumbers = useMemo(() => {
    const active = orders.filter(
      (o) => o.status !== "completed" && o.status !== "cancelled"
    );
    const nums = active
      .map((o) => (o.table as { number?: number })?.number)
      .filter((n): n is number => n != null);
    return [...new Set(nums)].sort((a, b) => a - b);
  }, [orders]);

  /* ── Return ─────────────────────────────────────────────────── */
  return {
    // Estado
    orders,
    loading,
    error,
    setError,

    // Filtros
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    tableNumberFilter,
    setTableNumberFilter,
    activeFilters,
    setActiveFilters,

    // Ítem seleccionado
    selectedItem,
    setSelectedItem,
    itemStatusLoading,

    // Orden en edición
    editingOrder,
    setEditingOrder,

    // Datos derivados
    processedOrders,
    stats,
    availableTableNumbers,

    // Handlers
    fetchOrders,
    handleDelete,
    handleStatusChange,
    handleItemStatusChange,
    handleEditOrder,

    // Salon mode
    salonMode,
    setSalonMode,
  };
}
