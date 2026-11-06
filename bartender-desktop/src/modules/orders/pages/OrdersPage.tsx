"use client";

import { useState, type ReactNode } from "react";
import {
  Plus, RefreshCcw, ChefHat, Zap, Flame, Clock,
  History, LayoutGrid, X, AlertCircle, Search,
} from "lucide-react";

import OrderCard          from "../components/OrderCard/Card";
import NewOrderTablePicker from "../components/NewOrderTablePicker";
import FocusPanel          from "../components/FocusPanel";
import OrderEditModal      from "../components/OrderEditModal";

import { useOrders, type FilterStatus } from "../hooks/useOrders";
import "../../../styles/nebula-theme.css";

/* ── Configuración de tabs ─────────────────────────────────── */
interface TabConfig {
  filter:    FilterStatus;
  label:     string;
  icon:      ReactNode;
  countKey?: "pending" | "inProgress" | "total" | "critical";
  advanced?: boolean; // solo visible en modo avanzado
}

const TABS: TabConfig[] = [
  { filter: "pending",     label: "Pendientes",  icon: <Clock    size={14} />, countKey: "pending"    },
  { filter: "in-progress", label: "En curso",    icon: <Zap      size={14} />, countKey: "inProgress" },
  { filter: "completed",   label: "Historial",   icon: <History  size={14} />,                         advanced: true },
  { filter: "all",         label: "Todo",        icon: <LayoutGrid size={14} />, countKey: "total",   advanced: true },
];

/* ── MetricCard interno ────────────────────────────────────── */
function MetricCard({
  label, value, icon, color, warn,
}: {
  label:  string;
  value:  number;
  icon:   ReactNode;
  color:  "gold" | "orange" | "green" | "red";
  warn?:  boolean;
}) {
  const cfg = {
    gold:   { text: "#F0B429", border: "rgba(240,180,41,0.25)",  bg: "rgba(240,180,41,0.06)"  },
    orange: { text: "#FF7B54", border: "rgba(255,123,84,0.25)",  bg: "rgba(255,123,84,0.06)"  },
    green:  { text: "#3FB950", border: "rgba(63,185,80,0.25)",   bg: "rgba(63,185,80,0.06)"   },
    red:    { text: "#F85149", border: "rgba(248,81,73,0.25)",   bg: "rgba(248,81,73,0.06)"   },
  }[color];

  const activeBorder = warn && value > 0 ? "rgba(248,81,73,0.50)" : cfg.border;

  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3"
      style={{ background: cfg.bg, border: `1px solid ${activeBorder}` }}
    >
      <div
        className="p-2.5 rounded-lg flex-shrink-0"
        style={{ background: `${cfg.text}20`, color: cfg.text }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#566270" }}>
          {label}
        </p>
        <p className="text-2xl font-black" style={{ color: cfg.text }}>{value}</p>
      </div>
    </div>
  );
}

