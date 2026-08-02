import { useState } from 'react';
import type { Recipe } from '../../types';
import { useRecipeCost, useRecipeAvailability, useRecipeInheritance } from '../../hooks';
import { ExplorerPanel } from './ExplorerPanel';
import { FormulaCanvas } from './FormulaCanvas';
import { BuilderInspector } from './BuilderInspector';

interface RecipeBuilderProps {
  recipe: Recipe;
  onRecipeChange: (recipe: Recipe) => void;
  inventoryItems: any[];
  masterRecipe?: Recipe;
}

/**
 * RecipeBuilder - Constructor visual de recetas profesional
 * Layout dividido en paneles: Header, Explorer, Formula Canvas, Inspector
 * Inspirado en Figma, Notion, Milanote, FigJam
 */
export function RecipeBuilder({ recipe, onRecipeChange, inventoryItems, masterRecipe }: RecipeBuilderProps) {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'techniques' | 'decorations' | 'variants'>('ingredients');
  const [showGraph, setShowGraph] = useState(false);

  const { totalCost, ingredientCosts, ingredientPercentages } = useRecipeCost({ 
    ingredients: recipe.ingredients, 
    inventoryItems 
  });
  const { isAvailable, missingIngredients, availableIngredients } = useRecipeAvailability({ 
    ingredients: recipe.ingredients, 
    inventoryItems 
  });
  const { inheritedFields, overriddenFields } = useRecipeInheritance({ recipe, masterRecipe: masterRecipe || undefined });

  const handleIngredientAdd = (ingredient: any) => {
    const updatedRecipe = {
      ...recipe,
      ingredients: [...recipe.ingredients, ingredient],
    };
    onRecipeChange(updatedRecipe);
  };

  const handleIngredientUpdate = (index: number, updatedIngredient: any) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = updatedIngredient;
    onRecipeChange({ ...recipe, ingredients: updatedIngredients });
  };

  const handleIngredientRemove = (index: number) => {
    const updatedIngredients = recipe.ingredients.filter((_, i) => i !== index);
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
    <div className="recipe-builder">
      {/* Header */}
      <div className="builder-header">
        <div className="header-left">
          <h1 className="builder-title">{recipe.product?.name || 'Nueva Receta'}</h1>
          <span className="builder-subtitle">{recipe.category}</span>
        </div>
        <div className="header-right">
          <button
            className={`header-button ${showGraph ? 'active' : ''}`}
            onClick={() => setShowGraph(!showGraph)}
          >
            📊 Graph
          </button>
          <button className="header-button">💾 Guardar</button>
          <button className="header-button primary">🚀 Publicar</button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="builder-layout">
        {/* Explorer Panel */}
        <ExplorerPanel
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

        {/* Inspector Panel */}
        <BuilderInspector
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

      {/* Recipe Graph Overlay */}
      {showGraph && (
        <div className="recipe-graph-overlay">
          <div className="graph-header">
            <h3>Recipe Graph</h3>
            <button onClick={() => setShowGraph(false)}>✕</button>
          </div>
          <div className="graph-content">
            {/* Graph visualization will be implemented */}
            <p>Visualización de conexiones: Producto → Receta Base → Variante → Ingredientes → Inventario</p>
          </div>
        </div>
      )}
    </div>
  );
}
