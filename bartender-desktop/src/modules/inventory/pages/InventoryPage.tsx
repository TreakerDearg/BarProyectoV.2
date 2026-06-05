"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Package,
  AlertTriangle,
  Activity,
  RefreshCcw,
  Target,
  TrendingUp,
  LayoutGrid,
  HelpCircle,
  List,
  X
} from "lucide-react";

import InventoryCard from "../components/InventoryCard";
import InventoryForm from "../components/InventoryForm";
import InventoryTutorial from "../components/tutorial/InventoryTutorial";
import InventoryAdvancedPanel from "../components/InventoryAdvancedPanel";
import AdvancedSearchFilter from "../../../components/shared/AdvancedSearchFilter";
import DataExportImport from "../../../components/shared/DataExportImport";

import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../services/inventoryService";

import { useInventoryTutorial } from "../hooks/useInventoryTutorial";
import { useInventoryUiStore } from "../store/inventoryUiStore";
import { useInventorySocketEvents } from "../../../hooks/useSocket";

import type { InventoryItem } from "../types/inventory";
import "../../../styles/nebula-theme.css";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportImport, setShowExportImport] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const {
    isOpen: tutorialOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
  } = useInventoryTutorial();

  const handleExport = async (options: { format: "json" | "csv" | "xlsx" }) => {
    try {
      const data = filteredItems;
      const filename = `inventario-export-${new Date().toISOString().split('T')[0]}`;

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
      console.error("Error exporting inventory:", err);
      setError("Error al exportar inventario");
    }
  };

  const handleImport = async () => {
    setError("Importación deshabilitada - solo exportación para auditoría");
  };

  const { mode, setMode, view, toggleView } = useInventoryUiStore();

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // Filter groups for AdvancedSearchFilter
  const filterGroups = [
    {
      id: "category",
      label: "Categoría",
      type: "checkbox" as const,
      options: Array.from(new Set(items.map(i => i.category))).filter(Boolean).map(cat => ({
        value: cat,
        label: cat,
      })),
      selected: activeFilters["category"] || [],
    },
    {
      id: "sector",
      label: "Sector",
      type: "radio" as const,
      options: [
        { value: "bar", label: "Barra" },
        { value: "kitchen", label: "Cocina" },
        { value: "general", label: "General" },
      ],
      selected: activeFilters["sector"] || [],
    },
    {
      id: "stock",
      label: "Estado de Stock",
      type: "checkbox" as const,
      options: [
        { value: "critical", label: "Crítico" },
        { value: "low", label: "Bajo" },
        { value: "normal", label: "Normal" },
      ],
      selected: activeFilters["stock"] || [],
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getInventory();
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      setError("Fallo en la sincronización de la Bóveda de Insumos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket events for real-time inventory updates
  useInventorySocketEvents(
    (data) => {
      console.log("[Socket] Inventario creado:", data);
      fetchData();
    },
    (data) => {
      console.log("[Socket] Inventario actualizado:", data);
      setItems(prev => prev.map(i => i._id === data.itemId ? { ...i, ...data } : i));
    },
    (data) => {
      console.log("[Socket] Stock cambiado:", data);
      setItems(prev => prev.map(i => i._id === data.itemId ? { ...i, stock: data.stock ?? 0 } : i));
    }
  );

  const filteredItems = useMemo(() => {
    let list = items;

    // Apply search text
    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter((item) =>
        item.name.toLowerCase().includes(lower) ||
        item.category?.toLowerCase().includes(lower)
      );
    }

    // Apply sector filter
    if (activeFilters["sector"]?.length > 0) {
      list = list.filter(i => activeFilters["sector"]!.includes(i.sector?.toLowerCase() || ""));
    }

    // Apply category filter
    if (activeFilters["category"]?.length > 0) {
      list = list.filter(i => activeFilters["category"]!.includes(i.category));
    }

    // Apply stock status filter
    if (activeFilters["stock"]?.length > 0) {
      list = list.filter(i => {
        const filters = activeFilters["stock"]!;
        const stock = Number(i.stock);
        const minStock = Number(i.minStock);
        const isCritical = stock <= minStock;
        const isLow = stock > minStock && stock <= minStock * 1.5;
        const isNormal = stock > minStock * 1.5;

        if (filters.includes("critical") && !isCritical) return false;
        if (filters.includes("low") && !isLow) return false;
        if (filters.includes("normal") && !isNormal) return false;
        return true;
      });
    }

    return list;
  }, [items, search, activeFilters]);

  const stats = useMemo(() => {
    const total = items.length;
    const critical = items.filter((i) => (Number(i.stock) <= Number(i.minStock))).length;
    const totalValue = items.reduce((sum, i) => sum + (Number(i.stock) * Number(i.cost)), 0);
    const lowStock = items.filter(i => Number(i.stock) > Number(i.minStock) && Number(i.stock) <= Number(i.minStock) * 1.5).length;

    return { total, critical, totalValue, lowStock };
  }, [items]);

  const handleExpandToggle = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSave = async (item: InventoryItem) => {
    try {
      if (item._id) await updateInventoryItem(item._id, item);
      else await createInventoryItem(item);
      setOpen(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      setError("Error al registrar movimiento en la Bóveda");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("¿Eliminar permanentemente este insumo de la Bóveda?")) return;
    try {
      await deleteInventoryItem(id);
      fetchData();
    } catch (err) {
      setError("Error al procesar la baja del insumo");
    }
  };

  return (
    <div className="nebula-dashboard-root flex flex-col h-full gap-6 animate-fade-in-up-fusion relative">
      <InventoryTutorial
        isOpen={tutorialOpen}
        onClose={() => closeTutorial()}
        onComplete={completeTutorial}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="nebula-aurora" />
      </div>

      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-400/20 shadow-[0_0_24px_rgba(139,92,246,0.15)]">
            <Package className="text-violet-200" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ivory">
              Bóveda de Insumos
            </h1>
            <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
              <Target size={12} className="text-violet-400/70" />
              Stock & Supply Intelligence · Nebula v3
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AdvancedSearchFilter
            filterGroups={filterGroups}
            onSearch={setSearch}
            onFilterChange={setActiveFilters}
            placeholder="Buscar insumos..."
            savedFilters={[]}
            onSaveFilter={() => {}}
            onLoadFilter={() => {}}
          />

          <button
            onClick={() => openTutorial()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
            title="Tutorial de inventario"
          >
            <HelpCircle size={16} />
            Tutorial
          </button>

          <ModeToggle mode={mode} onChange={setMode} />

          <button
            onClick={toggleView}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
            title={`Vista: ${view === 'grid' ? 'Cuadrícula' : 'Lista'}`}
          >
            {view === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
            title="Actualizar"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setShowExportImport(true)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
            title="Exportar/Importar"
          >
            <Target size={16} />
          </button>

          <button
            onClick={() => { setSelected(null); setOpen(true); }}
            className="nebula-btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            <Plus size={18} />
            <span className="text-xs font-bold tracking-wide uppercase">Nuevo</span>
          </button>
        </div>
      </header>

      {/* KPI DASHBOARD */}
      <div className={`grid gap-4 ${mode === 'simple' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
        <KPIBox label="Insumos Totales" value={stats.total} icon={<LayoutGrid size={18} />} color="violet" />
        <KPIBox label="Críticos" value={stats.critical} icon={<AlertTriangle size={18} className="animate-pulse" />} color="red" />
        {mode === 'advanced' && (
          <>
            <KPIBox label="En Alerta" value={stats.lowStock} icon={<Activity size={18} />} color="orange" />
            <KPIBox label="Valor de Bóveda" value={`$${stats.totalValue.toFixed(0)}`} icon={<TrendingUp size={18} />} color="cyan" />
          </>
        )}
      </div>

      {/* ADVANCED PANEL (mode only) */}
      {mode === 'advanced' && (
        <InventoryAdvancedPanel items={items} />
      )}

      {/* MAIN GRID */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-xl border-2 border-violet-400/30 border-t-violet-300 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-sm text-red text-center max-w-md">{error}</p>
            <button onClick={fetchData} className="nebula-btn-primary px-4 py-2 text-sm">
              Reintentar
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={48} className="text-violet-300/40 mb-4" />
            <p className="text-muted text-sm">No se encontraron insumos</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredItems.map((item) => {
              const averageCost = items.reduce((sum, i) => sum + Number(i.cost), 0) / items.length || 0;
              const stockTrend: 'up' | 'down' | 'stable' = 'stable';
              return (
                <InventoryCard
                  key={item._id}
                  item={item}
                  onEdit={() => { setSelected(item); setOpen(true); }}
                  onDelete={() => handleDelete(item._id)}
                  simplified={mode === 'simple'}
                  expanded={expandedCards.has(item._id!)}
                  onExpandToggle={handleExpandToggle}
                  averageCost={averageCost}
                  lastRestock={item.updatedAt}
                  stockTrend={stockTrend}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {open && (
        <InventoryForm
          item={selected}
          onSave={handleSave}
          onClose={() => { setOpen(false); setSelected(null); }}
        />
      )}

      {/* EXPORT/IMPORT PANEL */}
      {showExportImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-3 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ivory">Exportar/Importar Inventario</h3>
              <button
                onClick={() => setShowExportImport(false)}
                className="text-muted hover:text-ivory transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <DataExportImport
              data={filteredItems}
              filename={`inventario-${new Date().toISOString().split('T')[0]}`}
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

/* =========================
   COMPONENTS
========================= */
function KPIBox({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    violet: "from-violet-500/20 to-violet-600/10 border-violet-400/20",
    red: "from-red-500/20 to-red-600/10 border-red-400/20",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-400/20",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-400/20",
  };

  return (
    <div className={`nebula-panel p-4 flex items-center gap-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="p-2.5 rounded-lg bg-white/5">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted mb-1">{label}</p>
        <p className="text-2xl font-bold text-ivory">{value}</p>
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: 'simple' | 'advanced'; onChange: (mode: 'simple' | 'advanced') => void }) {
  return (
    <div className="nebula-mode-toggle">
      <button
        onClick={() => onChange('simple')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === 'simple' ? 'active' : 'text-muted hover:text-ivory'}`}
      >
        Simple
      </button>
      <button
        onClick={() => onChange('advanced')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === 'advanced' ? 'active' : 'text-muted hover:text-ivory'}`}
      >
        Avanzado
      </button>
    </div>
  );
}