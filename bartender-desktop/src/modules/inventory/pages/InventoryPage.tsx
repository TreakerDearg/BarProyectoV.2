import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus, Package, AlertTriangle, Activity, RefreshCcw,
  TrendingUp, LayoutGrid, HelpCircle, List, X,
  Layers, GlassWater, Flame, DollarSign,
  ChevronDown, Search, SlidersHorizontal,
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

import { useInventoryTutorial }    from "../hooks/useInventoryTutorial";
import { useInventoryUiStore, type InventoryMode } from "../store/inventoryUiStore";
import { useInventorySocketEvents } from "../../../hooks/useSocket";

import type { InventoryItem } from "../types/inventory";
import "../../../styles/nebula-theme.css";

// ── Helpers ───────────────────────────────────────────────────────

function stockStatus(item: InventoryItem): "critical" | "low" | "normal" {
  const s = Number(item.stock ?? 0);
  const m = Number(item.minStock ?? 0);
  if (s <= m)          return "critical";
  if (s <= m * 1.5)    return "low";
  return "normal";
}

function fmtMoney(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  });
}

// ── Mode toggle de 3 niveles ──────────────────────────────────────

const MODE_OPTIONS: { value: InventoryMode; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "basic",
    label: "Básico",
    desc:  "Nombre, stock y ajuste rápido",
    icon:  <Layers size={15} />,
  },
  {
    value: "standard",
    label: "Estándar",
    desc:  "Imagen, costo, proveedor y ajuste",
    icon:  <Package size={15} />,
  },
  {
    value: "advanced",
    label: "Avanzado",
    desc:  "Valor, recetas y forecasting",
    icon:  <TrendingUp size={15} />,
  },
];

