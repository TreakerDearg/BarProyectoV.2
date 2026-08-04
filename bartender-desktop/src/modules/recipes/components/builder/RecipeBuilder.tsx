import { useState } from 'react';
import type { Recipe } from '../../types';
import { useRecipeCost, useRecipeAvailability, useRecipeInheritance } from '../../hooks';
import { createRecipe, updateRecipe } from '../../services/recipeService';
import { BuilderHeader } from './BuilderHeader';
import { BuilderExplorer } from './BuilderExplorer';
import { FormulaCanvas } from './FormulaCanvas';
import { SmartInspector } from './SmartInspector';
import { BuilderContextBar } from './BuilderContextBar';
import styles from './RecipeBuilder.module.css';

interface RecipeBuilderProps {
  recipe: Recipe;
  onRecipeChange: (recipe: Recipe) => void;
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
export function RecipeBuilder({ recipe, onRecipeChange, inventoryItems, masterRecipe, onSave, isNew = false }: RecipeBuilderProps) {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'techniques' | 'decorations' | 'variants'>('ingredients');
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { totalCost, ingredientCosts, ingredientPercentages } = useRecipeCost({ 
    ingredients: recipe.ingredients || [], 
    inventoryItems 
  });
  const { isAvailable, missingIngredients, availableIngredients } = useRecipeAvailability({ 
    ingredients: recipe.ingredients || [], 
    inventoryItems 
  });
  
  // Solo usar useRecipeInheritance si hay una receta maestra (es una variante) y la receta actual existe
  const inheritanceResult = masterRecipe && recipe
    ? useRecipeInheritance({ recipe, masterRecipe })
    : { inheritedFields: [], overriddenFields: [] };
  const { inheritedFields, overriddenFields } = inheritanceResult;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Validar que la receta tenga los campos requeridos
      if (!recipe.product || (typeof recipe.product !== 'string' && !recipe.product._id)) {
        throw new Error('La receta debe estar asociada a un producto');
      }

      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        throw new Error('La receta debe tener al menos un ingrediente');
      }

      if (!recipe.type) {
        throw new Error('La receta debe tener un tipo (drink/food)');
      }

      // Validar que todos los ingredientes tengan inventoryItem válido
      const invalidIngredients = recipe.ingredients.filter(ing => !ing.inventoryItem || (typeof ing.inventoryItem !== 'string' && !ing.inventoryItem._id));
      if (invalidIngredients.length > 0) {
        throw new Error('Todos los ingredientes deben estar asociados a items del inventario');
      }

      // Si se proporcionó un callback onSave personalizado, usarlo
      if (onSave) {
        await onSave(recipe);
      } else {
        // Guardado automático usando recipeService
        if (isNew || !recipe._id) {
          const savedRecipe = await createRecipe(recipe);
          onRecipeChange(savedRecipe);
        } else {
          const updatedRecipe = await updateRecipe(recipe._id, recipe);
          onRecipeChange(updatedRecipe);
        }
      }
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      setSaveError(error.message || 'Error al guardar la receta');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleIngredientAdd = (ingredient: any) => {
    const updatedRecipe = {
      ...recipe,
      ingredients: [...(recipe.ingredients || []), ingredient],
    };
    onRecipeChange(updatedRecipe);
  };

  const handleIngredientUpdate = (index: number, updatedIngredient: any) => {
    const updatedIngredients = [...(recipe.ingredients || [])];
    updatedIngredients[index] = updatedIngredient;
    onRecipeChange({ ...recipe, ingredients: updatedIngredients });
  };

  const handleIngredientRemove = (index: number) => {
    const updatedIngredients = (recipe.ingredients || []).filter((_, i) => i !== index);
    onRecipeChange({ ...recipe, ingredients: updatedIngredients });
  };

  const handleStepAdd = (step: any) => {
    const updatedRecipe = {
      ...recipe,
      steps: [...(recipe.steps || []), step],
    };
    onRecipeChange(updatedRecipe);
  };

  const handleStepUpdate = (index: number, updatedStep: any) => {
    const updatedSteps = [...(recipe.steps || [])];
    updatedSteps[index] = updatedStep;
    onRecipeChange({ ...recipe, steps: updatedSteps });
  };

  const handleStepRemove = (index: number) => {
    const updatedSteps = (recipe.steps || []).filter((_, i) => i !== index);
    onRecipeChange({ ...recipe, steps: updatedSteps });
  };

  const handleStepReorder = (fromIndex: number, toIndex: number) => {
    const updatedSteps = [...(recipe.steps || [])];
    const [movedStep] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, movedStep);
    onRecipeChange({ ...recipe, steps: updatedSteps });
  };

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
        <BuilderExplorer
          activeTab={activeTab}
          onTabChange={setActiveTab}
          inventoryItems={inventoryItems}
          onIngredientAdd={handleIngredientAdd}
          recipe={recipe}
        />

        {/* Formula Canvas */}
        <FormulaCanvas
          recipe={recipe}
          ingredients={recipe.ingredients}
          steps={recipe.steps || []}
          onIngredientUpdate={handleIngredientUpdate}
          onIngredientRemove={handleIngredientRemove}
          onStepAdd={handleStepAdd}
          onStepUpdate={handleStepUpdate}
          onStepRemove={handleStepRemove}
          onStepReorder={handleStepReorder}
          inventoryItems={inventoryItems}
        />

        {/* Smart Inspector Panel */}
        <SmartInspector
          totalCost={totalCost}
          ingredientCosts={ingredientCosts}
          ingredientPercentages={ingredientPercentages}
          isAvailable={isAvailable}
          missingIngredients={missingIngredients}
          availableIngredients={availableIngredients}
          inheritedFields={inheritedFields}
          overriddenFields={overriddenFields}
          recipe={recipe}
          masterRecipe={masterRecipe}
        />
      </div>

      {/* Bottom Context Bar */}
      <BuilderContextBar
        recipe={recipe}
        totalCost={totalCost}
        isAvailable={isAvailable}
        lastModified={recipe.updatedAt}
        onZoomIn={() => setZoom(Math.min(zoom + 10, 150))}
        onZoomOut={() => setZoom(Math.max(zoom - 10, 50))}
        onZoomReset={() => setZoom(100)}
        zoom={zoom}
      />
    </div>
  );
}
