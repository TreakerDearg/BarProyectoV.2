import type { Recipe } from '../../types';

interface BuilderInspectorProps {
  totalCost: number;
  ingredientCosts: Map<string, number>;
  ingredientPercentages: Map<string, number>;
  isAvailable: boolean;
  missingIngredients: any[];
  availableIngredients: any[];
  inheritedFields: any;
  overriddenFields: any;
  recipe: Recipe;
  masterRecipe?: Recipe;
}

/**
 * BuilderInspector - Inspector inteligente con Costos, Inventario, Producción, Variante, Producto
 * Se actualiza automáticamente en tiempo real
 */
export function BuilderInspector({
  totalCost,
  ingredientCosts,
  ingredientPercentages,
  isAvailable,
  missingIngredients,
  availableIngredients,
  inheritedFields,
  overriddenFields,
  recipe,
  masterRecipe,
}: BuilderInspectorProps) {
  const complexity = calculateComplexity(recipe);
  const estimatedTime = calculateEstimatedTime(recipe);
  const margin = calculateMargin(recipe, totalCost);

  return (
    <div className="builder-inspector">
      <div className="inspector-section">
        <h3 className="inspector-title">💰 Costos</h3>
        <div className="inspector-card">
          <div className="cost-row">
            <span className="cost-label">Costo Total</span>
            <span className="cost-value">${totalCost.toFixed(2)}</span>
          </div>
          <div className="cost-row">
            <span className="cost-label">Margen</span>
            <span className={`cost-value ${margin > 0 ? 'success' : 'danger'}`}>
              {margin.toFixed(2)}%
            </span>
          </div>
          <div className="cost-breakdown">
            <h4 className="breakdown-title">Desglose por Ingrediente</h4>
            {Array.from(ingredientCosts.entries()).map(([id, cost]) => (
              <div key={id} className="breakdown-item">
                <span className="breakdown-ingredient">{id}</span>
                <span className="breakdown-cost">${cost.toFixed(2)}</span>
                <span className="breakdown-percentage">
                  {ingredientPercentages.get(id)?.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="inspector-section">
        <h3 className="inspector-title">📦 Inventario</h3>
        <div className="inspector-card">
          <div className="inventory-status">
            <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
              {isAvailable ? '✓ Disponible' : '✗ No disponible'}
            </span>
          </div>
          {missingIngredients.length > 0 && (
            <div className="missing-ingredients">
              <h4 className="missing-title">Faltantes</h4>
              {missingIngredients.map((item) => (
                <div key={item.inventoryItemId} className="missing-item">
                  <span className="missing-name">{item.name}</span>
                  <span className="missing-amount">
                    {item.required} {item.unit} (disponible: {item.available})
                  </span>
                </div>
              ))}
            </div>
          )}
          {availableIngredients.length > 0 && (
            <div className="available-ingredients">
              <h4 className="available-title">Disponibles</h4>
              {availableIngredients.slice(0, 5).map((item) => (
                <div key={item.inventoryItemId} className="available-item">
                  <span className="available-name">{item.name}</span>
                  <span className="available-amount">
                    {item.available} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="inspector-section">
        <h3 className="inspector-title">⏱️ Producción</h3>
        <div className="inspector-card">
          <div className="production-row">
            <span className="production-label">Tiempo Estimado</span>
            <span className="production-value">{estimatedTime} min</span>
          </div>
          <div className="production-row">
            <span className="production-label">Complejidad</span>
            <span className={`production-value complexity-${complexity}`}>
              {complexity}
            </span>
          </div>
          <div className="production-row">
            <span className="production-label">Pasos</span>
            <span className="production-value">{recipe.steps?.length || 0}</span>
          </div>
          <div className="production-row">
            <span className="production-label">Ingredientes</span>
            <span className="production-value">{recipe.ingredients.length}</span>
          </div>
        </div>
      </div>

      {masterRecipe && (
        <div className="inspector-section">
          <h3 className="inspector-title">🔀 Variante</h3>
          <div className="inspector-card">
            <div className="variant-info">
              <span className="variant-label">Receta Base</span>
              <span className="variant-value">{masterRecipe.product?.name}</span>
            </div>
            {Object.keys(overriddenFields).length > 0 && (
              <div className="overridden-fields">
                <h4 className="overridden-title">Campos Modificados</h4>
                {Object.keys(overriddenFields).map((field) => (
                  <div key={field} className="overridden-item">
                    <span className="overridden-field">{field}</span>
                    <span className="overridden-badge">✓ Sobrescrito</span>
                  </div>
                ))}
              </div>
            )}
            {Object.keys(inheritedFields).length > 0 && (
              <div className="inherited-fields">
                <h4 className="inherited-title">Campos Heredados</h4>
                {Object.keys(inheritedFields).slice(0, 5).map((field) => (
                  <div key={field} className="inherited-item">
                    <span className="inherited-field">{field}</span>
                    <span className="inherited-badge">→ Heredado</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="inspector-section">
        <h3 className="inspector-title">📦 Producto</h3>
        <div className="inspector-card">
          <div className="product-info">
            <span className="product-label">Nombre</span>
            <span className="product-value">{recipe.product?.name || 'No asignado'}</span>
          </div>
          <div className="product-info">
            <span className="product-label">Precio</span>
            <span className="product-value">${recipe.product?.price || '0.00'}</span>
          </div>
          <div className="product-info">
            <span className="product-label">Categoría</span>
            <span className="product-value">{recipe.category}</span>
          </div>
          <div className="product-info">
            <span className="product-label">Tipo</span>
            <span className="product-value">{recipe.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateComplexity(recipe: Recipe): 'low' | 'medium' | 'high' {
  const ingredientCount = recipe.ingredients.length;
  const stepCount = recipe.steps?.length || 0;
  
  if (ingredientCount <= 3 && stepCount <= 2) return 'low';
  if (ingredientCount <= 6 && stepCount <= 4) return 'medium';
  return 'high';
}

function calculateEstimatedTime(recipe: Recipe): number {
  const stepCount = recipe.steps?.length || 0;
  const ingredientCount = recipe.ingredients.length;
  return stepCount * 2 + ingredientCount * 0.5;
}

function calculateMargin(recipe: Recipe, totalCost: number): number {
  const price = recipe.product?.price || 0;
  if (price === 0) return 0;
  return ((price - totalCost) / price) * 100;
}
