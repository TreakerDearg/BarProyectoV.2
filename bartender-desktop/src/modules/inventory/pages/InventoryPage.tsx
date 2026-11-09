"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus, Package, AlertTriangle, Activity, RefreshCcw,
  TrendingUp, LayoutGrid, HelpCircle, List, X,
  Layers, GlassWater, Flame, DollarSign,
  Search, SlidersHorizontal, CheckCircle,
} from "lucide-react";

import InventoryCard from "../components/InventoryCard";
import InventoryForm from "../components/InventoryForm";
import InventoryDetailDrawer from "../components/InventoryDetailDrawer";
import InventoryAdvancedPanel from "../components/InventoryAdvancedPanel";
import InventoryTutorial from "../components/tutorial/InventoryTutorial";
import DataExportImport from "../../../components/shared/DataExportImport";

import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryCategories,
} from "../services/inventoryService";

import { useInventoryTutorial } from "../hooks/useInventoryTutorial";
import { useInventoryUiStore, type InventoryMode } from "../store/inventoryUiStore";
import { useInventorySocketEvents } from "../../../hooks/useSocket";

import type { InventoryItem } from "../types/inventory";

// ── Helpers ───────────────────────────────────────────────────────

function stockStatus(item: InventoryItem): "critical" | "low" | "normal" {
  const s = Number(item.stock ?? 0);
  const m = Number(item.minStock ?? 0);
  if (s <= m) return "critical";
  if (s <= m * 1.5) return "low";
  return "normal";
}

function fmtMoney(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

// ── Mode toggle de 3 niveles ──────────────────────────────────────

const MODE_OPTIONS: { value: InventoryMode; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "basic",
    label: "Básico",
    desc: "Vista operativa rápida: stock y ajuste ±",
    icon: <Layers size={14} />,
  },
  {
    value: "standard",
    label: "Estándar",
    desc: "Ficha técnica completa: imagen, costos, proveedor y nivel",
    icon: <Package size={14} />,
  },
  {
    value: "advanced",
    label: "Avanzado",
    desc: "Analytics de inventario: valorización, salud y desglose",
    icon: <TrendingUp size={14} />,
  },
];

function ModeToggle({ mode, onChange }: { mode: InventoryMode; onChange: (m: InventoryMode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-[#0D1117] border border-[#30363D] rounded-xl p-1">
      {MODE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.desc}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mode === opt.value
              ? "bg-[#21283A] text-[#F0B429] border border-[#F0B429]/40 shadow-sm"
              : "text-[#8B949E] hover:text-[#E6EDF3]"
            }`}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── KPI box ───────────────────────────────────────────────────────

function KPIBox({
  label, value, icon, variant = "default", helperText,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: "default" | "green" | "gold" | "red" | "orange" | "blue";
  helperText?: string;
}) {
  const variantStyles = {
    default: { text: "text-[#E6EDF3]", iconBg: "bg-[#21283A] text-[#8B949E]", border: "border-[#30363D]" },
    green: { text: "text-[#3FB950]", iconBg: "bg-[rgba(63,185,80,0.12)] text-[#3FB950]", border: "border-[rgba(63,185,80,0.30)]" },
    gold: { text: "text-[#F0B429]", iconBg: "bg-[rgba(240,180,41,0.12)] text-[#F0B429]", border: "border-[rgba(240,180,41,0.30)]" },
    red: { text: "text-[#F85149]", iconBg: "bg-[rgba(248,81,73,0.12)] text-[#F85149]", border: "border-[rgba(248,81,73,0.30)]" },
    orange: { text: "text-[#FF7B54]", iconBg: "bg-[rgba(255,123,84,0.12)] text-[#FF7B54]", border: "border-[rgba(255,123,84,0.30)]" },
    blue: { text: "text-[#388BFD]", iconBg: "bg-[rgba(56,139,253,0.12)] text-[#388BFD]", border: "border-[#30363D]" },
  }[variant];

  return (
    <div className={`p-4 rounded-xl border ${variantStyles.border} bg-[#161B22] flex items-center justify-between gap-3 shadow-sm transition-all hover:border-[#3D444D]`}>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-black ${variantStyles.text} tracking-tight truncate`}>{value}</p>
          {helperText && <span className="text-xs text-[#8B949E] shrink-0">{helperText}</span>}
        </div>
      </div>
      <div className={`p-2.5 rounded-xl ${variantStyles.iconBg} shrink-0`}>
        {icon}
      </div>
    </div>
  );
}

// ── Filtro de stock (pill) ────────────────────────────────────────

const STOCK_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "critical", label: "Crítico" },
  { value: "low", label: "Bajo" },
  { value: "normal", label: "Normal" },
] as const;

type StockFilter = typeof STOCK_FILTERS[number]["value"];

