/**
 * NebulaRecipeStudio — Orquestador puro del Recipe Studio
 *
 * Responsabilidades:
 *  - Estado global: allRecipes, inventory, selectedRecipe, currentView, search
 *  - Carga inicial de datos (recetas + inventario)
 *  - Ruteo entre las vistas del studio
 *  - NO contiene UI propia más allá del layout shell
 *  - NO tiene overflow-y-auto en el contenedor raíz (el DashboardLayout.main scrollea)
 *
 * Vistas manejadas:
 *  dashboard · recipes · variants · ingredients · categories · techniques · inventory · reports
 */
import { useState, useEffect, useCallback, useMemo } from 'react';

// ── Sub-componentes del studio ────────────────────────────────────
import { StudioTopBar }                 from '../components/studio/StudioTopBar';
import { StudioSidebar }                from '../components/studio/StudioSidebar';
import type { StudioView }              from '../components/studio/StudioSidebar';
import { StudioDashboard }              from '../components/studio/StudioDashboard';
import { StudioIngredientsView }        from '../components/studio/StudioIngredientsView';
import { StudioCategoriesView }         from '../components/studio/StudioCategoriesView';
import { StudioTechniquesView }         from '../components/studio/StudioTechniquesView';
import { StudioReportsView }            from '../components/studio/StudioReportsView';

// ── Componentes existentes reutilizados ───────────────────────────
import { RecipeLibrary }                from '../components/library';
import { RecipeBuilder }                from '../components/builder';
import { VariantManager }               from '../components/variants';

// ── Contexto ──────────────────────────────────────────────────────
import { RecipeStudioProvider }         from '../contexts/RecipeStudioContext';

// ── Servicios ─────────────────────────────────────────────────────
import { getRecipes }                   from '../services/recipeService';
import { getInventory }                 from '../../inventory/services/inventoryService';

// ── Tipos ─────────────────────────────────────────────────────────
import type { Recipe }                  from '../types';
import type { InventoryItem }           from '../../inventory/types/inventory';

// ─────────────────────────────────────────────────────────────────
// Receta vacía por defecto para el builder cuando se crea una nueva
// ─────────────────────────────────────────────────────────────────
const EMPTY_RECIPE: Recipe = {
  _id:         '',
  type:        'drink',
  method:      '',
  category:    '',
  isPrimary:   true,
  variantName: '',
  parentId:    null,
  ingredients: [],
  steps:       [],
  image:       '',
  imagePublicId: '',
} as unknown as Recipe;

