"use client";

import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
  Plus,
  RefreshCcw,
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
  Target
} from "lucide-react";

import OrderCard from "../components/OrderCard/Card";
import NewOrderTablePicker from "../components/NewOrderTablePicker";
import FocusPanel from "../components/FocusPanel";
import AdvancedSearchFilter from "../../../components/shared/AdvancedSearchFilter";
import DataExportImport from "../../../components/shared/DataExportImport";

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
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [showExportImport, setShowExportImport] = useState(false);
  const [tableFilter, setTableFilter] = useState<"all" | "1-5" | "6-10" | "11+">("all");

  // Filter groups for AdvancedSearchFilter
  const filterGroups = [
    {
      id: "status",
      label: "Estado",
      type: "checkbox" as const,
      options: [
        { value: "pending", label: "Pendiente" },
        { value: "in-progress", label: "En curso" },
        { value: "completed", label: "Completada" },
        { value: "cancelled", label: "Cancelada" },
      ],
      selected: activeFilters["status"] || [],
    },
    {
      id: "priority",
      label: "Prioridad",
      type: "checkbox" as const,
      options: [
        { value: "critical", label: "Crítica" },
        { value: "high", label: "Alta" },
        { value: "normal", label: "Normal" },
      ],
      selected: activeFilters["priority"] || [],
    },
  ];
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

    // Apply table filter
    if (tableFilter !== "all") {
      list = list.filter(o => {
        const tableNum = (o.table as { number?: number })?.number || 0;
        if (tableFilter === "1-5") return tableNum >= 1 && tableNum <= 5;
        if (tableFilter === "6-10") return tableNum >= 6 && tableNum <= 10;
        if (tableFilter === "11+") return tableNum >= 11;
        return true;
      });
    }

    // Apply status filter
    if (activeFilters["status"]?.length > 0) {
      list = list.filter(o => activeFilters["status"]!.includes(o.status));
    }

    // Apply priority filter
    if (activeFilters["priority"]?.length > 0) {
      list = list.filter(o => {
        const priority = getOrderPriority(o);
        const filters = activeFilters["priority"]!;
        if (filters.includes("critical") && priority !== 3) return false;
        if (filters.includes("high") && priority !== 2 && priority !== 3) return false;
        if (filters.includes("normal") && priority !== 1) return false;
        return true;
      });
    }

    return list.sort((a, b) => {
      const pa = getOrderPriority(a);
      const pb = getOrderPriority(b);
      if (pb !== pa) return pb - pa;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    });
  }, [orders, filter, searchQuery, salonMode, activeFilters, tableFilter]);

  const handleExport = async (options: { format: "json" | "csv" | "xlsx" }) => {
    try {
      const data = processedOrders;
      const filename = `ordenes-export-${new Date().toISOString().split('T')[0]}`;

      if (options.format === "json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error exporting orders:", err);
      setError("Error al exportar órdenes");
    }
  };

  const handleImport = async () => {
    setError("Importación deshabilitada - solo exportación para auditoría");
  };

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
        <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-cyan-500/20 border border-violet-400/30 text-violet-200">
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
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan/20 hover:shadow-cyan/40 transition-all"
          title="Nueva orden"
        >
          <Plus size={24} className="text-white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0 space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-6 px-1">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-cyan-500/20 border border-violet-400/30">
              <ChefHat className="text-violet-200" size={28} />
            </div>
            <div>
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wide">
                Nebula · Comandas
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Órdenes Activas
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="nebula-mode-toggle">
              <button
                type="button"
                className={`px-4 py-2 text-xs rounded-lg ${salonMode === "simple" ? "active" : "text-muted"}`}
                onClick={() => setSalonMode("simple")}
              >
                Simple
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-xs rounded-lg ${salonMode === "advanced" ? "active" : "text-muted"}`}
                onClick={() => setSalonMode("advanced")}
              >
                Avanzado
              </button>
            </div>

            {salonMode === "advanced" && (
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setTableFilter("all")}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
                    tableFilter === "all" ? "bg-cyan/20 text-cyan-400" : "text-white/50 hover:text-white"
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter("1-5")}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
                    tableFilter === "1-5" ? "bg-cyan/20 text-cyan-400" : "text-white/50 hover:text-white"
                  }`}
                >
                  1-5
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter("6-10")}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
                    tableFilter === "6-10" ? "bg-cyan/20 text-cyan-400" : "text-white/50 hover:text-white"
                  }`}
                >
                  6-10
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter("11+")}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
                    tableFilter === "11+" ? "bg-cyan/20 text-cyan-400" : "text-white/50 hover:text-white"
                  }`}
                >
                  11+
                </button>
              </div>
            )}

            <AdvancedSearchFilter
              filterGroups={filterGroups}
              onSearch={setSearchQuery}
              onFilterChange={setActiveFilters}
              placeholder="Buscar por mesa o producto..."
              savedFilters={[]}
              onSaveFilter={() => {}}
              onLoadFilter={() => {}}
            />

            {/* Active Filters Display */}
            {(Object.keys(activeFilters).length > 0 || tableFilter !== "all") && (
              <div className="flex items-center gap-2 flex-wrap">
                {tableFilter !== "all" && (
                  <button
                    onClick={() => setTableFilter("all")}
                    className="px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan-400 text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-cyan/20 transition-all"
                  >
                    <X size={12} />
                    Mesas {tableFilter}
                  </button>
                )}
                {Object.entries(activeFilters).map(([key, values]) =>
                  values.map((value) => (
                    <button
                      key={`${key}-${value}`}
                      onClick={() => {
                        setActiveFilters(prev => ({
                          ...prev,
                          [key]: prev[key]?.filter(v => v !== value) || []
                        }));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-violet/10 border border-violet/30 text-violet-400 text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-violet/20 transition-all"
                    >
                      <X size={12} />
                      {value}
                    </button>
                  ))
                )}
              </div>
            )}

            <button
              type="button"
              onClick={openSalonTutorial}
              className="btn btn-ghost !p-3 rounded-xl border border-white/10 text-xs flex items-center gap-1"
            >
              <HelpCircle size={16} />
              Tutorial
            </button>

            <button
              type="button"
              onClick={() => setShowExportImport(true)}
              className="btn btn-ghost !p-3 rounded-xl border border-white/10"
              title="Exportar/Importar"
            >
              <Target size={16} />
            </button>

            <button
              type="button"
              onClick={fetchOrders}
              className="btn btn-ghost !p-3 rounded-xl border border-white/10"
            >
              <RefreshCcw
                size={16}
                className={loading ? "animate-spin" : "opacity-50"}
              />
            </button>
          </div>
        </header>

        {salonMode === "advanced" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total"
              value={stats.total}
              icon={<ChefHat size={16} />}
              color="violet"
            />
            <MetricCard
              label="Pendientes"
              value={stats.pending}
              icon={<Clock size={16} />}
              color="cyan"
            />
            <MetricCard
              label="En curso"
              value={stats.inProgress}
              icon={<Zap size={16} />}
              color="orange"
            />
            <MetricCard
              label="Críticos"
              value={stats.critical}
              icon={<Flame size={16} />}
              color="red"
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-violet-400/20 animate-spin" />
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
              </div>
              <p className="text-sm text-white/50 mt-4 animate-pulse">Cargando órdenes...</p>
            </div>
          ) : processedOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
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
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet/10 to-cyan/10 border border-violet/20">
                <ChefHat size={48} className="text-violet-300/60" />
              </div>
              <p className="text-sm text-white/50">
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

      {/* EXPORT/IMPORT PANEL */}
      {showExportImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-3 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ivory">Exportar/Importar Órdenes</h3>
              <button
                onClick={() => setShowExportImport(false)}
                className="text-muted hover:text-ivory transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <DataExportImport
              data={processedOrders}
              filename={`ordenes-${new Date().toISOString().split('T')[0]}`}
              onExport={handleExport}
              onImport={handleImport}
              availableFormats={["json"]}
            />
          </div>
        </div>
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
      className={`flex flex-col items-center gap-2 ${active ? "text-violet-200" : "text-muted hover:text-ivory"}`}
    >
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-colors ${
          active
            ? "bg-violet-500/15 border-violet-400/30"
            : "bg-white/5 border-white/10"
        }`}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold uppercase">{label}</span>
    </button>
  );
}

function MetricCard({
  label,
  value,
  icon,
  warn,
  color,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  warn?: boolean;
  color?: string;
}) {
  const colorClasses = {
    violet: "from-violet-500/20 via-purple-500/15 to-violet-600/10 border-violet-400/30",
    cyan: "from-cyan-500/20 via-teal-500/15 to-cyan-600/10 border-cyan-400/30",
    orange: "from-orange-500/20 via-amber-500/15 to-orange-600/10 border-orange-400/30",
    red: "from-red-500/20 via-rose-500/15 to-red-600/10 border-red-400/30",
  };

  const iconBg = {
    violet: "bg-violet/20 text-violet-400",
    cyan: "bg-cyan/20 text-cyan-400",
    orange: "bg-orange/20 text-orange-400",
    red: "bg-red/20 text-red-400",
  };

  const selectedColor = color || "violet";

  return (
    <div
      className={`nebula-panel !p-5 flex items-center gap-4 bg-gradient-to-br ${colorClasses[selectedColor as keyof typeof colorClasses]} rounded-xl border transition-all hover:scale-[1.02] ${warn && value > 0 ? "border-red-500/50" : ""}`}
    >
      <div className={`p-2.5 rounded-lg ${iconBg[selectedColor as keyof typeof iconBg]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-white/60 uppercase">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
