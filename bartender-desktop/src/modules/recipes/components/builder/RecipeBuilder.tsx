import { RecipeWorkspaceProvider, useRecipeWorkspace } from '../../contexts/RecipeWorkspaceContext';
import type { Recipe } from '../../types';
import { BuilderHeader } from './BuilderHeader';
import { BuilderExplorer } from './BuilderExplorer';
import { FormulaCanvas } from './FormulaCanvas';
import { SmartInspector } from './SmartInspector';
import { BuilderContextBar } from './BuilderContextBar';
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
    <RecipeWorkspaceProvider
      initialRecipe={initialRecipe}
      inventoryItems={inventoryItems}
      masterRecipe={masterRecipe}
      onSave={onSave}
      isNew={isNew}
    >
      <RecipeBuilderContent />
    </RecipeWorkspaceProvider>
  );
}

function RecipeBuilderContent() {
  const {
    recipe,
    isSaving,
    saveError,
    handleSave,
  } = useRecipeWorkspace();

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
        {/* Explorer Panel */}
        <BuilderExplorer />

        {/* Formula Canvas */}
        <FormulaCanvas />

        {/* Smart Inspector Panel */}
        <SmartInspector />
      </div>

      {/* Bottom Context Bar */}
      <BuilderContextBar />
    </div>
  );
}
