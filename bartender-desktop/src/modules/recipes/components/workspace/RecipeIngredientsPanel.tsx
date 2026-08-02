import type { Recipe } from '../../types';
import { useRecipeAvailability } from '../../hooks';

interface RecipeIngredientsPanelProps {
  recipe: Recipe;
  inventoryItems: Array<{ _id?: string; name: string; stock: number; cost: number; unit: string }>;
}

/**
 * Componente de Ingredientes del Recipe Workspace
 * Muestra ingredientes de la receta con disponibilidad
 * Preparado para evolucionar hacia el diseño Nebula Recipe Studio
 */
export function RecipeIngredientsPanel({ recipe, inventoryItems }: RecipeIngredientsPanelProps) {
  const { isAvailable, missingIngredients, availableIngredients, totalIngredients } = useRecipeAvailability({
    ingredients: recipe.ingredients,
    inventoryItems,
  });

  return (
    <div className="recipe-ingredients-panel">
      <h3 className="panel-title">Ingredientes ({totalIngredients})</h3>
      
      <div className="availability-status">
        <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? 'Disponible' : 'No disponible'}
        </span>
      </div>

      <div className="ingredients-list">
        {availableIngredients.map((ingredient) => (
          <div key={ingredient.inventoryItemId} className="ingredient-item available">
            <span className="ingredient-name">{ingredient.name}</span>
            <span className="ingredient-quantity">
              {ingredient.available} {ingredient.unit} disponible
            </span>
          </div>
        ))}
        
        {missingIngredients.map((ingredient) => (
          <div key={ingredient.inventoryItemId} className="ingredient-item missing">
            <span className="ingredient-name">{ingredient.name}</span>
            <span className="ingredient-quantity">
              {ingredient.available} {ingredient.unit} disponible (requiere {ingredient.required} {ingredient.unit})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
