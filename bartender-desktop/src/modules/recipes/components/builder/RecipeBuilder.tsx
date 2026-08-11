import { useState, useEffect } from 'react';
import { RecipeWorkspaceProvider, useRecipeWorkspace } from '../../contexts/RecipeWorkspaceContext';
import type { Recipe } from '../../types';
import { BuilderHeader } from './BuilderHeader';
import { BuilderNavigation } from './BuilderNavigation';
import { ExplorerWorkspace } from './ExplorerWorkspace';
import { FormulaCanvas } from './FormulaCanvas';
import { SmartInspector } from './SmartInspector';
import { BuilderContextBar } from './BuilderContextBar';
import { RecipeBuilderErrorBoundary } from './RecipeBuilderErrorBoundary';
import { getDrinkProductsWithRecipes, getRecipes } from '../../services/recipeService';
import { getTechniques, getDecorations } from '../../services/techniqueService';
import { getCollections } from '../../services/collectionService';
import { useInventory } from '../../../inventory/hooks/useInventoryQueries';
import styles from './RecipeBuilder.module.css';

interface RecipeBuilderProps {
  initialRecipe: Recipe;
  inventoryItems: any[];
  masterRecipe?: Recipe;
  onSave?: (recipe: Recipe) => Promise<void>;
  isNew?: boolean;
}

/**
 * RecipeBuilder - Constructor visual de recetas profesional
 * Layout dividido en 5 zonas: Header, Explorer, Formula Canvas, Smart Inspector, Context Bar
 * Inspirado en Figma, Notion, Milanote, FigJam
 */
export function RecipeBuilder({ initialRecipe, inventoryItems, masterRecipe, onSave, isNew = false }: RecipeBuilderProps) {
  return (
    <RecipeBuilderErrorBoundary>
      <RecipeWorkspaceProvider
        initialRecipe={initialRecipe}
        inventoryItems={inventoryItems}
        masterRecipe={masterRecipe}
        onSave={onSave}
        isNew={isNew}
      >
        <RecipeBuilderContent />
      </RecipeWorkspaceProvider>
    </RecipeBuilderErrorBoundary>
  );
}

function RecipeBuilderContent() {
  const {
    recipe,
    isSaving,
    saveError,
    handleSave,
    activeTab,
    setActiveTab,
  } = useRecipeWorkspace();

  // Counter states - loaded independently of active tab
  const [counts, setCounts] = useState({
    products: null as number | null,
    ingredients: null as number | null,
    techniques: null as number | null,
    decorations: null as number | null,
    variants: null as number | null,
    collections: null as number | null,
  });

  const [loading, setLoading] = useState({
    products: true,
    ingredients: true,
    techniques: true,
    decorations: true,
    variants: true,
    collections: true,
  });

  const [errors, setErrors] = useState({
    products: false,
    ingredients: false,
    techniques: false,
    decorations: false,
    variants: false,
    collections: false,
  });

  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useInventory();

  // Load all counters on mount
  useEffect(() => {
    const loadAllCounts = async () => {
      // Load products count
      try {
        const productsData = await getDrinkProductsWithRecipes({ available: true });
        setCounts(prev => ({ ...prev, products: (productsData || []).length }));
        setLoading(prev => ({ ...prev, products: false }));
      } catch {
        setErrors(prev => ({ ...prev, products: true }));
        setLoading(prev => ({ ...prev, products: false }));
      }

      // Load techniques count
      try {
        const techniquesData = await getTechniques();
        setCounts(prev => ({ ...prev, techniques: (techniquesData || []).length }));
        setLoading(prev => ({ ...prev, techniques: false }));
      } catch {
        setErrors(prev => ({ ...prev, techniques: true }));
        setLoading(prev => ({ ...prev, techniques: false }));
      }

      // Load decorations count
      try {
        const decorationsData = await getDecorations();
        setCounts(prev => ({ ...prev, decorations: (decorationsData || []).length }));
        setLoading(prev => ({ ...prev, decorations: false }));
      } catch {
        setErrors(prev => ({ ...prev, decorations: true }));
        setLoading(prev => ({ ...prev, decorations: false }));
      }

      // Load collections count
      try {
        const collectionsData = await getCollections();
        setCounts(prev => ({ ...prev, collections: (collectionsData || []).length }));
        setLoading(prev => ({ ...prev, collections: false }));
      } catch {
        setErrors(prev => ({ ...prev, collections: true }));
        setLoading(prev => ({ ...prev, collections: false }));
      }

      // Load variants count
      try {
        const allRecipes = await getRecipes({ type: 'drink' });
        const variantRecipes = (allRecipes || []).filter((r: any) => !r.isPrimary && r.parentId);
        setCounts(prev => ({ ...prev, variants: variantRecipes.length }));
        setLoading(prev => ({ ...prev, variants: false }));
      } catch {
        setErrors(prev => ({ ...prev, variants: true }));
        setLoading(prev => ({ ...prev, variants: false }));
      }
    };

    loadAllCounts();
  }, []);

  // Update ingredients count from inventory hook
  useEffect(() => {
    if (!inventoryLoading && inventoryData) {
      setCounts(prev => ({ ...prev, ingredients: (inventoryData || []).length }));
      setLoading(prev => ({ ...prev, ingredients: false }));
    }
    if (inventoryError) {
      setErrors(prev => ({ ...prev, ingredients: true }));
      setLoading(prev => ({ ...prev, ingredients: false }));
    }
  }, [inventoryData, inventoryLoading, inventoryError]);

  // Check if recipe has content (product selected or ingredients added)
  const hasRecipeContent = recipe?.product?._id || (recipe?.ingredients?.length ?? 0) > 0;

  return (
    <div className={styles.recipeBuilder}>
      {/* Header */}
      <BuilderHeader
        recipe={recipe}
        onSave={handleSave}
        isSaving={isSaving}
        saveError={saveError}
        onPublish={() => console.log('Publish')}
        onDuplicate={() => console.log('Duplicate')}
        onVersions={() => console.log('Versions')}
        onPreview={() => console.log('Preview')}
      />

      {/* Main Layout */}
      <div className={`${styles.builderLayout} ${hasRecipeContent ? styles.hasContent : styles.emptyRecipe}`}>
        {/* Explorer Navigation - Sidebar */}
        <BuilderNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
          loading={loading}
          errors={errors}
        />

        {/* Explorer Workspace - Main content area */}
        <ExplorerWorkspace activeTab={activeTab} />

        {/* Formula Canvas & Smart Inspector - Only show when recipe has content */}
        {hasRecipeContent && (
          <>
            {/* Formula Canvas */}
            <FormulaCanvas />

            {/* Smart Inspector Panel */}
            <SmartInspector />
          </>
        )}
      </div>

      {/* Bottom Context Bar */}
      <BuilderContextBar />
    </div>
  );
}