// ─────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────
export default function NebulaRecipeStudio() {
  // ── Estado global del studio ───────────────────────────────────
  const [currentView,     setCurrentView]     = useState<StudioView>('dashboard');
  const [allRecipes,      setAllRecipes]       = useState<Recipe[]>([]);
  const [inventory,       setInventory]        = useState<InventoryItem[]>([]);
  const [selectedRecipe,  setSelectedRecipe]   = useState<Recipe | null>(null);
  const [isNewRecipe,     setIsNewRecipe]       = useState(false);
  const [search,          setSearch]           = useState('');
  const [loading,         setLoading]          = useState(true);

  // ── Carga inicial ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recipes, inv] = await Promise.all([
        getRecipes().catch(() => []),
        getInventory().catch(() => []),
      ]);
      setAllRecipes(Array.isArray(recipes) ? recipes : []);
      setInventory(Array.isArray(inv) ? inv : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Recetas filtradas para la búsqueda del TopBar ──────────────
  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allRecipes.filter((r) =>
      r.product?.name?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q)
    );
  }, [allRecipes, search]);

  // ── Handlers de navegación ────────────────────────────────────
  const handleNavigate = useCallback((view: StudioView) => {
    setCurrentView(view);
    // Al cambiar de vista limpiamos el builder si no es builder/variants
    if (view !== 'recipes' && view !== 'variants') {
      setSelectedRecipe(null);
      setIsNewRecipe(false);
    }
    setSearch('');
  }, []);

  const handleRecipeSelect = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsNewRecipe(false);
    setCurrentView('recipes');
  }, []);

  const handleNewRecipe = useCallback(() => {
    setSelectedRecipe(null);
    setIsNewRecipe(true);
    setCurrentView('recipes');
  }, []);

  const handleRecipeEdit = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsNewRecipe(false);
    setCurrentView('recipes');
  }, []);

  const handleBuilderSave = useCallback(async (saved: Recipe) => {
    // Actualizar lista local sin re-fetch completo
    setAllRecipes((prev) => {
      const idx = prev.findIndex((r) => r._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setSelectedRecipe(saved);
    setIsNewRecipe(false);
  }, []);

  // ── Receta activa para el builder ─────────────────────────────
  const activeRecipe = selectedRecipe ?? (isNewRecipe ? EMPTY_RECIPE : null);

  // ── Render de cada vista ──────────────────────────────────────
  const renderView = () => {
    switch (currentView) {

      // ── Dashboard ────────────────────────────────────────────
      case 'dashboard':
        return <StudioDashboard onNavigate={handleNavigate} />;

      // ── Recetas — Library + Builder ───────────────────────────
      case 'recipes':
        if (activeRecipe && (selectedRecipe || isNewRecipe)) {
          return (
            <RecipeStudioProvider
              recipe={activeRecipe}
              inventoryItems={inventory}
              allRecipes={allRecipes}
            >
              <RecipeBuilder
                initialRecipe={activeRecipe}
                inventoryItems={inventory}
                isNew={isNewRecipe}
                onSave={handleBuilderSave}
              />
            </RecipeStudioProvider>
          );
        }
        return (
          <RecipeLibrary
            recipes={allRecipes}
            hideNavigator
            onRecipeSelect={handleRecipeSelect}
            onRecipeEdit={handleRecipeEdit}
            onNewRecipe={handleNewRecipe}
            onNavigate={handleNavigate}
          />
        );

      // ── Variantes ─────────────────────────────────────────────
      case 'variants':
        return (
          <VariantManager
            recipes={allRecipes}
            masterRecipeId={selectedRecipe?._id}
            onVariantSelect={handleRecipeSelect}
          />
        );

      // ── Ingredientes ─────────────────────────────────────────
      case 'ingredients':
        return <StudioIngredientsView />;

      // ── Categorías ────────────────────────────────────────────
      case 'categories':
        return <StudioCategoriesView />;

      // ── Técnicas & Decoraciones ───────────────────────────────
      case 'techniques':
        return <StudioTechniquesView />;

      // ── Inventario — delegamos a la vista de ingredientes ─────
      case 'inventory':
        return <StudioIngredientsView />;

      // ── Reportes ─────────────────────────────────────────────
      case 'reports':
        return <StudioReportsView />;

      default:
        return <StudioDashboard onNavigate={handleNavigate} />;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Layout shell
  // IMPORTANTE: el contenedor raíz NO tiene overflow-y-auto —
  // el DashboardLayout.main (flex-1 min-w-0 min-h-0 overflow-y-auto)
  // es el único responsable del scroll vertical de la página.
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-full min-h-0">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <StudioTopBar
        search={search}
        onSearchChange={setSearch}
        recipeCount={allRecipes.length}
        filteredRecipes={filteredRecipes}
        onSelectRecipe={handleRecipeSelect}
      />

      {/* ── Body: sidebar + contenido ───────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar de navegación */}
        <StudioSidebar
          activeView={currentView}
          onNavigate={handleNavigate}
        />

        {/* Área de contenido principal
            - No aplica overflow propio
            - Cada vista es responsable de su propio max-width y padding
            - El scroll lo maneja el DashboardLayout.main */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <LoadingState />
          ) : (
            renderView()
          )}
        </main>
      </div>
    </div>
  );
}

// ── Estado de carga inicial ────────────────────────────────────────
function LoadingState() {
  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto w-full animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-white/8 rounded-xl" />
          <div className="h-3 w-56 bg-white/6 rounded-lg" />
        </div>
        <div className="h-9 w-28 bg-white/8 rounded-xl" />
      </div>

      {/* KPI skeletons */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 min-w-[160px] h-24 rounded-2xl bg-white/6 border border-white/6" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-white/6 border border-white/6" />
        ))}
      </div>
    </div>
  );
}
