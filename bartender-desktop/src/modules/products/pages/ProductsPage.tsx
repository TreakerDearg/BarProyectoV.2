import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus, HelpCircle, LayoutGrid, List, Target, Zap, Activity,
  TrendingUp, Package, RefreshCcw, X, SlidersHorizontal,
  Rows3, Rows4, ChefHat, GlassWater, Search, Star, Filter,
} from "lucide-react";

import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import ProductDetailDrawer from "../components/ProductDetailDrawer";
import ProductTutorial from "../components/tutorial/ProductTutorial";
import DataExportImport from "../../../components/shared/DataExportImport";

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
  const [showFilters, setShowFilters]     = useState(false);

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

  // ── Estadísticas con cálculo de margen protegido ───────────────
  const stats = useMemo(() => {
    const total     = products.length;
    const available = products.filter((p) => p.available).length;
    const featured  = products.filter((p) => p.featured).length;
    const drinks    = products.filter((p) => p.type === "drink").length;
    const food      = products.filter((p) => p.type === "food").length;

    // Solo calculamos promedio de margen sobre productos con precio > 0 y costo > 0 real
    const productsWithCost = products.filter(
      (p) => typeof p.price === "number" && p.price > 0 && typeof p.cost === "number" && p.cost > 0
    );

    let avgMargin = 0;
    if (productsWithCost.length > 0) {
      const sum = productsWithCost.reduce((acc, p) => {
        const m = ((p.price - (p.cost || 0)) / p.price) * 100;
        // Clampeamos a [-100, 100] para evitar porcentajes imposibles por datos de test
        return acc + Math.max(-100, Math.min(100, m));
      }, 0);
      avgMargin = Math.round(sum / productsWithCost.length);
    }

    return {
      total,
      available,
      featured,
      drinks,
      food,
      avgMargin,
      hasCostData: productsWithCost.length > 0,
    };
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

  const handleExport = async () => {
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

  const activeFilterCount = (activeFilters["type"]?.length || 0) + (activeFilters["availability"]?.length || 0);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 min-h-0 h-full overflow-hidden bg-[#0D1117]">

      {/* ── Header Unificado Slate Elegante ───────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#E6EDF3] tracking-tight">Productos</h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            {stats.total} productos · {stats.available} disponibles · {stats.drinks} bebidas · {stats.food} comidas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Buscador Único integrado */}
          <div className="relative w-48 sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o tag…"
              className="h-9 w-full pl-8 pr-7 rounded-lg bg-[#1C2333] border border-[#30363D] text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/60 focus:outline-none focus:border-[#F0B429] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3]"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Botón Filtros desplegables */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            title="Filtros avanzados"
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-semibold transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-[#21283A] border-[rgba(240,180,41,0.40)] text-[#F0B429]"
                : "bg-[#1C2333] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D]"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden md:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-xs font-extrabold bg-[#F0B429] text-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Selector de Modos (Simple / Estándar / Completo) */}
          <ModeToggle mode={mode} onChange={setMode} />

          {/* Vista Grid / Lista */}
          <button
            onClick={toggleView}
            title={`Vista: ${view === "grid" ? "cuadrícula" : "lista"}`}
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#30363D] bg-[#1C2333] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
          >
            {view === "grid" ? <LayoutGrid size={15} /> : <List size={15} />}
          </button>

          {/* Actualizar */}
          <button
            onClick={fetchProducts}
            title="Actualizar catálogo"
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#30363D] bg-[#1C2333] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin text-[#F0B429]" : ""} />
          </button>

          {/* Exportar */}
          <button
            onClick={() => setShowExportImport(true)}
            title="Exportar catálogo"
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#30363D] bg-[#1C2333] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
          >
            <Target size={15} />
          </button>

          {/* Tutorial */}
          <button
            onClick={() => openTutorial()}
            title="Ver tutorial interactivo"
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#30363D] bg-[#1C2333] text-[#8B949E] hover:text-[#F0B429] hover:border-[#F0B429]/40 transition-colors"
          >
            <HelpCircle size={15} />
          </button>

          {/* CTA + NUEVO PRODUCTO */}
          <button
            onClick={() => { setSelectedProduct(null); setPageView("form"); }}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#F0B429] hover:bg-[#F5C842] text-black font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Nuevo</span>
          </button>
        </div>
      </header>

      {/* ── Popover de Filtros Avanzados (si está abierto) ─────────── */}
      {showFilters && (
        <div className="p-3 rounded-xl bg-[#161B22] border border-[#30363D] flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
          <div className="flex items-center gap-5 flex-wrap">
            {/* Tipo */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8B949E]">Tipo:</span>
              <div className="flex gap-1">
                {[
                  { id: "", label: "Todos" },
                  { id: "drink", label: "Bebidas" },
                  { id: "food", label: "Comidas" },
                ].map((t) => {
                  const isSelected = (!activeFilters["type"]?.length && t.id === "") || activeFilters["type"]?.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveFilters((prev) => ({
                          ...prev,
                          type: t.id ? [t.id] : [],
                        }));
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        isSelected
                          ? "bg-[#21283A] text-[#F0B429] border-[#F0B429]/40 font-bold"
                          : "bg-[#1C2333] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3]"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8B949E]">Estado:</span>
              <div className="flex gap-1">
                {[
                  { id: "available", label: "Disponibles" },
                  { id: "featured", label: "Destacados" },
                ].map((s) => {
                  const isSelected = activeFilters["availability"]?.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        const current = activeFilters["availability"] || [];
                        const next = current.includes(s.id)
                          ? current.filter((x) => x !== s.id)
                          : [...current, s.id];
                        setActiveFilters((prev) => ({ ...prev, availability: next }));
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        isSelected
                          ? "bg-[#21283A] text-[#3FB950] border-[#3FB950]/40 font-bold"
                          : "bg-[#1C2333] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3]"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {(activeFilterCount > 0 || search || activeCategory) && (
            <button
              onClick={() => {
                setActiveFilters({});
                setSearch("");
                setActiveCategory("");
              }}
              className="text-xs text-[#F85149] hover:underline transition-colors flex items-center gap-1 font-semibold"
            >
              <X size={13} />
              Limpiar todos los filtros
            </button>
          )}
        </div>
      )}

      {/* ── KPIs Slate Elegante ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <KPIBox
          label="Total Productos"
          value={stats.total}
          icon={<Package size={18} />}
          variant="default"
        />
        <KPIBox
          label="Disponibles"
          value={stats.available}
          icon={<Zap size={18} />}
          variant="green"
          helperText={`${stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%`}
        />
        <KPIBox
          label="Destacados"
          value={stats.featured}
          icon={<Star size={18} className="fill-[#F0B429]" />}
          variant="gold"
        />
        <KPIBox
          label="Margen Promedio"
          value={stats.hasCostData ? `${stats.avgMargin}%` : "—"}
          icon={<TrendingUp size={18} />}
          variant={stats.avgMargin >= 40 ? "green" : stats.avgMargin >= 20 ? "gold" : "blue"}
          helperText={stats.hasCostData ? "s/ costos reales" : "Sin costo cargado"}
        />
      </div>

      {/* ── Selector de categorías ─────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none items-center">
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
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(248,81,73,0.12)] border border-[rgba(248,81,73,0.30)] text-[#F85149] text-xs shrink-0">
          <span className="flex-1 font-medium">{error}</span>
          <button onClick={() => setError(null)} className="text-[#F85149] hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Grid de productos ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-0.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-[#30363D] animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#F0B429] animate-spin" />
            </div>
            <p className="text-xs text-[#8B949E] mt-3 font-medium">Cargando catálogo de productos…</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D]">
              <Package size={36} className="text-[#8B949E]" />
            </div>
            <p className="text-sm font-semibold text-[#E6EDF3]">
              {search || activeCategory ? "Sin resultados para los filtros actuales" : "No hay productos registrados"}
            </p>
            {(search || activeCategory || activeFilterCount > 0) && (
              <button
                onClick={() => { setSearch(""); setActiveCategory(""); setActiveFilters({}); }}
                className="text-xs text-[#F0B429] hover:underline transition-colors font-semibold"
              >
                Limpiar filtros y ver todos
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
                {activeCategory ? ` en "${activeCategory}"` : ""}
              </p>
            </div>
            <div className={`grid gap-3.5 ${gridCols} pb-6`}>
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
        <div className="absolute inset-0 z-30 bg-[#0D1117] flex flex-col">
          <ProductForm
            product={selectedProduct}
            onSave={handleSave}
            onClose={() => { setPageView("list"); setSelectedProduct(null); }}
            categoryNames={derivedCategories.map((c) => c.name)}
          />
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#E6EDF3]">Exportar datos</h3>
              <button onClick={() => setShowExportImport(false)} className="text-[#8B949E] hover:text-[#E6EDF3]">
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

// ── Subcomponentes Slate Elegante ──────────────────────────────────

function KPIBox({
  label, value, icon, variant = "default", helperText,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: "default" | "green" | "gold" | "blue";
  helperText?: string;
}) {
  const variantStyles = {
    default: { text: "text-[#E6EDF3]", iconBg: "bg-[#21283A] text-[#8B949E]", border: "border-[#30363D]" },
    green:   { text: "text-[#3FB950]", iconBg: "bg-[rgba(63,185,80,0.12)] text-[#3FB950]", border: "border-[rgba(63,185,80,0.30)]" },
    gold:    { text: "text-[#F0B429]", iconBg: "bg-[rgba(240,180,41,0.12)] text-[#F0B429]", border: "border-[rgba(240,180,41,0.30)]" },
    blue:    { text: "text-[#388BFD]", iconBg: "bg-[rgba(56,139,253,0.12)] text-[#388BFD]", border: "border-[#30363D]" },
  }[variant];

  return (
    <div className={`p-4 rounded-xl border ${variantStyles.border} bg-[#161B22] flex items-center justify-between gap-3 shadow-sm transition-all hover:border-[#3D444D]`}>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-black ${variantStyles.text} tracking-tight`}>{value}</p>
          {helperText && <span className="text-xs text-[#8B949E]">{helperText}</span>}
        </div>
      </div>
      <div className={`p-2.5 rounded-xl ${variantStyles.iconBg} shrink-0`}>
        {icon}
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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
        active
          ? "bg-[rgba(240,180,41,0.15)] border-[#F0B429] text-[#F0B429] shadow-sm font-bold"
          : "bg-[#161B22] border-[#30363D] text-[#8B949E] hover:border-[#3D444D] hover:text-[#E6EDF3]"
      }`}
    >
      {name !== "Todos" && drinks !== undefined && food !== undefined && (
        <span className="opacity-75">
          {food > 0 && drinks > 0
            ? <SlidersHorizontal size={12} />
            : food > 0
              ? <ChefHat size={12} />
              : <GlassWater size={12} />
          }
        </span>
      )}
      <span>{name}</span>
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
        active
          ? "bg-[#F0B429] text-black font-extrabold"
          : "bg-[#21283A] text-[#8B949E]"
      }`}>
        {count}
      </span>
    </button>
  );
}

function ModeToggle({ mode, onChange }: { mode: ProductMode; onChange: (m: ProductMode) => void }) {
  const options: { value: ProductMode; label: string; icon: React.ReactNode }[] = [
    { value: "simple",   label: "Simple",   icon: <Rows4 size={13} /> },
    { value: "standard", label: "Estándar", icon: <Rows3 size={13} /> },
    { value: "advanced", label: "Completo", icon: <List  size={13} /> },
  ];

  return (
    <div className="flex items-center bg-[#161B22] border border-[#30363D] rounded-lg p-0.5">
      {options.map((opt) => {
        const isActive = mode === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isActive
                ? "bg-[#21283A] text-[#F0B429] border border-[rgba(240,180,41,0.30)] shadow-sm font-bold"
                : "text-[#8B949E] hover:text-[#E6EDF3]"
            }`}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
