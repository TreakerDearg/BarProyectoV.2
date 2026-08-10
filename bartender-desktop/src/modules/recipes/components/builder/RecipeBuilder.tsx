import { RecipeWorkspaceProvider, useRecipeWorkspace } from '../../contexts/RecipeWorkspaceContext';
import type { Recipe } from '../../types';
import { UtensilsCrossed } from 'lucide-react';
import { BuilderHeader } from './BuilderHeader';
import { BuilderExplorer } from './BuilderExplorer';
import { FormulaCanvas } from './FormulaCanvas';
import { SmartInspector } from './SmartInspector';
import { BuilderContextBar } from './BuilderContextBar';
import { RecipeBuilderErrorBoundary } from './RecipeBuilderErrorBoundary';
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
  } = useRecipeWorkspace();

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
      <div className={styles.builderLayout}>
        {/* Explorer Panel - Always visible */}
        <BuilderExplorer />

        {/* Formula Canvas & Smart Inspector - Only show when recipe has content */}
        {hasRecipeContent ? (
          <>
            {/* Formula Canvas */}
            <FormulaCanvas />

            {/* Smart Inspector Panel */}
            <SmartInspector />
          </>
        ) : (
          <div className={styles.emptyWorkspace}>
            <div className={styles.emptyWorkspaceContent}>
              <UtensilsCrossed size={48} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Comienza tu receta</h3>
              <p className={styles.emptyDescription}>Selecciona un producto o agrega ingredientes para empezar a construir tu receta</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Context Bar */}
      <BuilderContextBar />
    </div>
  );
}
