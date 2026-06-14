"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  Layers,
  CheckCircle,
  Target,
  Zap,
  Activity,
  Eye,
  Settings,
  Save,
  HelpCircle
} from "lucide-react";

import MenuTutorial from "../components/tutorial/MenuTutorial";
import MenuAdvancedPanel from "../components/MenuAdvancedPanel";
import MenuBuilderCard from "../components/MenuBuilderCard";
import MenuAvailabilitySummary from "../components/MenuAvailabilitySummary";
import MenuPreview from "../components/MenuPreview";
import MenuIdentityEditor from "../components/MenuIdentityEditor";
import MenuConfigPanel from "../components/MenuConfigPanel";
import MenuRealtimePreview from "../components/MenuRealtimePreview";
import MenuTemplates from "../components/MenuTemplates";
import ProductCategoryManager from "../components/ProductCategoryManager";
import MenusHeader from "../components/MenusHeader";
import MenusFilters from "../components/MenusFilters";
import MenusGrid from "../components/MenusGrid";
import MenusBulkActions from "../components/MenusBulkActions";

import {
  getMenus,
  deleteMenu,
  createMenu,
  updateMenu,
} from "../../../services/menuService";
import { uploadImage, deleteImage } from "../../../services/uploadService";

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
    
    let uploadedImagePublicId: string | null = null;
    
    try {
      setSaving(true);
      // Ensure categories is always an array
      let menuToSave = {
        ...menuBuilder.selectedMenu,
        categories: menuBuilder.selectedMenu.categories || [],
      };

      console.log('[Menu] Starting save process for menu:', menuBuilder.selectedMenu._id);
      console.log('[Menu] Current imagePublicId:', menuBuilder.selectedMenu.imagePublicId);
      console.log('[Menu] Current image URL:', menuBuilder.selectedMenu.image);

      // Upload image file if present (legacy support - now images are uploaded immediately in MenuIdentityEditor)
      if (menuBuilder.imageFile) {
        console.log('[Menu] Legacy image upload detected, uploading...');
        const uploadResult = await uploadImage(menuBuilder.imageFile);
        uploadedImagePublicId = uploadResult.publicId;
        menuToSave = {
          ...menuToSave,
          image: uploadResult.url,
          imagePublicId: uploadResult.publicId,
        };
        console.log('[Menu] Legacy image uploaded successfully:', uploadResult);
      }

      // Validate imagePublicId is present if image is present
      if (menuToSave.image && !menuToSave.imagePublicId) {
        console.warn('[Menu] Image URL present but imagePublicId missing - this may cause issues');
      }

      console.log('[Menu] Sending menu to backend with imagePublicId:', menuToSave.imagePublicId);
      
      await updateMenu(
        menuBuilder.selectedMenu._id, 
        menuToSave, 
        { 
          allowEmptyCategories: true,
        }
      );
      
      console.log('[Menu] Menu saved successfully');
      setSaveSuccess(true);
      fetchMenus();
      
      // Clear legacy imageFile after successful save
      if (menuBuilder.imageFile) {
        menuBuilder.updateMenu({ imageFile: undefined });
      }
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("[Menu] Error saving menu:", err);
      console.error("[Menu] Error details:", {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status
      });
      
      // Rollback: delete uploaded image if menu save failed
      if (uploadedImagePublicId) {
        try {
          console.log('[Menu] Rolling back: deleting uploaded image', uploadedImagePublicId);
          await deleteImage(uploadedImagePublicId);
          console.log('[Menu] Rollback successful: image deleted');
        } catch (rollbackError) {
          console.error('[Menu] Rollback failed: could not delete image', rollbackError);
        }
      }
      
      alert(err?.message || "Error al guardar el menú");
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

  const hasActiveFilters = Boolean(filterType !== "all" || filterActive !== "all" || filterPublic !== "all" || filterFeatured || search.trim());

  const handleSelectMenu = (menu: Menu) => {
    menuBuilder.selectMenu(menu);
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
      <MenusHeader
        search={search}
        onSearchChange={setSearch}
        filtersOpen={filtersOpen}
        onFiltersToggle={() => setFiltersOpen(!filtersOpen)}
        hasActiveFilters={hasActiveFilters}
        mode={mode}
        onModeChange={setMode}
        builderMode={builderMode}
        onBuilderModeToggle={() => setBuilderMode(!builderMode)}
        view={view}
        onViewToggle={toggleView}
        loading={loading}
        onRefresh={fetchMenus}
        onNewMenu={() => setShowTemplates(true)}
        onOpenTutorial={openTutorial}
      />

      {/* FILTERS PANEL */}
      {filtersOpen && (
        <MenusFilters
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterActive={filterActive}
          onFilterActiveChange={setFilterActive}
          filterPublic={filterPublic}
          onFilterPublicChange={setFilterPublic}
          filterFeatured={filterFeatured}
          onFilterFeaturedChange={setFilterFeatured}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* BULK ACTIONS BAR */}
      {selectedMenus.size > 0 && (
        <MenusBulkActions
          selectedCount={selectedMenus.size}
          onCancel={() => setSelectedMenus(new Set())}
          onDelete={handleBulkDelete}
        />
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
                <div className="flex items-center gap-2 p-1.5 bg-surface-3 rounded-2xl mb-6 border border-white/5">
                  {[
                    { id: "identity" as const, label: "Identidad", icon: <Target size={14} />, color: "violet" },
                    { id: "config" as const, label: "Configuración", icon: <Settings size={14} />, color: "cyan" },
                    { id: "categories" as const, label: "Categorías", icon: <Layers size={14} />, color: "gold" },
                    { id: "preview" as const, label: "Vista Previa", icon: <Eye size={14} />, color: "emerald" },
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
                          preview: 12,
                        };
                        if (builderTutorialOpen) {
                          setBuilderTutorialStep(panelStepMap[tab.id] || 0);
                        }
                      }}
                      className={`flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        builderPanel === tab.id
                          ? `bg-${tab.color}/20 text-${tab.color}-300 border border-${tab.color}/30 shadow-lg shadow-${tab.color}/10`
                          : "text-muted hover:text-ivory hover:bg-white/5"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => openBuilderTutorial(0)}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-muted hover:text-ivory hover:bg-white/5"
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
                  <ProductCategoryManager
                    categories={menuBuilder.selectedMenu.categories || []}
                    products={products}
                    onUpdateCategories={(updatedCategories) => {
                      menuBuilder.updateMenu({ categories: updatedCategories });
                      fetchMenus();
                    }}
                    onCreateCategory={(name) => {
                      menuBuilder.createCategory(name);
                    }}
                    onDeleteCategory={(categoryName) => {
                      menuBuilder.deleteCategory(categoryName);
                    }}
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
          <MenusGrid
            menus={filteredMenus}
            loading={loading}
            view={view}
            selectedMenus={selectedMenus}
            onToggleSelection={toggleMenuSelection}
            onEdit={(menu) => {
              menuBuilder.selectMenu(menu);
              setBuilderMode(true);
              // Open builder tutorial if not completed
              const builderPrefs = JSON.parse(localStorage.getItem("nebula_menu_builder_tutorial_v1") || "{}");
              if (!builderPrefs.completed) {
                openBuilderTutorial(0);
              }
            }}
            onDelete={handleDelete}
            simplified={mode === 'simple'}
          />
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