function ModeToggle({ mode, onChange }: { mode: InventoryMode; onChange: (m: InventoryMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-xl p-1">
      {MODE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.desc}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            mode === opt.value
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
              : "text-muted hover:text-ivory"
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
  label, value, sub, icon, colorCls, pulse,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  colorCls: string;
  pulse?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border bg-surface-3/50 flex items-center gap-3 ${colorCls}`}>
      <div className={`p-2 rounded-xl ${colorCls} ${pulse ? "animate-pulse" : ""}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted uppercase tracking-widest truncate">{label}</p>
        <p className="text-xl font-bold text-ivory leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-muted/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Filtro de stock (pill) ────────────────────────────────────────

const STOCK_FILTERS = [
  { value: "all",      label: "Todos"    },
  { value: "critical", label: "Crítico"  },
  { value: "low",      label: "Bajo"     },
  { value: "normal",   label: "Normal"   },
] as const;

type StockFilter = typeof STOCK_FILTERS[number]["value"];

// ── Página ────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [items, setItems]           = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected]     = useState<InventoryItem | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  // Filtros
  const [search, setSearch]             = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [stockFilter, setStockFilter]   = useState<StockFilter>("all");

  const {
    mode, setMode,
    view, toggleView,
    pageView, setPageView,
    selectedItem, isDrawerOpen,
  } = useInventoryUiStore();

  const { isOpen: tutorialOpen, openTutorial, closeTutorial, completeTutorial } =
    useInventoryTutorial();

  // ── Fetch ──────────────────────────────────────────────────────

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

  // ── Socket.IO ─────────────────────────────────────────────────

  useInventorySocketEvents(
    () => { fetchData(); },
    (d) => { if (d.itemId) setItems((p) => p.map((i) => i._id === d.itemId ? { ...i, ...d } : i)); },
    (d) => { if (d.itemId) setItems((p) => p.map((i) => i._id === d.itemId ? { ...i, stock: d.stock ?? 0 } : i)); }
  );

  // ── Categorías derivadas ──────────────────────────────────────

  const derivedCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    return Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
  }, [categories, items]);

  // ── Filtrado — lógica corregida (OR dentro del grupo) ─────────

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

  // ── Estadísticas ──────────────────────────────────────────────

  const stats = useMemo(() => {
    const total      = items.length;
    const critical   = items.filter((i) => stockStatus(i) === "critical").length;
    const low        = items.filter((i) => stockStatus(i) === "low").length;
    const totalValue = items.reduce((s, i) => s + Number(i.stock ?? 0) * Number(i.cost ?? 0), 0);
    const barItems   = items.filter((i) => i.sector === "bar").length;
    const kitItems   = items.filter((i) => i.sector === "kitchen").length;
    return { total, critical, low, totalValue, barItems, kitItems };
  }, [items]);

  // ── CRUD ──────────────────────────────────────────────────────

  const handleSave = async (item: InventoryItem) => {
    try {
      if (item._id) await updateInventoryItem(item._id, item);
      else           await createInventoryItem(item);
      setPageView("list");
      setSelected(null);
      fetchData();
    } catch (e: any) {
      setError(e?.message || "Error al guardar el insumo");
    }
  };

  const handleEdit   = (item: InventoryItem) => { setSelected(item); setPageView("form"); };
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este insumo permanentemente?")) return;
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
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `inventario-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Grid columns según modo ───────────────────────────────────

  const gridCols = useMemo(() => {
    if (view === "list")         return "grid-cols-1";
    if (mode === "basic")        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
    if (mode === "standard")     return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    return "grid-cols-1"; // advanced — lista horizontal siempre
  }, [view, mode]);

  const cardView = view === "list" ? "advanced" : mode;

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="nebula-dashboard-root flex flex-col h-full min-h-0 gap-5 animate-fade-in-up-fusion relative overflow-hidden">

      {/* Tutorial */}
      <InventoryTutorial
        isOpen={tutorialOpen}
        onClose={closeTutorial}
        onComplete={completeTutorial}
      />

      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="nebula-aurora" />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-400/20 shadow-[0_0_24px_rgba(139,92,246,0.15)]">
            <Package className="text-violet-200" size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ivory">
              Bóveda de Insumos
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {stats.total} insumos · {stats.critical > 0
                ? <span className="text-red-400">{stats.critical} críticos</span>
                : "stock OK"
              } · modo {MODE_OPTIONS.find((m) => m.value === mode)?.label}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* Búsqueda */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar insumo…"
              className="h-9 pl-8 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-ivory placeholder:text-muted/50 focus:outline-none focus:border-violet-400/40 w-44"
            />
          </div>

          {/* Filtro sector */}
          <div className="relative">
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="h-9 pl-3 pr-7 rounded-xl bg-white/5 border border-white/10 text-xs text-ivory focus:outline-none focus:border-violet-400/40 appearance-none cursor-pointer"
            >
              <option value="">Todos los sectores</option>
              <option value="bar">Barra</option>
              <option value="kitchen">Cocina</option>
              <option value="general">General</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          <ModeToggle mode={mode} onChange={setMode} />

          <button
            type="button"
            onClick={toggleView}
            title={`Vista: ${view === "grid" ? "cuadrícula" : "lista"}`}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors"
          >
            {view === "grid" ? <LayoutGrid size={15} /> : <List size={15} />}
          </button>

          <button
            type="button"
            onClick={fetchData}
            title="Actualizar"
            className="flex items-center px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={() => setShowExport(true)}
            title="Exportar"
            className="flex items-center px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors"
          >
            <SlidersHorizontal size={15} />
          </button>

          <button
            type="button"
            onClick={openTutorial}
            title="Tutorial"
            className="flex items-center px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-violet-300 hover:border-violet-400/20 transition-colors"
          >
            <HelpCircle size={15} />
          </button>

          <button
            type="button"
            onClick={() => { setSelected(null); setPageView("form"); }}
            className="nebula-btn-primary flex items-center gap-2 px-4 py-2"
          >
            <Plus size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Nuevo</span>
          </button>
        </div>
      </header>

      {/* ── KPIs adaptativos ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        <KPIBox
          label="Total insumos"
          value={stats.total}
          icon={<LayoutGrid size={17} />}
          colorCls="from-violet-500/15 border-violet-500/25 bg-gradient-to-br"
        />
        <KPIBox
          label="Críticos"
          value={stats.critical}
          sub={stats.critical > 0 ? "Reposición urgente" : undefined}
          icon={<AlertTriangle size={17} />}
          colorCls="from-red-500/15 border-red-500/25 bg-gradient-to-br"
          pulse={stats.critical > 0}
        />
        {/* Solo en standard y advanced */}
        {mode !== "basic" && (
          <>
            <KPIBox
              label="Stock bajo"
              value={stats.low}
              icon={<Activity size={17} />}
              colorCls="from-amber-500/15 border-amber-500/25 bg-gradient-to-br"
            />
            <KPIBox
              label="Valor total"
              value={fmtMoney(stats.totalValue)}
              icon={<DollarSign size={17} />}
              colorCls="from-cyan-500/15 border-cyan-500/25 bg-gradient-to-br"
            />
          </>
        )}
      </div>

      {/* ── Panel avanzado — solo en modo advanced ─────────────── */}
      {mode === "advanced" && (
        <InventoryAdvancedPanel items={items} />
      )}

      {/* ── Filtros de stock (pills) — CORREGIDO: OR dentro del grupo ── */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        {STOCK_FILTERS.map((f) => {
          const count =
            f.value === "all"
              ? items.length
              : items.filter((i) => stockStatus(i) === f.value).length;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setStockFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                stockFilter === f.value
                  ? f.value === "critical"
                    ? "bg-red-500/20 border-red-500/40 text-red-300"
                    : f.value === "low"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-violet-500/20 border-violet-500/40 text-violet-300"
                  : "bg-white/3 border-white/8 text-muted hover:border-white/18 hover:text-ivory"
              }`}
            >
              {f.label}
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full ${
                stockFilter === f.value ? "bg-white/10" : "bg-white/5 text-muted/70"
              }`}>
                {count}
              </span>
            </button>
          );
        })}

        {/* Filtros de sector como pills adicionales */}
        <div className="flex items-center gap-1.5 ml-2">
          {[
            { value: "bar",     label: "Barra",   icon: <GlassWater size={11} />, color: "text-amber-400 border-amber-500/30 bg-amber-500/10"  },
            { value: "kitchen", label: "Cocina",  icon: <Flame      size={11} />, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
            { value: "general", label: "General", icon: <Layers     size={11} />, color: "text-violet-400 border-violet-500/30 bg-violet-500/10" },
          ].map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSectorFilter(sectorFilter === s.value ? "" : s.value)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all ${
                sectorFilter === s.value
                  ? s.color
                  : "bg-white/3 border-white/8 text-muted hover:border-white/18 hover:text-ivory"
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {(search || sectorFilter || stockFilter !== "all") && (
          <button
            type="button"
            onClick={() => { setSearch(""); setSectorFilter(""); setStockFilter("all"); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] text-muted/60 hover:text-muted transition-colors"
          >
            <X size={10} /> Limpiar
          </button>
        )}
      </div>

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex-shrink-0">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Grid principal ────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-0.5 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-violet-400/20 animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
            </div>
            <p className="text-xs text-muted animate-pulse">Cargando inventario…</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
              <Package size={40} className="text-violet-300/40" />
            </div>
            <p className="text-sm font-semibold text-ivory/60">
              {search || sectorFilter || stockFilter !== "all"
                ? "Sin resultados para los filtros aplicados"
                : "No hay insumos registrados"}
            </p>
            {(search || sectorFilter || stockFilter !== "all") && (
              <button
                type="button"
                onClick={() => { setSearch(""); setSectorFilter(""); setStockFilter("all"); }}
                className="text-xs text-violet-400 hover:text-violet-300 underline transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-[10px] text-muted mb-3 uppercase tracking-widest">
              {filteredItems.length} insumo{filteredItems.length !== 1 ? "s" : ""}
              {stockFilter !== "all" ? ` · ${STOCK_FILTERS.find((f) => f.value === stockFilter)?.label}` : ""}
              {sectorFilter ? ` · ${sectorFilter}` : ""}
            </p>
            <div className={`grid gap-3 ${gridCols}`}>
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
          </>
        )}
      </div>

      {/* ── Formulario (overlay) ──────────────────────────────── */}
      {pageView === "form" && (
        <div className="absolute inset-0 z-30 bg-surface-2 flex flex-col">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-surface-3 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-ivory">Exportar inventario</h3>
              <button type="button" onClick={() => setShowExport(false)} className="text-muted hover:text-ivory">
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

      {/* ── Tutorial ──────────────────────────────────────────── */}
      {tutorialOpen && (
        <InventoryTutorial
          isOpen={tutorialOpen}
          onClose={closeTutorial}
          onComplete={completeTutorial}
        />
      )}
    </div>
  );
}
