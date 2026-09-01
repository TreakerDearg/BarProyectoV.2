import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus, HelpCircle, LayoutGrid, List, Target, Zap, Activity,
  TrendingUp, Package, RefreshCcw, X, SlidersHorizontal,
  Rows3, Rows4, ChefHat, GlassWater,
} from "lucide-react";

import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import ProductDetailDrawer from "../components/ProductDetailDrawer";
import ProductTutorial from "../components/tutorial/ProductTutorial";
import DataExportImport from "../../../components/shared/DataExportImport";
import AdvancedSearchFilter from "../../../components/shared/AdvancedSearchFilter";

import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductCategory,
} from "../services/productService";

import { useProductSocketEvents }  from "../../../hooks/useSocket";
import { useProductTutorial }      from "../hooks/useProductTutorial";
import { useProductUiStore, type ProductMode } from "../store/productUiStore";

import type { Product } from "../../../types/product";
import "../../../styles/nebula-theme.css";

// ── Helpers ───────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

// ── Página ────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts]           = useState<Product[]>([]);
  const [categories, setCategories]       = useState<ProductCategory[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading]             = useState(true);
  const [catsLoading, setCatsLoading]     = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [search, setSearch]               = useState("");
  const [showExportImport, setShowExportImport] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const {
    mode, setMode,
    view, setView, toggleView,
    pageView, setPageView,
    activeCategory, setActiveCategory,
    selectedProduct: storeSelectedProduct,
    isDrawerOpen,
  } = useProductUiStore();

  const { isOpen: tutorialOpen, openTutorial, closeTutorial, completeTutorial } = useProductTutorial();

  // ── Fetch ──────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al cargar productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCatsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      // silencioso — las categorías se derivan de los productos como fallback
    } finally {
      setCatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // ── Categorías derivadas (fallback si /categories falla) ───────
  const derivedCategories: ProductCategory[] = useMemo(() => {
    if (categories.length > 0) return categories;
    const map = new Map<string, { count: number; drinks: number; food: number }>();
    for (const p of products) {
      const cat = p.category?.trim() || "sin categoría";
      const entry = map.get(cat) ?? { count: 0, drinks: 0, food: 0 };
      entry.count++;
      if (p.type === "drink") entry.drinks++;
      else entry.food++;
      map.set(cat, entry);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, stats]) => ({
        id: name, name, sampleImage: null, featured: 0, available: 0, ...stats,
      }));
  }, [categories, products]);

  // ── Socket.IO en tiempo real ───────────────────────────────────
  useProductSocketEvents(
    (d) => { if (d.product) setProducts((p) => [...p, d.product]); },
    (d) => { if (d.product) setProducts((p) => p.map((x) => x._id === d.product._id ? d.product : x)); },
    (d) => { if (d.id) setProducts((p) => p.filter((x) => x._id !== d.id)); },
    (d) => { if (d.id != null) setProducts((p) => p.map((x) => x._id === d.id ? { ...x, available: d.available } : x)); }
  );

  // ── Filtrado ───────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = products;

    // Categoría del selector rápido
    if (activeCategory) {
      list = list.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    // Búsqueda de texto
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p?.name?.toLowerCase().includes(q) ||
        p?.category?.toLowerCase().includes(q) ||
        p?.description?.toLowerCase().includes(q) ||
        p?.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filtros avanzados
    if (activeFilters["category"]?.length > 0) {
      list = list.filter((p) => activeFilters["category"]!.includes(p.category));
    }
    if (activeFilters["type"]?.length > 0) {
      list = list.filter((p) => activeFilters["type"]!.includes(p.type));
    }
    if (activeFilters["availability"]?.length > 0) {
      list = list.filter((p) => {
        const f = activeFilters["availability"]!;
        if (f.includes("available") && !p.available) return false;
        if (f.includes("featured")  && !p.featured)  return false;
        return true;
      });
    }

    return list;
  }, [products, activeCategory, search, activeFilters]);

  // ── Estadísticas ───────────────────────────────────────────────
  const stats = useMemo(() => {
    const total     = products.length;
    const available = products.filter((p) => p.available).length;
    const featured  = products.filter((p) => p.featured).length;
    const drinks    = products.filter((p) => p.type === "drink").length;
    const food      = products.filter((p) => p.type === "food").length;
    const avgMargin = total > 0
      ? products.reduce((acc, p) => {
          const m = p.price > 0 && (p.cost ?? 0) > 0
            ? ((p.price - (p.cost ?? 0)) / p.price) * 100
            : 0;
          return acc + m;
        }, 0) / total
      : 0;
    return { total, available, featured, drinks, food, avgMargin };
  }, [products]);

  // ── Acciones CRUD ──────────────────────────────────────────────
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
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar producto");
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setPageView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await deleteProduct(id);
      fetchProducts();
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const handleExport = async (options: { format: string }) => {
    const filename = `productos-${new Date().toISOString().split("T")[0]}`;
    const blob = new Blob([JSON.stringify(filteredProducts, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${filename}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setError("Importación deshabilitada — solo exportación para auditoría");
  };

  // ── Grid columns según modo ────────────────────────────────────
  const gridCols = view === "list"
    ? "grid-cols-1"
    : mode === "simple"
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      : mode === "standard"
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1";

  // ── View level para ProductCard ────────────────────────────────
  const viewLevel = view === "list" ? "advanced" : mode;

  // ── FilterGroups ───────────────────────────────────────────────
  const filterGroups = [
    {
      id: "type",
      label: "Tipo",
      type: "radio" as const,
      options: [
        { value: "drink", label: "Bebida" },
        { value: "food",  label: "Comida" },
      ],
      selected: activeFilters["type"] || [],
    },
    {
      id: "availability",
      label: "Estado",
      type: "checkbox" as const,
      options: [
        { value: "available", label: "Disponible" },
        { value: "featured",  label: "Destacado"  },
      ],
      selected: activeFilters["availability"] || [],
    },
  ];

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="nebula-page flex flex-col gap-6 min-h-0 h-full overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-ivory tracking-tight">Productos</h1>
          <p className="text-xs text-muted mt-0.5">
            {stats.total} productos · {stats.available} disponibles · {stats.drinks} bebidas · {stats.food} comidas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto…"
              className="h-9 pl-8 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-ivory placeholder:text-muted/50 focus:outline-none focus:border-violet/40 w-44"
            />
            <SlidersHorizontal size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          <AdvancedSearchFilter
            filterGroups={filterGroups}
            onFilterChange={setActiveFilters}
            onSaveFilter={() => {}}
            onLoadFilter={() => {}}
          />

          <ModeToggle mode={mode} onChange={setMode} />

          <button
            onClick={toggleView}
            title={`Vista: ${view === "grid" ? "cuadrícula" : "lista"}`}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors"
          >
            {view === "grid" ? <LayoutGrid size={15} /> : <List size={15} />}
          </button>

          <button
            onClick={fetchProducts}
            title="Actualizar"
            className="flex items-center px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setShowExportImport(true)}
            title="Exportar"
            className="flex items-center px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors"
          >
            <Target size={15} />
          </button>

          <button
            onClick={() => openTutorial()}
            title="Tutorial"
            className="flex items-center px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-violet-300 hover:border-violet/20 transition-colors"
          >
            <HelpCircle size={15} />
          </button>

          <button
            onClick={() => { setSelectedProduct(null); setPageView("form"); }}
            className="nebula-btn-primary flex items-center gap-2 px-4 py-2"
          >
            <Plus size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Nuevo</span>
          </button>
        </div>
      </header>

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        <KPIBox label="Total"      value={stats.total}     icon={<Package  size={17} />} color="violet" />
        <KPIBox label="Disponibles" value={stats.available} icon={<Zap      size={17} />} color="cyan"   />
        <KPIBox label="Destacados" value={stats.featured}  icon={<Activity size={17} />} color="gold"   />
        <KPIBox
          label="Margen prom."
          value={`${Math.round(stats.avgMargin)}%`}
          icon={<TrendingUp size={17} />}
          color="emerald"
        />
      </div>

      {/* ── Selector de categorías ─────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0 scrollbar-none">
        <CategoryPill
          name="Todos"
          count={products.length}
          active={activeCategory === ""}
          onClick={() => setActiveCategory("")}
        />
        {derivedCategories.map((cat) => (
          <CategoryPill
            key={cat.id}
            name={cat.name}
            count={cat.count}
            drinks={cat.drinks}
            food={cat.food}
            active={activeCategory.toLowerCase() === cat.name.toLowerCase()}
            onClick={() => setActiveCategory(
              activeCategory.toLowerCase() === cat.name.toLowerCase() ? "" : cat.name
            )}
          />
        ))}
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red/10 border border-red/20 text-red-300 text-xs flex-shrink-0">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Grid de productos ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-0.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-violet/20 animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
            </div>
            <p className="text-xs text-muted mt-4 animate-pulse">Cargando productos…</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet/10 to-cyan/10 border border-violet/20">
              <Package size={44} className="text-violet-300/50" />
            </div>
            <p className="text-sm font-semibold text-ivory/60">
              {search || activeCategory ? "Sin resultados" : "No hay productos registrados"}
            </p>
            {(search || activeCategory) && (
              <button
                onClick={() => { setSearch(""); setActiveCategory(""); }}
                className="text-xs text-violet-400 hover:text-violet-300 underline transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-[10px] text-muted mb-3 uppercase tracking-widest">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
              {activeCategory ? ` en "${activeCategory}"` : ""}
            </p>
            <div className={`grid gap-3 ${gridCols}`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  view={viewLevel}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Formulario ─────────────────────────────────────────── */}
      {pageView === "form" && (
        <ProductForm
          product={selectedProduct}
          onSave={handleSave}
          onClose={() => { setPageView("list"); setSelectedProduct(null); }}
          categoryNames={derivedCategories.map((c) => c.name)}
        />
      )}

      {/* ── Drawer de detalle ───────────────────────────────────── */}
      {isDrawerOpen && storeSelectedProduct && (
        <ProductDetailDrawer
          product={storeSelectedProduct}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* ── Tutorial ────────────────────────────────────────────── */}
      {tutorialOpen && (
        <ProductTutorial
          onClose={closeTutorial}
          onComplete={completeTutorial}
        />
      )}

      {/* ── Export/Import ───────────────────────────────────────── */}
      {showExportImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-surface-3 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-ivory">Exportar datos</h3>
              <button onClick={() => setShowExportImport(false)} className="text-muted hover:text-ivory">
                <X size={18} />
              </button>
            </div>
            <DataExportImport
              data={filteredProducts}
              filename={`productos-${new Date().toISOString().split("T")[0]}`}
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

// ── Subcomponentes ────────────────────────────────────────────────

function KPIBox({
  label, value, icon, color,
}: {
  label: string; value: number | string; icon: React.ReactNode; color: string;
}) {
  const colors: Record<string, { bg: string; icon: string }> = {
    violet:  { bg: "from-violet/15 border-violet/25",  icon: "text-violet-400 bg-violet/15"  },
    cyan:    { bg: "from-cyan/15 border-cyan/25",      icon: "text-cyan-400 bg-cyan/15"       },
    gold:    { bg: "from-gold/15 border-gold/25",      icon: "text-gold bg-gold/15"           },
    emerald: { bg: "from-emerald/15 border-emerald/25",icon: "text-emerald-400 bg-emerald/15" },
  };
  const c = colors[color] ?? colors.violet;

  return (
    <div className={`p-4 rounded-xl border bg-gradient-to-br ${c.bg} bg-surface-3/50 flex items-center gap-3`}>
      <div className={`p-2 rounded-xl ${c.icon}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-muted uppercase tracking-widest">{label}</p>
        <p className="text-xl font-bold text-ivory">{value}</p>
      </div>
    </div>
  );
}

function CategoryPill({
  name, count, drinks, food, active, onClick,
}: {
  name: string; count: number; drinks?: number; food?: number;
  active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
        active
          ? "bg-violet/15 border-violet/35 text-violet-300"
          : "bg-white/3 border-white/8 text-muted hover:border-white/18 hover:text-ivory"
      }`}
    >
      {name !== "Todos" && drinks !== undefined && food !== undefined && (
        <span className="opacity-60">
          {food > 0 && drinks > 0
            ? <SlidersHorizontal size={11} />
            : food > 0
              ? <ChefHat size={11} />
              : <GlassWater size={11} />
          }
        </span>
      )}
      <span>{name}</span>
      <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full ${
        active ? "bg-violet/20 text-violet-300" : "bg-white/5 text-muted/70"
      }`}>
        {count}
      </span>
    </button>
  );
}

function ModeToggle({ mode, onChange }: { mode: ProductMode; onChange: (m: ProductMode) => void }) {
  const options: { value: ProductMode; label: string; icon: React.ReactNode }[] = [
    { value: "simple",   label: "Simple",   icon: <Rows4 size={13} />     },
    { value: "standard", label: "Estándar", icon: <Rows3 size={13} />     },
    { value: "advanced", label: "Completo", icon: <List  size={13} />     },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-xl p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.label}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            mode === opt.value
              ? "bg-violet/20 text-violet-300 border border-violet/30"
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
