"use client";

import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
  Plus,
  RefreshCcw,
  Search,
  ChefHat,
  Zap,
  Flame,
  Clock,
  History,
  LayoutGrid,
  X,
  AlertCircle,
  Sparkles,
  HelpCircle,
} from "lucide-react";

import OrderCard from "../components/OrderCard/Card";
import NewOrderTablePicker from "../components/NewOrderTablePicker";
import FocusPanel from "../components/FocusPanel";

import {
  getOrders,
  deleteOrder,
  updateOrderStatus,
  updateOrderItemStatus,
} from "../services/orderService";

import type { Order } from "../types/order";
import { connectSalonSockets, getMainSocket } from "../../../services/socket";
import SalonFlowTutorial from "../../salon/components/SalonFlowTutorial";
import { useSalonTutorial } from "../../salon/hooks/useSalonTutorial";
import { useSalonUiStore } from "../../../store/salonUiStore";
import "../../../styles/nebula-theme.css";

function getOrderPriority(order: Order) {
  if (!order.createdAt) return 0;
  const minutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  if (minutes > 20) return 3;
  if (minutes > 10) return 2;
  return 1;
}

type FilterStatus = "all" | "pending" | "in-progress" | "completed" | "cancelled";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{
    _id?: string;
    orderId?: string;
    status?: string;
    quantity?: number;
    notes?: string;
    product?: { name?: string; category?: string; type?: string };
  } | null>(null);
  const [itemStatusLoading, setItemStatusLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const salonMode = useSalonUiStore((s) => s.mode);
  const setSalonMode = useSalonUiStore((s) => s.setMode);
  const {
    isOpen: salonTutorialOpen,
    openTutorial: openSalonTutorial,
    closeTutorial: closeSalonTutorial,
    completeTutorial: completeSalonTutorial,
  } = useSalonTutorial(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar las comandas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    connectSalonSockets();

    const socket = getMainSocket();
    if (!socket) return;

    const upsert = (order: Order) =>
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o._id === order._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = order;
          return next;
        }
        return [order, ...prev];
      });

    const handleNewOrder = (order: Order) => upsert(order);
    const handleUpdateOrder = (order: Order) => upsert(order);
    const handleDeleteOrder = (payload: Order | string) => {
      const id = typeof payload === "string" ? payload : payload._id;
      if (id) setOrders((prev) => prev.filter((o) => o._id !== id));
    };

    socket.on("order:created", handleNewOrder);
    socket.on("order:update", handleUpdateOrder);
    socket.on("order:updated", handleUpdateOrder);
    socket.on("order:deleted", handleDeleteOrder);

    return () => {
      socket.off("order:created", handleNewOrder);
      socket.off("order:update", handleUpdateOrder);
      socket.off("order:updated", handleUpdateOrder);
      socket.off("order:deleted", handleDeleteOrder);
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteOrder(id);
    } catch {
      setError("No se pudo anular la comanda");
    }
  };

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    try {
      const updatedOrder = await updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? updatedOrder : o))
      );
    } catch {
      setError("Error al cambiar el estado de la comanda");
    }
  };

  const handleItemStatusChange = async (
    orderId: string,
    itemId: string,
    status: "pending" | "preparing" | "ready" | "served"
  ) => {
    try {
      setItemStatusLoading(true);
      const updated = await updateOrderItemStatus(orderId, itemId, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );
      const item = updated.items.find((i) => i._id === itemId);
      if (item) {
        setSelectedItem({
          _id: item._id,
          orderId,
          status: item.status,
          quantity: item.quantity,
          notes: (item as { notes?: string }).notes,
          product:
            typeof item.product === "object" && item.product !== null
              ? {
                  name: (item.product as { name?: string }).name,
                  category: (item.product as { category?: string }).category,
                  type: (item.product as { type?: string }).type,
                }
              : undefined,
        });
      }
    } catch {
      setError("No se pudo actualizar el ítem");
    } finally {
      setItemStatusLoading(false);
    }
  };

  const processedOrders = useMemo(() => {
    let list = orders.filter((o) =>
      filter === "all" ? true : o.status === filter
    );
    if (salonMode === "simple") {
      list = list.filter(
        (o) => o.status === "pending" || o.status === "in-progress"
      );
    }
    if (searchQuery) {
      list = list.filter(
        (o) =>
          (o.table as { number?: number })?.number?.toString().includes(
            searchQuery
          ) ||
          o.items.some((i) =>
            (i.product as { name?: string })?.name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
      );
    }
    return list.sort((a, b) => {
      const pa = getOrderPriority(a);
      const pb = getOrderPriority(b);
      if (pb !== pa) return pb - pa;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    });
  }, [orders, filter, searchQuery, salonMode]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      inProgress: orders.filter((o) => o.status === "in-progress").length,
      critical: orders.filter(
        (o) => getOrderPriority(o) === 3 && o.status !== "completed"
      ).length,
    }),
    [orders]
  );

  return (
    <div className="nebula-salon-root flex h-screen overflow-hidden bg-bg p-4 md:p-6 gap-4 md:gap-6 relative">
      <div className="absolute inset-0 nebula-aurora pointer-events-none -z-10 opacity-40" />
      <SalonFlowTutorial
        isOpen={salonTutorialOpen}
        onClose={closeSalonTutorial}
        onComplete={completeSalonTutorial}
      />

      <div className="w-20 md:w-24 flex flex-col items-center py-6 nebula-panel shrink-0 space-y-6">
        <div className="p-3 rounded-2xl bg-violet-500/15 text-violet-200">
          <Sparkles size={20} />
        </div>

        <NavIcon
          active={filter === "pending"}
          onClick={() => setFilter("pending")}
          icon={<Clock size={18} />}
          label="Pend."
        />
        <NavIcon
          active={filter === "in-progress"}
          onClick={() => setFilter("in-progress")}
          icon={<Zap size={18} />}
          label="Curso"
        />
        {salonMode === "advanced" && (
          <>
            <NavIcon
              active={filter === "completed"}
              onClick={() => setFilter("completed")}
              icon={<History size={18} />}
              label="Hist."
            />
            <NavIcon
              active={filter === "all"}
              onClick={() => setFilter("all")}
              icon={<LayoutGrid size={18} />}
              label="Todo"
            />
          </>
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-12 h-12 rounded-xl nebula-btn-primary flex items-center justify-center"
          title="Nuevo pedido"
        >
          <Plus size={22} />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0 space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-4 px-1">
          <div>
            <p className="text-[10px] text-muted font-semibold uppercase tracking-wide">
              Nebula · Comandas
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-ivory tracking-tight">
              Pedidos en cocina y barra
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="nebula-mode-toggle">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs rounded-lg ${salonMode === "simple" ? "active" : "text-muted"}`}
                onClick={() => setSalonMode("simple")}
              >
                Simple
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs rounded-lg ${salonMode === "advanced" ? "active" : "text-muted"}`}
                onClick={() => setSalonMode("advanced")}
              >
                Avanzado
              </button>
            </div>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Mesa o plato…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-2 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-ivory outline-none focus:border-violet-400/40 w-48 md:w-56"
              />
            </div>

            <button
              type="button"
              onClick={openSalonTutorial}
              className="btn btn-ghost !p-2.5 rounded-xl border border-white/10 text-xs flex items-center gap-1"
            >
              <HelpCircle size={16} />
              Tutorial
            </button>

            <button
              type="button"
              onClick={fetchOrders}
              className="btn btn-ghost !p-2.5 rounded-xl border border-white/10"
            >
              <RefreshCcw
                size={16}
                className={loading ? "animate-spin" : "opacity-50"}
              />
            </button>
          </div>
        </header>

        {salonMode === "advanced" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Total"
              value={stats.total}
              icon={<ChefHat size={14} />}
            />
            <MetricCard
              label="Pendientes"
              value={stats.pending}
              icon={<Clock size={14} />}
            />
            <MetricCard
              label="En curso"
              value={stats.inProgress}
              icon={<Zap size={14} />}
            />
            <MetricCard
              label="Críticos"
              value={stats.critical}
              icon={<Flame size={14} />}
              warn
            />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </span>
            <button type="button" onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {processedOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
              {processedOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onSelectItem={setSelectedItem}
                  selectedItemId={selectedItem?._id}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40 gap-4">
              <ChefHat size={48} />
              <p className="text-sm text-muted">
                No hay comandas en este filtro
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-[300px] md:w-[360px] hidden lg:flex flex-col min-h-0 shrink-0">
        <FocusPanel
          selectedItem={selectedItem}
          onItemStatusChange={handleItemStatusChange}
          statusLoading={itemStatusLoading}
        />
      </div>

      {isModalOpen && (
        <NewOrderTablePicker
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchOrders();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function NavIcon({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 ${active ? "text-violet-200" : "text-muted hover:text-ivory"}`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${
          active
            ? "bg-violet-500/15 border-violet-400/30"
            : "bg-white/5 border-white/10"
        }`}
      >
        {icon}
      </div>
      <span className="text-[8px] font-semibold uppercase">{label}</span>
    </button>
  );
}

function MetricCard({
  label,
  value,
  icon,
  warn,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  warn?: boolean;
}) {
  return (
    <div
      className={`nebula-panel !p-4 flex items-center gap-3 ${warn && value > 0 ? "border-amber-500/30" : ""}`}
    >
      <div className="p-2 rounded-lg bg-violet-500/10 text-violet-200">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-muted uppercase">{label}</p>
        <p className="text-xl font-bold text-ivory">{value}</p>
      </div>
    </div>
  );
}
