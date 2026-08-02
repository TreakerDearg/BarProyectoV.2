import type { Recipe } from '../../types';
import { useRecipeCost } from '../../hooks';

interface RecipeCostsPanelProps {
  recipe: Recipe;
  inventoryItems: Array<{ _id?: string; name: string; cost: number; unit: string }>;
}

/**
 * Componente de Costos del Recipe Workspace
 * Muestra desglose de costos de la receta
 * Preparado para evolucionar hacia el diseño Nebula Recipe Studio
 */
export function RecipeCostsPanel({ recipe, inventoryItems }: RecipeCostsPanelProps) {
  const { totalCost, ingredientCosts, ingredientPercentages, averageCostPerIngredient } = useRecipeCost({
    ingredients: recipe.ingredients,
    inventoryItems,
  });

  const inventoryMap = new Map(
    inventoryItems.map((item) => [item._id, item])
  );

  return (
    <div className="recipe-costs-panel">
      <h3 className="panel-title">Costos</h3>
      
      <div className="cost-summary">
        <div className="cost-item total">
          <span className="cost-label">Costo Total</span>
          <span className="cost-value">${totalCost.toFixed(2)}</span>
        </div>
        <div className="cost-item">
          <span className="cost-label">Promedio/Ingrediente</span>
          <span className="cost-value">${averageCostPerIngredient.toFixed(2)}</span>
        </div>
      </div>

      <div className="cost-breakdown">
        <h4 className="breakdown-title">Desglose por Ingrediente</h4>
        <div className="breakdown-list">
          {recipe.ingredients.map((ingredient) => {
            const inventoryItem = inventoryMap.get(ingredient.inventoryItem._id);
            const cost = ingredientCosts.get(ingredient.inventoryItem._id) || 0;
            const percentage = ingredientPercentages.get(ingredient.inventoryItem._id) || 0;

            return (
              <div key={ingredient.inventoryItem._id} className="breakdown-item">
                <span className="ingredient-name">{inventoryItem?.name || 'Desconocido'}</span>
                <span className="ingredient-cost">${cost.toFixed(2)}</span>
                <span className="ingredient-percentage">({percentage.toFixed(1)}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