/* ── OrdersPage ────────────────────────────────────────────── */
export default function OrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    loading, error, setError,
    filter, setFilter,
    searchQuery, setSearchQuery,
    tableNumberFilter, setTableNumberFilter,
    selectedItem, setSelectedItem,
    itemStatusLoading,
    editingOrder, setEditingOrder,
    processedOrders, stats, availableTableNumbers,
    fetchOrders,
    handleDelete, handleStatusChange,
    handleItemStatusChange, handleEditOrder,
    salonMode, setSalonMode,
  } = useOrders();

  const visibleTabs = TABS.filter(
    (t) => !t.advanced || salonMode === "advanced"
  );

  return (
    <div
      className="flex flex-col h-full min-h-0"
      style={{ background: "#0D1117", color: "#E6EDF3" }}
    >

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-6 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid #30363D" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.25)" }}
          >
            <ChefHat size={20} style={{ color: "#F0B429" }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#566270" }}>
              Bartender · Comandas
            </p>
            <h1 className="text-2xl font-bold" style={{ color: "#E6EDF3", lineHeight: 1.2 }}>
              Gestión de Pedidos
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2.5 rounded-xl transition-colors"
            style={{ border: "1px solid #30363D", color: "#8B949E" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#3D444D";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#8B949E";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363D";
            }}
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{
              background:  "#F0B429",
              color:       "#0D1117",
              boxShadow:   "0 0 20px rgba(240,180,41,0.25)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#F5C842";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#F0B429";
            }}
          >
            <Plus size={15} /> Nueva orden
          </button>
        </div>
      </div>

      {/* ── TABS DE ESTADO ─────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center px-6"
        style={{ borderBottom: "1px solid #30363D" }}
      >
        {visibleTabs.map((tab) => {
          const isActive = filter === tab.filter;
          const count    = tab.countKey ? stats[tab.countKey] : undefined;

          return (
            <button
              key={tab.filter}
              type="button"
              onClick={() => setFilter(tab.filter)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative"
              style={{
                color:       isActive ? "#F0B429" : "#566270",
                borderBottom: isActive ? "3px solid #F0B429" : "3px solid transparent",
                marginBottom: "-1px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#8B949E";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#566270";
              }}
            >
              {tab.icon}
              {tab.label}
              {count != null && count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                  style={{
                    background: isActive ? "rgba(240,180,41,0.15)" : "#21283A",
                    color:      isActive ? "#F0B429"               : "#566270",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Toggle Simple / Avanzado — a la derecha */}
        <div className="ml-auto flex items-center gap-1 py-2">
          {(["simple", "advanced"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSalonMode(m)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background:   salonMode === m ? "rgba(240,180,41,0.15)" : "transparent",
                color:        salonMode === m ? "#F0B429"               : "#566270",
                border:       salonMode === m ? "1px solid rgba(240,180,41,0.30)" : "1px solid transparent",
              }}
            >
              {m === "simple" ? "Simple" : "Avanzado"}
            </button>
          ))}
        </div>
      </div>

      {/* ── BARRA DE FILTROS ───────────────────────────────── */}
      <div
        className="flex-shrink-0 px-6 py-3 flex flex-wrap items-center gap-3"
        style={{ borderBottom: "1px solid #30363D" }}
      >
        {/* Input de búsqueda */}
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#566270" }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por mesa o producto..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-colors"
            style={{
              background:  "#1C2333",
              border:      "1px solid #30363D",
              color:       "#E6EDF3",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(240,180,41,0.50)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D";
            }}
          />
        </div>

        {/* Chips de mesas activas */}
        {availableTableNumbers.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium" style={{ color: "#566270" }}>
              Mesa:
            </span>
            {availableTableNumbers.map((num) => {
              const active = tableNumberFilter === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTableNumberFilter(active ? null : num)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background:  active ? "rgba(240,180,41,0.15)" : "#1C2333",
                    border:      active ? "1px solid rgba(240,180,41,0.40)" : "1px solid #30363D",
                    color:       active ? "#F0B429"               : "#8B949E",
                  }}
                >
                  {num}
                </button>
              );
            })}
            {tableNumberFilter !== null && (
              <button
                type="button"
                onClick={() => setTableNumberFilter(null)}
                className="transition-colors"
                style={{ color: "#566270" }}
                title="Limpiar filtro de mesa"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── STATS (solo avanzado) ──────────────────────────── */}
      {salonMode === "advanced" && (
        <div
          className="flex-shrink-0 grid grid-cols-4 gap-3 px-6 py-3"
          style={{ borderBottom: "1px solid #30363D" }}
        >
          <MetricCard label="Total"      value={stats.total}      icon={<ChefHat  size={15} />} color="gold"   />
          <MetricCard label="Pendientes" value={stats.pending}    icon={<Clock    size={15} />} color="orange" />
          <MetricCard label="En curso"   value={stats.inProgress} icon={<Zap      size={15} />} color="green"  />
          <MetricCard label="Críticos"   value={stats.critical}   icon={<Flame    size={15} />} color="red"    warn />
        </div>
      )}

      {/* ── ERROR ──────────────────────────────────────────── */}
      {error && (
        <div
          className="flex-shrink-0 mx-6 mt-3 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.30)", color: "#FF6B63" }}
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </span>
          <button type="button" onClick={() => setError(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────── */}
      <div className="flex-1 min-h-0 flex">

        {/* Grid de cards */}
        <div
          className="flex-1 min-w-0 overflow-y-auto p-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative w-12 h-12">
                <div
                  className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "rgba(240,180,41,0.3)", borderTopColor: "#F0B429" }}
                />
              </div>
              <p className="text-sm animate-pulse" style={{ color: "#566270" }}>
                Cargando comandas…
              </p>
            </div>
          ) : processedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
              <div
                className="p-4 rounded-2xl"
                style={{ background: "rgba(240,180,41,0.08)", border: "1px solid rgba(240,180,41,0.15)" }}
              >
                <ChefHat size={40} style={{ color: "#F0B429" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "#566270" }}>
                No hay comandas en este filtro
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
              {processedOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onSelectItem={setSelectedItem}
                  selectedItemId={selectedItem?._id}
                  onEdit={handleEditOrder}
                />
              ))}
            </div>
          )}
        </div>

        {/* Focus Panel */}
        <div
          className="hidden lg:flex w-[300px] flex-shrink-0 flex-col"
          style={{ borderLeft: "1px solid #30363D" }}
        >
          <FocusPanel
            selectedItem={selectedItem}
            onItemStatusChange={handleItemStatusChange}
            statusLoading={itemStatusLoading}
          />
        </div>
      </div>

      {/* ── MODALES ─────────────────────────────────────────── */}
      {isModalOpen && (
        <NewOrderTablePicker
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { fetchOrders(); setIsModalOpen(false); }}
        />
      )}
      {editingOrder && (
        <OrderEditModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSuccess={() => { fetchOrders(); setEditingOrder(null); }}
        />
      )}
    </div>
  );
}
