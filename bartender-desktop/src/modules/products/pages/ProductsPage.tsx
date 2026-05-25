import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, HelpCircle, LayoutGrid, List, Search, Target, Zap, Activity, TrendingUp, Package, RefreshCcw } from "lucide-react";

import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import ProductTutorial from "../components/tutorial/ProductTutorial";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const {
    isOpen: tutorialOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
  } = useProductTutorial();

  const { mode, setMode, view, toggleView } = useProductUiStore();

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
    if (!search.trim()) return products;
    const lower = search.toLowerCase();
    return products.filter((p) => 
      p?.name?.toLowerCase().includes(lower) ||
      p?.category?.toLowerCase().includes(lower) ||
      p?.description?.toLowerCase().includes(lower)
    );
  }, [products, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.available).length;
    const featured = products.filter((p) => p.featured).length;
    const drinks = products.filter((p) => p.type === 'drink').length;
    const food = products.filter((p) => p.type === 'food').length;

    return { total, available, featured, drinks, food };
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

      setIsModalOpen(false);
      setSelectedProduct(null);

      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      const message =
        err instanceof Error ? err.message : "Error al guardar producto";
      setError(message);
    }
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
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-400/20 shadow-[0_0_24px_rgba(139,92,246,0.15)]">
            <Package className="text-violet-200" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ivory">
              Catálogo de Productos
            </h1>
            <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
              <Target size={12} className="text-violet-400/70" />
              Product Management · Nebula v3
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-violet-300/60 group-focus-within:text-violet-200 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-3/60 border border-violet-400/20 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium text-ivory outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/10 transition-all w-64 backdrop-blur-sm"
            />
          </div>

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
            onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}
            className="nebula-btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            <Plus size={18} />
            <span className="text-xs font-bold tracking-wide uppercase">Nuevo</span>
          </button>
        </div>
      </header>

      {/* KPI DASHBOARD */}
      <div className={`grid gap-4 ${mode === 'simple' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-5'}`}>
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
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-xl border-2 border-violet-400/30 border-t-violet-300 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={48} className="text-violet-300/40 mb-4" />
            <p className="text-muted text-sm">
              {search ? "No se encontraron productos" : "No hay productos registrados"}
            </p>
          </div>
        ) : (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={(p) => {
                  setSelectedProduct(p);
                  setIsModalOpen(true);
                }}
                onDelete={() => handleDelete(product._id!)}
                simplified={mode === 'simple'}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="nebula-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-ivory">
                  {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                  }}
                  className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-ivory transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              <ProductForm
                product={selectedProduct}
                onSave={handleSave}
                onClose={() => {
                  setIsModalOpen(false);
                  setSelectedProduct(null);
                }}
              />
            </div>
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
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-400/20",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-400/20",
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