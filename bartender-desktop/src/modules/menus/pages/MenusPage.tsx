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
  Eye,
  Settings,
  Filter,
  X,
  Trash2,
  Save
} from "lucide-react";

import MenuCard from "../components/MenuCard";
import MenuTutorial from "../components/tutorial/MenuTutorial";
import MenuAdvancedPanel from "../components/MenuAdvancedPanel";
import MenuBuilderCard from "../components/MenuBuilderCard";
import CategorySection from "../components/CategorySection";
import MenuAvailabilitySummary from "../components/MenuAvailabilitySummary";
import MenuPreview from "../components/MenuPreview";
import MenuIdentityEditor from "../components/MenuIdentityEditor";
import MenuConfigPanel from "../components/MenuConfigPanel";
import ProductFilterSelector from "../components/ProductFilterSelector";
import MenuRealtimePreview from "../components/MenuRealtimePreview";
import MenuTemplates from "../components/MenuTemplates";

import {
  getMenus,
  deleteMenu,
  createMenu,
  updateMenu,
} from "../../../services/menuService";
import { uploadImage } from "../../../services/uploadService";

import { getRecipes } from "../../recipes/services/recipeService";
import { getProducts } from "../../products/services/productService";

import { useMenuSocketEvents } from "../../../hooks/useSocket";
import { useMenuTutorial } from "../hooks/useMenuTutorial";
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

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [builderMode, setBuilderMode] = useState(false);
  const [builderPanel, setBuilderPanel] = useState<"identity" | "config" | "categories" | "products" | "preview">("categories");
  const [showTemplates, setShowTemplates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Advanced filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "drink" | "food" | "mixed">("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [filterPublic, setFilterPublic] = useState<"all" | "public" | "private">("all");
  const [filterFeatured, setFilterFeatured] = useState(false);

  // Bulk actions
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());

  const menuBuilder = useMenuBuilder();

  const {
    isOpen: tutorialOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
  } = useMenuTutorial("general");

  const {
    isOpen: builderTutorialOpen,
    openTutorial: openBuilderTutorial,
    closeTutorial: closeBuilderTutorial,
    completeTutorial: completeBuilderTutorial,
    currentStep: builderTutorialStep,
    setCurrentStep: setBuilderTutorialStep,
  } = useMenuTutorial("builder");

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
    let result = menus;

    // Search filter
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((m) =>
        m?.name?.toLowerCase().includes(lower) ||
        m.categories?.some(c => c.name.toLowerCase().includes(lower))
      );
    }

    // Type filter
    if (filterType !== "all") {
      result = result.filter(m => m.type === filterType);
    }

    // Active filter
    if (filterActive === "active") {
      result = result.filter(m => m.active);
    } else if (filterActive === "inactive") {
      result = result.filter(m => !m.active);
    }

    // Public filter
    if (filterPublic === "public") {
      result = result.filter(m => m.isPublic);
    } else if (filterPublic === "private") {
      result = result.filter(m => !m.isPublic);
    }

    // Featured filter
    if (filterFeatured) {
      result = result.filter(m => m.featured);
    }

    return result;
  }, [menus, search, filterType, filterActive, filterPublic, filterFeatured]);

  const stats = useMemo(() => {
    const total = menus.length;
    const active = menus.filter((m) => m.active).length;
    const products = menus.reduce((acc, m) => acc + (m.categories?.reduce((a, c) => a + (c.products?.length || 0), 0) || 0), 0);
    const avgProducts = total > 0 ? (products / total).toFixed(1) : "0";

    return { total, active, products, avgProducts };
  }, [menus]);

  const handleCreateNewMenu = async () => {
    try {
      const newMenu = await createMenu({
        name: "Nueva Carta",
        description: "",
        type: "mixed",
        active: true,
        categories: [],
      }, { allowEmptyCategories: true });
      await fetchMenus();
      menuBuilder.selectMenu(newMenu);
      setBuilderMode(true);
      // Open builder tutorial if not completed
      const builderPrefs = JSON.parse(localStorage.getItem("nebula_menu_builder_tutorial_v1") || "{}");
      if (!builderPrefs.completed) {
        openBuilderTutorial(0);
      }
    } catch (err) {
      console.error("Error creating menu", err);
      alert("Error al crear el menú");
    }
  };

  const handleSaveMenu = async () => {
    if (!menuBuilder.selectedMenu?._id) return;
    
    try {
      setSaving(true);
      // Ensure categories is always an array
      let menuToSave = {
        ...menuBuilder.selectedMenu,
        categories: menuBuilder.selectedMenu.categories || [],
      };

      // Upload image file if present
      if (menuBuilder.imageFile) {
        const uploadResult = await uploadImage(menuBuilder.imageFile);
        menuToSave = {
          ...menuToSave,
          image: uploadResult.url,
        };
      }

      await updateMenu(
        menuBuilder.selectedMenu._id, 
        menuToSave, 
        { 
          allowEmptyCategories: true,
        }
      );
      setSaveSuccess(true);
      fetchMenus();
      // Clear imageFile after successful save
      menuBuilder.updateMenu({ imageFile: undefined });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving menu", err);
      alert("Error al guardar el menú");
    } finally {
      setSaving(false);
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

  const handleBulkDelete = async () => {
    if (selectedMenus.size === 0) return;
    if (!confirm(`¿Eliminar ${selectedMenus.size} menús seleccionados?`)) return;
    try {
      await Promise.all(Array.from(selectedMenus).map(id => deleteMenu(id)));
      setSelectedMenus(new Set());
      await fetchMenus();
    } catch (err) {
      console.error("Bulk delete error", err);
    }
  };

  const toggleMenuSelection = (menuId: string) => {
    setSelectedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setFilterType("all");
    setFilterActive("all");
    setFilterPublic("all");
    setFilterFeatured(false);
    setSearch("");
  };

  const toggleView = () => {
    setView(prev => prev === 'grid' ? 'list' : 'grid');
  };

  const hasActiveFilters = filterType !== "all" || filterActive !== "all" || filterPublic !== "all" || filterFeatured || search.trim();

  const handleSelectMenu = (menu: Menu) => {
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
      <MenuTutorial
        isOpen={builderTutorialOpen}
        onClose={() => closeBuilderTutorial()}
        onComplete={completeBuilderTutorial}
        mode="builder"
        initialStep={builderTutorialStep}
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
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
              filtersOpen || hasActiveFilters
                ? 'bg-gold/10 border-gold/30 text-gold'
                : 'border-white/10 text-muted hover:text-violet-200 hover:border-violet-400/30'
            }`}
          >
            <Filter size={16} />
            <span>Filtros</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-gold" />}
          </button>

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
            onClick={() => setShowTemplates(true)}
            className="nebula-btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            <Plus size={18} />
            <span className="text-xs font-bold tracking-wide uppercase">Nueva Carta</span>
          </button>
        </div>
      </header>

      {/* FILTERS PANEL */}
      {filtersOpen && (
        <div className="p-4 bg-surface-3 border border-white/10 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Filtros Avanzados</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red/10 border border-red/30 text-red-300 text-xs font-semibold hover:bg-red/20 transition-all"
              >
                <X size={12} />
                Limpiar
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2 block">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 bg-surface-2 border border-white/10 rounded-lg text-ivory text-xs focus:outline-none focus:border-gold/30 transition-colors"
              >
                <option value="all">Todos</option>
                <option value="drink">Bebidas</option>
                <option value="food">Comida</option>
                <option value="mixed">Mixto</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2 block">Estado</label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as any)}
                className="w-full px-3 py-2 bg-surface-2 border border-white/10 rounded-lg text-ivory text-xs focus:outline-none focus:border-gold/30 transition-colors"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2 block">Visibilidad</label>
              <select
                value={filterPublic}
                onChange={(e) => setFilterPublic(e.target.value as any)}
                className="w-full px-3 py-2 bg-surface-2 border border-white/10 rounded-lg text-ivory text-xs focus:outline-none focus:border-gold/30 transition-colors"
              >
                <option value="all">Todos</option>
                <option value="public">Públicos</option>
                <option value="private">Privados</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-surface-2 text-gold focus:ring-gold/50"
                />
                <span className="text-xs font-semibold text-muted">Solo destacados</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTIONS BAR */}
      {selectedMenus.size > 0 && (
        <div className="p-4 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-between">
          <p className="text-xs font-semibold text-gold-300">
            {selectedMenus.size} menú{selectedMenus.size !== 1 ? 's' : ''} seleccionado{selectedMenus.size !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMenus(new Set())}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-muted text-xs font-semibold hover:text-ivory transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red/10 border border-red/30 text-red-300 text-xs font-semibold hover:bg-red/20 transition-colors"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          </div>
        </div>
      )}

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

      {/* TEMPLATES MODAL */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <MenuTemplates
            onMenuCreated={(menu) => {
              setShowTemplates(false);
              menuBuilder.selectMenu(menu);
              setBuilderMode(true);
              fetchMenus();
            }}
            onCreateEmpty={() => {
              setShowTemplates(false);
              handleCreateNewMenu();
            }}
            onCancel={() => setShowTemplates(false)}
          />
        </div>
      )}

      {/* MAIN GRID - BUILDER MODE */}
      {builderMode ? (
        <div className="flex-1 overflow-hidden min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* LEFT PANEL - MENU LIST (3 columnas) */}
          <div className="lg:col-span-3 overflow-y-auto pr-2 custom-scrollbar">
            <div className="nebula-discounts-panel p-4 rounded-3xl h-full">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <div className="p-2 bg-rose/10 rounded-xl">
                  <Layers size={18} className="text-rose-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Cartas</h3>
                <span className="text-xs font-semibold text-rose bg-rose/10 px-2 py-1 rounded-full ml-auto">
                  {filteredMenus.length}
                </span>
              </div>
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
                      onEdit={() => { menuBuilder.selectMenu(menu); setBuilderMode(true); }}
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
          </div>

          {/* MIDDLE PANEL - MENU BUILDER (6 columnas) */}
          <div className="lg:col-span-6 overflow-y-auto pr-2 custom-scrollbar">
            {menuBuilder.selectedMenu ? (
              <div className="nebula-discounts-panel p-4 rounded-3xl h-full">
                {/* Panel Selector Tabs */}
                <div className="flex items-center gap-2 p-1 bg-surface-3 rounded-xl mb-4">
                  {[
                    { id: "identity" as const, label: "Identidad", icon: <Target size={14} /> },
                    { id: "config" as const, label: "Config", icon: <Settings size={14} /> },
                    { id: "categories" as const, label: "Categorías", icon: <Layers size={14} /> },
                    { id: "products" as const, label: "Productos", icon: <Zap size={14} /> },
                    { id: "preview" as const, label: "Vista", icon: <Eye size={14} /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setBuilderPanel(tab.id);
                        // Auto-navigate tutorial when switching panels
                        const panelStepMap: Record<string, number> = {
                          identity: 2,
                          config: 6,
                          categories: 10,
                          products: 10,
                          preview: 12,
                        };
                        if (builderTutorialOpen) {
                          setBuilderTutorialStep(panelStepMap[tab.id] || 0);
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold transition-all ${
                        builderPanel === tab.id
                          ? "bg-violet-500/20 text-violet-300"
                          : "text-muted hover:text-ivory hover:bg-white/5"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => openBuilderTutorial(0)}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold transition-all text-muted hover:text-ivory hover:bg-white/5"
                    title="Tutorial del constructor"
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>

                {/* Panel Content */}
                {builderPanel === "identity" && (
                  <MenuIdentityEditor
                    menu={menuBuilder.selectedMenu}
                    onUpdate={(updates) => {
                      menuBuilder.updateMenu(updates);
                      fetchMenus();
                    }}
                  />
                )}

                {builderPanel === "config" && (
                  <MenuConfigPanel
                    menu={menuBuilder.selectedMenu}
                    onUpdate={(updates) => {
                      menuBuilder.updateMenu(updates);
                      fetchMenus();
                    }}
                  />
                )}

                {builderPanel === "categories" && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black text-ivory uppercase tracking-widest">
                        Categorías
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
                        onDeleteCategory={() => menuBuilder.deleteCategory(category.name)}
                      />
                    ))}
                  </>
                )}

                {builderPanel === "products" && (
                  <ProductFilterSelector
                    products={products}
                    onAddProduct={handleAddProduct}
                    addedProductIds={addedProductIds}
                  />
                )}

                {builderPanel === "preview" && (
                  <MenuRealtimePreview menu={menuBuilder.selectedMenu} />
                )}
              </div>
            ) : (
              <div className="nebula-discounts-panel p-4 rounded-3xl h-full flex flex-col items-center justify-center text-center">
                <LayoutDashboard size={48} className="text-rose-300/40 mb-4" />
                <p className="text-muted text-sm">Selecciona una carta para editar</p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL - PREVIEW & SUMMARY (3 columnas) */}
          <div className="lg:col-span-3 overflow-y-auto pr-2 custom-scrollbar">
            {menuBuilder.selectedMenu ? (
              <div className="space-y-4">
                {saveSuccess && (
                  <div className="p-3 bg-emerald/10 border border-emerald/30 rounded-xl flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">Menú guardado exitosamente</span>
                  </div>
                )}
                <MenuAvailabilitySummary menu={menuBuilder.selectedMenu} />
                <MenuPreview menu={menuBuilder.selectedMenu} />
                <button
                  onClick={handleSaveMenu}
                  disabled={saving}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar Menú
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="nebula-discounts-panel p-4 rounded-3xl h-full flex flex-col items-center justify-center text-center">
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
                const isSelected = selectedMenus.has(menuId);
                return (
                  <div key={menuId} className="relative">
                    {selectedMenus.size > 0 && (
                      <div className="absolute top-3 left-3 z-20">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleMenuSelection(menuId)}
                          className="w-5 h-5 rounded border-white/20 bg-surface-2 text-gold focus:ring-gold/50 cursor-pointer"
                        />
                      </div>
                    )}
                    <MenuCard
                      menu={menu}
                      onEdit={() => { 
                        menuBuilder.selectMenu(menu); 
                        setBuilderMode(true);
                        // Open builder tutorial if not completed
                        const builderPrefs = JSON.parse(localStorage.getItem("nebula_menu_builder_tutorial_v1") || "{}");
                        if (!builderPrefs.completed) {
                          openBuilderTutorial(0);
                        }
                      }}
                      onDelete={() => handleDelete(menuId)}
                      simplified={mode === 'simple'}
                    />
                  </div>
                );
              })}
            </div>
          )}
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