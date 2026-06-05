"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  LayoutDashboard,
  Layers,
  CheckCircle,
  RefreshCcw,
  Target,
  Zap,
  Activity,
  HelpCircle,
  List,
  Grid3x3,
  Eye
} from "lucide-react";

import MenuCard from "../components/MenuCard";
import MenuForm from "../components/MenuForm";
import MenuTutorial from "../components/tutorial/MenuTutorial";
import MenuAdvancedPanel from "../components/MenuAdvancedPanel";
import MenuBuilderCard from "../components/MenuBuilderCard";
import CategorySection from "../components/CategorySection";
import ProductSelector from "../components/ProductSelector";
import MenuAvailabilitySummary from "../components/MenuAvailabilitySummary";
import MenuPreview from "../components/MenuPreview";

import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../../../services/menuService";

import { getRecipes } from "../../recipes/services/recipeService";
import { getProducts } from "../../products/services/productService";

import { useMenuSocketEvents } from "../../../hooks/useSocket";
import { useMenuTutorial } from "../hooks/useMenuTutorial";
import { useMenuUiStore } from "../store/menuUiStore";
import { useMenuBuilder } from "../hooks/useMenuBuilder";

import type { Menu } from "../../../types/menu";
import type { Recipe } from "../../recipes/types/recipe";
import type { Product } from "../../../types/product";
import { getProductId } from "../utils/menuUtils";
import "../../../styles/nebula-theme.css";

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [builderMode, setBuilderMode] = useState(false);

  const menuBuilder = useMenuBuilder();

  const {
    isOpen: tutorialOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
  } = useMenuTutorial();

  const { mode, setMode, view, toggleView } = useMenuUiStore();

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const [menuData, recipeData, productData] = await Promise.all([
        getMenus(),
        getRecipes(),
        getProducts()
      ]);
      setMenus(Array.isArray(menuData) ? menuData : []);
      setRecipes(Array.isArray(recipeData) ? recipeData : []);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (err) {
      console.error("Error sync menus", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  /* =========================================================
     REAL-TIME UPDATES VIA SOCKET.IO
  ========================================================= */
  useMenuSocketEvents(
    // Menu creado
    (data: any) => {
      console.log("[Socket] Menú creado:", data);
      if (data.menu) {
        setMenus(prev => [...prev, data.menu]);
      }
    },
    // Menu actualizado
    (data: any) => {
      console.log("[Socket] Menú actualizado:", data);
      if (data.menu) {
        setMenus(prev => prev.map(m => 
          m._id === data.menu._id ? data.menu : m
        ));
      }
    },
    // Menu eliminado
    (data: any) => {
      console.log("[Socket] Menú eliminado:", data);
      if (data.id) {
        setMenus(prev => prev.filter(m => m._id !== data.id));
      }
    }
  );

  const filteredMenus = useMemo(() => {
    if (!search.trim()) return menus;
    const lower = search.toLowerCase();
    return menus.filter((m) => 
      m?.name?.toLowerCase().includes(lower) ||
      m.categories?.some(c => c.name.toLowerCase().includes(lower))
    );
  }, [menus, search]);

  const stats = useMemo(() => {
    const total = menus.length;
    const active = menus.filter((m) => m.active).length;
    const products = menus.reduce((acc, m) => acc + (m.categories?.reduce((a, c) => a + (c.products?.length || 0), 0) || 0), 0);
    const avgProducts = total > 0 ? (products / total).toFixed(1) : 0;

    return { total, active, products, avgProducts };
  }, [menus]);

  const handleSave = async (menu: any) => {
    try {
      if (menu._id) await updateMenu(menu._id, menu);
      else await createMenu(menu);
      await fetchMenus();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save error", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desvincular este menú de la red?")) return;
    try {
      await deleteMenu(id);
      await fetchMenus();
      if (menuBuilder.selectedMenu?._id === id) {
        menuBuilder.selectMenu(null);
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleSelectMenu = (menu: Menu) => {
    setSelectedMenu(menu);
    menuBuilder.selectMenu(menu);
  };

  const addedProductIds = useMemo(() => {
    if (!menuBuilder.selectedMenu) return new Set<string>();
    const ids = new Set<string>();
    menuBuilder.selectedMenu.categories?.forEach(cat => {
      cat.products.forEach(p => ids.add(getProductId(p.product)));
    });
    return ids;
  }, [menuBuilder.selectedMenu]);

  const handleAddProduct = (product: Product) => {
    if (!menuBuilder.selectedCategory || !menuBuilder.selectedMenu) return;
    menuBuilder.addProductToCategory(product, menuBuilder.selectedCategory);
  };

  const handleRemoveProduct = (categoryName: string, productId: string) => {
    menuBuilder.removeProductFromCategory(categoryName, productId);
  };

  return (
    <div className="nebula-dashboard-root flex flex-col h-full gap-6 animate-fade-in-up-fusion relative">
      <MenuTutorial
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
            <LayoutDashboard className="text-violet-200" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ivory">
              Cartas Digitales
            </h1>
            <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
              <Target size={12} className="text-violet-400/70" />
              Menu Architecture · Nebula v3
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
              placeholder="Buscar cartas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-3/60 border border-violet-400/20 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium text-ivory outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/10 transition-all w-64 backdrop-blur-sm"
            />
          </div>

          <button
            onClick={() => openTutorial()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
            title="Tutorial de cartas"
          >
            <HelpCircle size={16} />
            Tutorial
          </button>

          <ModeToggle mode={mode} onChange={setMode} />

          <button
            onClick={() => setBuilderMode(!builderMode)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
              builderMode
                ? 'bg-rose/10 border-rose/30 text-rose-300'
                : 'border-white/10 text-muted hover:text-violet-200 hover:border-violet-400/30'
            }`}
            title={builderMode ? 'Vista Normal' : 'Constructor de Menús'}
          >
            <Grid3x3 size={16} />
            <span>{builderMode ? 'Normal' : 'Constructor'}</span>
          </button>

          <button
            onClick={toggleView}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
            title={`Vista: ${view === 'grid' ? 'Cuadrícula' : 'Lista'}`}
          >
            {view === 'grid' ? <LayoutDashboard size={16} /> : <List size={16} />}
          </button>

          <button
            onClick={fetchMenus}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
            title="Actualizar"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => { setSelectedMenu(null); setIsModalOpen(true); }}
            className="nebula-btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            <Plus size={18} />
            <span className="text-xs font-bold tracking-wide uppercase">Nueva Carta</span>
          </button>
        </div>
      </header>

      {/* KPI DASHBOARD */}
      <div className={`grid gap-4 ${mode === 'simple' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
        <KPIBox label="Cartas Totales" value={stats.total} icon={<Layers size={18} />} color="violet" />
        <KPIBox label="Activas" value={stats.active} icon={<CheckCircle size={18} />} color="cyan" />
        {mode === 'advanced' && (
          <>
            <KPIBox label="Productos" value={stats.products} icon={<Zap size={18} />} color="orange" />
            <KPIBox label="Promedio/Carta" value={stats.avgProducts} icon={<Activity size={18} />} color="violet" />
          </>
        )}
      </div>

      {/* ADVANCED PANEL (mode only) */}
      {mode === 'advanced' && (
        <MenuAdvancedPanel menus={menus} />
      )}

      {/* MAIN GRID - BUILDER MODE */}
      {builderMode ? (
        <div className="flex-1 overflow-hidden min-h-0 grid grid-cols-12 gap-4">
          {/* LEFT PANEL - MENU LIST */}
          <div className="col-span-3 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 rounded-xl border-2 border-rose-400/30 border-t-rose-300 animate-spin" />
                </div>
              ) : filteredMenus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <LayoutDashboard size={32} className="text-rose-300/40 mb-2" />
                  <p className="text-muted text-xs">No se encontraron cartas</p>
                </div>
              ) : (
                filteredMenus.map((menu) => (
                  <MenuBuilderCard
                    key={menu._id}
                    menu={menu}
                    selected={menuBuilder.selectedMenu?._id === menu._id}
                    onSelect={handleSelectMenu}
                    onEdit={() => { setSelectedMenu(menu); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    recipesCount={(() => {
                      const menuProductIds = new Set(menu.categories?.flatMap(c => c.products.map(p => getProductId(p.product))) || []);
                      return recipes.filter(r => r.product && menuProductIds.has(r.product._id)).length;
                    })()}
                  />
                ))
              )}
            </div>
          </div>

          {/* MIDDLE PANEL - MENU BUILDER */}
          <div className="col-span-5 overflow-y-auto pr-2 custom-scrollbar">
            {menuBuilder.selectedMenu ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-ivory uppercase tracking-widest">
                    {menuBuilder.selectedMenu.name}
                  </h3>
                  <button
                    onClick={() => menuBuilder.createCategory('Nueva Categoría')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose/10 border border-rose/30 text-rose-300 text-[10px] font-black uppercase tracking-widest hover:bg-rose/20 transition-all"
                  >
                    <Plus size={12} />
                    Nueva Categoría
                  </button>
                </div>

                {menuBuilder.selectedMenu.categories?.map((category) => (
                  <CategorySection
                    key={category.name}
                    category={category}
                    isExpanded={menuBuilder.expandedCategories.has(category.name)}
                    onToggle={() => menuBuilder.toggleCategoryExpansion(category.name)}
                    onAddProduct={() => menuBuilder.selectCategory(category.name)}
                    onRemoveProduct={(productId) => handleRemoveProduct(category.name, productId)}
                  />
                ))}

                {menuBuilder.selectedCategory && (
                  <ProductSelector
                    products={products}
                    onAddProduct={handleAddProduct}
                    addedProductIds={addedProductIds}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <LayoutDashboard size={48} className="text-rose-300/40 mb-4" />
                <p className="text-muted text-sm">Selecciona una carta para editar</p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL - PREVIEW & SUMMARY */}
          <div className="col-span-4 overflow-y-auto pr-2 custom-scrollbar">
            {menuBuilder.selectedMenu ? (
              <div className="space-y-4">
                <MenuAvailabilitySummary menu={menuBuilder.selectedMenu} />
                <MenuPreview menu={menuBuilder.selectedMenu} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <Eye size={48} className="text-rose-300/40 mb-4" />
                <p className="text-muted text-sm">Selecciona una carta para ver el resumen</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* NORMAL MODE - ORIGINAL GRID */
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 rounded-xl border-2 border-violet-400/30 border-t-violet-300 animate-spin" />
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <LayoutDashboard size={48} className="text-violet-300/40 mb-4" />
              <p className="text-muted text-sm">No se encontraron cartas</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredMenus.map((menu) => {
                const menuId = menu._id || '';
                return (
                  <MenuCard
                    key={menuId}
                    menu={menu}
                    onEdit={() => { setSelectedMenu(menu); setIsModalOpen(true); }}
                    onDelete={() => handleDelete(menuId)}
                    simplified={mode === 'simple'}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FORM MODAL */}
      {isModalOpen && (
        <MenuForm
          menu={selectedMenu}
          onSave={handleSave}
          onClose={() => { setIsModalOpen(false); setSelectedMenu(null); }}
        />
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