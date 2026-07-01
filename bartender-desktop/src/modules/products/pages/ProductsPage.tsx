import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, HelpCircle, LayoutGrid, List, Target, Zap, Activity, TrendingUp, Package, RefreshCcw, X } from "lucide-react";

import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import ProductDetailDrawer from "../components/ProductDetailDrawer";
import ProductTutorial from "../components/tutorial/ProductTutorial";
import DataExportImport from "../../../components/shared/DataExportImport";
import AdvancedSearchFilter from "../../../components/shared/AdvancedSearchFilter";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

import { useProductSocketEvents } from "../../../hooks/useSocket";
import { useProductTutorial } from "../hooks/useProductTutorial";
import { useProductUiStore } from "../store/productUiStore";

import type { Product } from "../../../types/product";
import "../../../styles/nebula-theme.css";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showExportImport, setShowExportImport] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const handleExport = async (options: { format: "json" | "csv" | "xlsx" }) => {
    try {
      const data = filteredProducts;
      const filename = `productos-export-${new Date().toISOString().split('T')[0]}`;

      // For now, use JSON export as base implementation
      // TODO: Implement Excel export in backend
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
      console.error("Error exporting products:", err);
      setError("Error al exportar productos");
    }
  };

  const handleImport = async () => {
    // Import disabled for now - only export for auditing
    setError("Importación deshabilitada - solo exportación para auditoría");
  };

  // Filter groups for AdvancedSearchFilter
  const filterGroups = [
    {
      id: "category",
      label: "Categoría",
      type: "checkbox" as const,
      options: Array.from(new Set(products.map(p => p.category))).map(cat => ({
        value: cat,
        label: cat,
      })),
      selected: activeFilters["category"] || [],
    },
    {
      id: "type",
      label: "Tipo",
      type: "radio" as const,
      options: [
        { value: "drink", label: "Bebida" },
        { value: "food", label: "Comida" },
      ],
      selected: activeFilters["type"] || [],
    },
    {
      id: "availability",
      label: "Disponibilidad",
      type: "checkbox" as const,
      options: [
        { value: "available", label: "Disponible" },
        { value: "featured", label: "Destacado" },
      ],
      selected: activeFilters["availability"] || [],
    },
  ];

  const {
    isOpen: tutorialOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
  } = useProductTutorial();

  const { mode, setMode, view, toggleView, pageView, setPageView, selectedProduct: storeSelectedProduct, isDrawerOpen } = useProductUiStore();

  /* =========================
     FETCH PRODUCTS
  ========================= */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProducts();

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Error al cargar productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* =========================================================
     REAL-TIME UPDATES VIA SOCKET.IO
  ========================================================= */
  useProductSocketEvents(
    // Producto creado
    (data) => {
      console.log("[Socket] Producto creado:", data);
      if (data.product) {
        setProducts(prev => [...prev, data.product]);
      }
    },
    // Producto actualizado
    (data) => {
      console.log("[Socket] Producto actualizado:", data);
      if (data.product) {
        setProducts(prev => prev.map(p => 
          p._id === data.product._id ? data.product : p
        ));
      }
    },
    // Producto eliminado
    (data) => {
      console.log("[Socket] Producto eliminado:", data);
      if (data.id) {
        setProducts(prev => prev.filter(p => p._id !== data.id));
      }
    },
    // Disponibilidad cambiada
    (data) => {
      console.log("[Socket] Disponibilidad cambiada:", data);
      if (data.id && data.available !== undefined) {
        setProducts(prev => prev.map(p => 
          p._id === data.id ? { ...p, available: data.available as boolean } : p
        ));
      }
    }
  );

  const filteredProducts = useMemo(() => {
    let list = products;

    // Apply search text
    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter((p) =>
        p?.name?.toLowerCase().includes(lower) ||
        p?.category?.toLowerCase().includes(lower) ||
        p?.description?.toLowerCase().includes(lower)
      );
    }

    // Apply category filter
    if (activeFilters["category"]?.length > 0) {
      list = list.filter(p => activeFilters["category"]!.includes(p.category));
    }

    // Apply type filter
    if (activeFilters["type"]?.length > 0) {
      list = list.filter(p => activeFilters["type"]!.includes(p.type));
    }

    // Apply availability filter
    if (activeFilters["availability"]?.length > 0) {
      list = list.filter(p => {
        const filters = activeFilters["availability"]!;
        if (filters.includes("available") && !p.available) return false;
        if (filters.includes("featured") && !p.featured) return false;
        return true;
      });
    }

    return list;
  }, [products, search, activeFilters]);

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.available).length;
    const featured = products.filter((p) => p.featured).length;
    const drinks = products.filter((p) => p.type === 'drink').length;
    const food = products.filter((p) => p.type === 'food').length;
    const avgMargin = products.length > 0 
      ? products.reduce((acc, p) => {
          const margin = p.price > 0 && p.cost > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
          return acc + margin;
        }, 0) / products.length
      : 0;

    return { total, available, featured, drinks, food, avgMargin };
  }, [products]);

  /* =========================
     SAVE (CREATE / UPDATE)
  ========================= */
  const handleSave = async (product: Product) => {
    try {
      if (product._id) {
        await updateProduct(product._id, product);
      } else {
        await createProduct(product);
      }

      setPageView("list");
      setSelectedProduct(null);

      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      const message =
        err instanceof Error ? err.message : "Error al guardar producto";
      setError(message);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setPageView("form");
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: string) => {
    try {
      if (!confirm("¿Eliminar producto?")) return;

      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      const message =
        err instanceof Error ? err.message : "Error al eliminar producto";
      setError(message);
    }
  };

  return (
    <div className="nebula-dashboard-root flex flex-col h-full gap-6 animate-fade-in-up-fusion relative">
      <ProductTutorial
        isOpen={tutorialOpen}
        onClose={() => closeTutorial()}
        onComplete={() => completeTutorial()}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="nebula-aurora" />
      </div>

      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-cyan-500/20 border border-violet-400/30 shadow-[0_0_32px_rgba(139,92,246,0.2)]">
            <Package className="text-violet-200" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Catálogo de Productos
            </h1>
            <p className="text-xs text-white/50 mt-1 flex items-center gap-1.5">
              <Target size={12} className="text-violet-400/70" />
              Product Management · Nebula v3
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AdvancedSearchFilter
            filterGroups={filterGroups}
            onSearch={setSearch}
            onFilterChange={setActiveFilters}
            placeholder="Buscar productos..."
            savedFilters={[]}
            onSaveFilter={() => {}}
            onLoadFilter={() => {}}
          />

          <button
            onClick={() => openTutorial()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
            title="Tutorial de productos"
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
            onClick={fetchProducts}
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
            onClick={() => {
              setSelectedProduct(null);
              setPageView("form");
            }}
            className="nebula-btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            <Plus size={18} />
            <span className="text-xs font-bold tracking-wide uppercase">Nuevo</span>
          </button>
        </div>
      </header>

      {/* KPI DASHBOARD */}
      <div className={`grid gap-4 ${mode === 'simple' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-5'}`}>
        <KPIBox label="Total" value={stats.total} icon={<Package size={18} />} color="violet" />
        <KPIBox label="Disponibles" value={stats.available} icon={<Zap size={18} />} color="cyan" />
        <KPIBox label="Destacados" value={stats.featured} icon={<Activity size={18} />} color="orange" />
        {mode === 'advanced' && (
          <>
            <KPIBox label="Bebidas" value={stats.drinks} icon={<TrendingUp size={18} />} color="violet" />
            <KPIBox label="Comidas" value={stats.food} icon={<TrendingUp size={18} />} color="violet" />
          </>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="nebula-panel border-red-400/30 bg-red-500/10 text-red-300 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* MAIN GRID */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-violet-400/20 animate-spin" />
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
            </div>
            <p className="text-sm text-white/50 mt-4 animate-pulse">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet/10 to-cyan/10 border border-violet/20 mb-4">
              <Package size={48} className="text-violet-300/60" />
            </div>
            <p className="text-white/50 text-sm">
              {search ? "No se encontraron productos" : "No hay productos registrados"}
            </p>
          </div>
        ) : (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={handleEdit}
                onDelete={() => handleDelete(product._id!)}
                simplified={mode === 'simple'}
              />
            ))}
          </div>
        )}
      </div>

      {/* FORM VIEW */}
      {pageView === "form" && (
        <ProductForm
          product={selectedProduct}
          onSave={handleSave}
          onClose={() => {
            setPageView("list");
            setSelectedProduct(null);
          }}
        />
      )}

      {/* DETAIL DRAWER */}
      {isDrawerOpen && storeSelectedProduct && (
        <ProductDetailDrawer
          product={storeSelectedProduct}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* EXPORT/IMPORT PANEL */}
      {showExportImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-3 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ivory">Exportar/Importar Datos</h3>
              <button
                onClick={() => setShowExportImport(false)}
                className="text-muted hover:text-ivory transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <DataExportImport
              data={filteredProducts}
              filename={`productos-${new Date().toISOString().split('T')[0]}`}
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
    violet: "from-violet-500/20 via-purple-500/15 to-violet-600/10 border-violet-400/30",
    cyan: "from-cyan-500/20 via-teal-500/15 to-cyan-600/10 border-cyan-400/30",
    orange: "from-orange-500/20 via-amber-500/15 to-orange-600/10 border-orange-400/30",
  };

  const iconBg = {
    violet: "bg-violet/20 text-violet-400",
    cyan: "bg-cyan/20 text-cyan-400",
    orange: "bg-orange/20 text-orange-400",
  };

  return (
    <div className={`nebula-panel p-4 flex items-center gap-4 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-xl border transition-all hover:scale-[1.02]`}>
      <div className={`p-2.5 rounded-lg ${iconBg[color as keyof typeof iconBg]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
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