// ── Página Principal de Inventario ───────────────────────────────

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [stockAlert, setStockAlert] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const {
    mode, setMode,
    view, toggleView,
    pageView, setPageView,
    selectedItem, isDrawerOpen,
  } = useInventoryUiStore();

  const { isOpen: tutorialOpen, openTutorial, closeTutorial, completeTutorial } =
    useInventoryTutorial();

  // ── Fetch de datos ────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, cats] = await Promise.all([
        getInventory(),
        getInventoryCategories().catch(() => [] as string[]),
      ]);
      setItems(Array.isArray(inv) ? inv : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch {
      setError("Error al sincronizar el inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Socket.IO Realtime ────────────────────────────────────────

  useInventorySocketEvents(
    () => { fetchData(); },
    (d) => {
      if (!d.itemId) return;
      setItems((current) => current.map((item) =>
        item._id === d.itemId ? { ...item, ...d } : item
      ));
    },
    (d) => {
      if (!d.itemId) return;
      setItems((current) => {
        const item = current.find((entry) => entry._id === d.itemId);
        const nextStock = d.stock ?? 0;
        if (item) {
          const status = stockStatus({ ...item, stock: nextStock });
          if (status !== "normal") {
            setStockAlert(`${item.name}: stock ${status === "critical" ? "crítico" : "bajo"} (${nextStock} ${item.unit})`);
          }
        }
        return current.map((entry) =>
          entry._id === d.itemId ? { ...entry, stock: nextStock } : entry
        );
      });
    }
  );

  useEffect(() => {
    if (!stockAlert) return;
    const timeout = window.setTimeout(() => setStockAlert(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [stockAlert]);

  // ── Categorías derivadas ──────────────────────────────────────

  const derivedCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    return Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
  }, [categories, items]);

  // ── Filtrado de insumos ───────────────────────────────────────

  const filteredItems = useMemo(() => {
    let list = items;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q) ||
          i.supplier?.toLowerCase().includes(q)
      );
    }

    if (sectorFilter) {
      list = list.filter((i) => i.sector === sectorFilter);
    }

    if (stockFilter !== "all") {
      list = list.filter((i) => stockStatus(i) === stockFilter);
    }

    return list;
  }, [items, search, sectorFilter, stockFilter]);

  // ── Estadísticas para KPIs ───────────────────────────────────

  const stats = useMemo(() => {
    const total = items.length;
    const critical = items.filter((i) => stockStatus(i) === "critical").length;
    const low = items.filter((i) => stockStatus(i) === "low").length;
    const normal = items.filter((i) => stockStatus(i) === "normal").length;
    const totalValue = items.reduce((s, i) => s + Number(i.stock ?? 0) * Number(i.cost ?? 0), 0);
    const barItems = items.filter((i) => i.sector === "bar").length;
    const kitItems = items.filter((i) => i.sector === "kitchen").length;
    const activeCount = items.filter((i) => i.isActive).length;
    return { total, critical, low, normal, totalValue, barItems, kitItems, activeCount };
  }, [items]);

  // ── Acciones CRUD ─────────────────────────────────────────────

  const handleSave = async (item: InventoryItem) => {
    try {
      if (item._id) await updateInventoryItem(item._id, item);
      else await createInventoryItem(item);
      setPageView("list");
      setSelected(null);
      fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al guardar el insumo");
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelected(item);
    setPageView("form");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este insumo permanentemente de la bóveda?")) return;
    try {
      await deleteInventoryItem(id);
      fetchData();
    } catch {
      setError("Error al eliminar el insumo");
    }
  };

  // ── Exportación ───────────────────────────────────────────────

  const handleExport = async () => {
    const blob = new Blob([JSON.stringify(filteredItems, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventario-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Columnas del Grid según modo ──────────────────────────────

  const gridCols = useMemo(() => {
    if (view === "list") return "grid-cols-1";
    if (mode === "basic") return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    if (mode === "standard") return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    return "grid-cols-1";
  }, [view, mode]);

  const cardView = view === "list" ? "advanced" : mode;

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full min-h-0 gap-4 bg-[#0D1117] relative overflow-hidden p-4 md:p-6">

      {/* Tutorial */}
      <InventoryTutorial
        isOpen={tutorialOpen}
        onClose={closeTutorial}
        onComplete={completeTutorial}
      />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0 pb-3 border-b border-[#30363D]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[rgba(240,180,41,0.12)] text-[#F0B429] border border-[rgba(240,180,41,0.25)] shadow-sm">
            <Package size={22} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#E6EDF3]">
              Bóveda de Insumos
            </h1>
            <p className="text-xs text-[#8B949E] mt-0.5">
              {stats.total} insumos registrados · {stats.critical > 0
                ? <span className="text-[#F85149] font-bold">{stats.critical} críticos</span>
                : <span className="text-[#3FB950] font-semibold">stock óptimo</span>
              } · modo {MODE_OPTIONS.find((m) => m.value === mode)?.label}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Buscador expandido */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, categoría o proveedor…"
              className="h-9 pl-9 pr-8 rounded-xl bg-[#161B22] border border-[#30363D] text-xs text-[#E6EDF3] placeholder:text-[#8B949E] focus:outline-none focus:border-[#F0B429] w-64 md:w-72 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3]"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Selector de modo */}
          <ModeToggle mode={mode} onChange={setMode} />

          {/* Toggle de vista cuadrícula / lista */}
          <button
            type="button"
            onClick={toggleView}
            title={`Vista: ${view === "grid" ? "cuadrícula" : "lista"}`}
            className="p-2 rounded-xl bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
          >
            {view === "grid" ? <LayoutGrid size={15} /> : <List size={15} />}
          </button>

          {/* Refrescar */}
          <button
            type="button"
            onClick={fetchData}
            title="Sincronizar inventario"
            className="p-2 rounded-xl bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin text-[#F0B429]" : ""} />
          </button>

          {/* Exportar */}
          <button
            type="button"
            onClick={() => setShowExport(true)}
            title="Opciones de exportación"
            className="p-2 rounded-xl bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
          >
            <SlidersHorizontal size={15} />
          </button>

          {/* Tutorial */}
          <button
            type="button"
            onClick={openTutorial}
            title="Tutorial interactivo"
            className="p-2 rounded-xl bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#F0B429] hover:border-[#F0B429]/40 transition-colors"
          >
            <HelpCircle size={15} />
          </button>

          {/* CTA Nuevo Insumo */}
          <button
            type="button"
            onClick={() => { setSelected(null); setPageView("form"); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F0B429] hover:bg-[#D99B16] text-[#0D1117] font-bold text-xs uppercase tracking-wider shadow-sm shadow-[#F0B429]/20 transition-all active:scale-95 ml-1"
          >
            <Plus size={16} />
            <span>Nuevo Insumo</span>
          </button>
        </div>
      </header>

      {/* ── 4 KPIs SIEMPRE EQUILIBRADOS (SIN HUECOS VACÍOS) ────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <KPIBox
          label="Total Insumos"
          value={stats.total}
          helperText={`${stats.activeCount} activos`}
          icon={<Package size={18} />}
          variant="default"
        />
        <KPIBox
          label="Reposición Crítica"
          value={stats.critical}
          helperText={stats.critical > 0 ? "Reposición urgente" : "Niveles seguros"}
          icon={<AlertTriangle size={18} />}
          variant={stats.critical > 0 ? "red" : "green"}
        />
        <KPIBox
          label="Stock en Alerta"
          value={stats.low}
          helperText="Próximo a mínimo"
          icon={<Activity size={18} />}
          variant={stats.low > 0 ? "orange" : "default"}
        />
        {mode === "basic" ? (
          <KPIBox
            label="Insumos en Barra"
            value={stats.barItems}
            helperText={`de ${stats.total} insumos`}
            icon={<GlassWater size={18} />}
            variant="gold"
          />
        ) : (
          <KPIBox
            label="Valorización Total"
            value={fmtMoney(stats.totalValue)}
            helperText="En stock actual"
            icon={<DollarSign size={18} />}
            variant="gold"
          />
        )}
      </div>

      {/* ── FILTROS LIMPIOS (STOCK + SECTORES) ─────────────────── */}
      <div className="flex flex-wrap items-center gap-2 shrink-0 py-1">
        {/* Pills de estado de stock */}
        <div className="flex items-center gap-1.5 bg-[#161B22] p-1 rounded-xl border border-[#30363D]">
          {STOCK_FILTERS.map((f) => {
            const count =
              f.value === "all"
                ? items.length
                : items.filter((i) => stockStatus(i) === f.value).length;

            const isSelected = stockFilter === f.value;

            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStockFilter(f.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isSelected
                    ? f.value === "critical"
                      ? "bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[rgba(248,81,73,0.30)]"
                      : f.value === "low"
                        ? "bg-[rgba(255,123,84,0.15)] text-[#FF7B54] border border-[rgba(255,123,84,0.30)]"
                        : "bg-[#21283A] text-[#F0B429] border border-[#F0B429]/40"
                    : "text-[#8B949E] hover:text-[#E6EDF3] border border-transparent"
                  }`}
              >
                <span>{f.label}</span>
                <span className={`text-xs px-1.5 py-0.2 rounded-md ${isSelected ? "bg-white/10" : "bg-[#0D1117] text-[#8B949E]"
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Separador vertical */}
        <div className="h-5 w-px bg-[#30363D] mx-1 hidden sm:block" />

        {/* Pills de sector operativo */}
        <div className="flex items-center gap-1.5 bg-[#161B22] p-1 rounded-xl border border-[#30363D]">
          {[
            { value: "bar", label: "Barra", icon: <GlassWater size={13} />, count: stats.barItems },
            { value: "kitchen", label: "Cocina", icon: <Flame size={13} />, count: stats.kitItems },
            { value: "general", label: "General", icon: <Layers size={13} />, count: items.filter(i => i.sector === "general").length },
          ].map((s) => {
            const isSelected = sectorFilter === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setSectorFilter(sectorFilter === s.value ? "" : s.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isSelected
                    ? "bg-[#21283A] text-[#388BFD] border border-[#388BFD]/40 shadow-sm"
                    : "text-[#8B949E] hover:text-[#E6EDF3] border border-transparent"
                  }`}
              >
                {s.icon}
                <span>{s.label}</span>
                <span className={`text-xs px-1.5 py-0.2 rounded-md ${isSelected ? "bg-white/10" : "bg-[#0D1117] text-[#8B949E]"
                  }`}>
                  {s.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Botón de limpiar filtros activos */}
        {(search || sectorFilter || stockFilter !== "all") && (
          <button
            type="button"
            onClick={() => { setSearch(""); setSectorFilter(""); setStockFilter("all"); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8B949E] hover:text-[#E6EDF3] bg-[#161B22] border border-[#30363D] transition-colors ml-auto"
          >
            <X size={12} />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* ── Alerta realtime de stock ───────────────────────────── */}
      {stockAlert && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,123,84,0.12)] border border-[rgba(255,123,84,0.30)] text-[#FF7B54] text-xs font-semibold shrink-0 animate-in fade-in" role="status" aria-live="polite">
          <AlertTriangle size={16} className="text-[#FF7B54] shrink-0" />
          <span className="flex-1">{stockAlert}</span>
          <button type="button" onClick={() => setStockAlert(null)} aria-label="Cerrar alerta">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Error Banner ───────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(248,81,73,0.12)] border border-[rgba(248,81,73,0.30)] text-[#F85149] text-xs font-semibold shrink-0">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── ÁREA PRINCIPAL: PANEL AVANZADO O GRID DE INSUMOS ──── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 pb-4 space-y-4">
        {mode === "advanced" && (
          <div className="space-y-4">
            <InventoryAdvancedPanel items={items} />
            <div className="flex items-center justify-between pt-2 pb-1 border-b border-[#30363D]">
              <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
                Auditoría Detallada de Insumos ({filteredItems.length})
              </h3>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-[#F0B429]/30 border-t-[#F0B429] animate-spin" />
            <p className="text-xs text-[#8B949E]">Sincronizando bóveda de insumos…</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3 p-8 rounded-2xl bg-[#161B22] border border-[#30363D]">
            <div className="p-4 rounded-xl bg-[#21283A] text-[#8B949E]">
              <Package size={36} />
            </div>
            <p className="text-sm font-bold text-[#E6EDF3]">
              {search || sectorFilter || stockFilter !== "all"
                ? "Sin resultados para los filtros aplicados"
                : "No hay insumos registrados en la bóveda"}
            </p>
            <p className="text-xs text-[#8B949E] max-w-sm">
              {search || sectorFilter || stockFilter !== "all"
                ? "Intenta modificar el término de búsqueda o limpiar los filtros seleccionados."
                : "Comienza agregando tu primer destilado, licor, jarabe o insumo gastronómico."}
            </p>
            {(search || sectorFilter || stockFilter !== "all") && (
              <button
                type="button"
                onClick={() => { setSearch(""); setSectorFilter(""); setStockFilter("all"); }}
                className="text-xs text-[#F0B429] hover:underline mt-1 font-semibold"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-3.5 ${gridCols}`}>
            {filteredItems.map((item) => (
              <InventoryCard
                key={item._id}
                item={item}
                view={cardView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Formulario Modal / Pantalla Completa ──────────────── */}
      {pageView === "form" && (
        <div className="fixed inset-0 z-50 bg-[#0D1117] flex flex-col">
          <InventoryForm
            item={selected}
            onSave={handleSave}
            onClose={() => { setPageView("list"); setSelected(null); }}
            categoryNames={derivedCategories}
          />
        </div>
      )}

      {/* ── Detail Drawer ─────────────────────────────────────── */}
      {isDrawerOpen && selectedItem && (
        <InventoryDetailDrawer
          item={selectedItem}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* ── Export modal ──────────────────────────────────────── */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#F0B429]" />
                <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">
                  Exportar Inventario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExport(false)}
                className="text-[#8B949E] hover:text-[#E6EDF3] p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <DataExportImport
              data={filteredItems}
              filename={`inventario-${new Date().toISOString().split("T")[0]}`}
              onExport={handleExport}
              onImport={async () => setError("Importación deshabilitada — solo exportación para auditoría")}
              availableFormats={["json"]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
