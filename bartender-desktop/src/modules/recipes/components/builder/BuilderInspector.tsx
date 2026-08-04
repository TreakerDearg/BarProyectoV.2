import type { Recipe } from '../../types';
import styles from './BuilderInspector.module.css';

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
    <div className={styles.builderInspector}>
      <div className={styles.inspectorSection}>
        <h3 className={styles.inspectorTitle}>💰 Costos</h3>
        <div className={styles.inspectorCard}>
          <div className={styles.costRow}>
            <span className={styles.costLabel}>Costo Total</span>
            <span className={styles.costValue}>${(totalCost || 0).toFixed(2)}</span>
          </div>
          <div className={styles.costRow}>
            <span className={styles.costLabel}>Margen</span>
            <span className={`${styles.costValue} ${margin > 0 ? styles.success : styles.danger}`}>
              {(margin || 0).toFixed(2)}%
            </span>
          </div>
          <div className={styles.costBreakdown}>
            <h4 className={styles.breakdownTitle}>Desglose por Ingrediente</h4>
            {Array.from(ingredientCosts.entries()).map(([id, cost]) => (
              <div key={id} className={styles.breakdownItem}>
                <span className={styles.breakdownIngredient}>{id}</span>
                <span className={styles.breakdownCost}>${(cost || 0).toFixed(2)}</span>
                <span className={styles.breakdownPercentage}>
                  {(ingredientPercentages.get(id) || 0).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.inspectorSection}>
        <h3 className={styles.inspectorTitle}>📦 Inventario</h3>
        <div className={styles.inspectorCard}>
          <div className={styles.inventoryStatus}>
            <span className={`${styles.statusBadge} ${isAvailable ? styles.available : styles.unavailable}`}>
              {isAvailable ? '✓ Disponible' : '✗ No disponible'}
            </span>
          </div>
          {missingIngredients && missingIngredients.length > 0 && (
            <div className={styles.missingIngredients}>
              <h4 className={styles.missingTitle}>Faltantes</h4>
              {missingIngredients.map((item) => (
                <div key={item.inventoryItemId} className={styles.missingItem}>
                  <span className={styles.missingName}>{item.name}</span>
                  <span className={styles.missingAmount}>
                    {item.required} {item.unit} (disponible: {item.available})
                  </span>
                </div>
              ))}
            </div>
          )}
          {availableIngredients && availableIngredients.length > 0 && (
            <div className={styles.availableIngredients}>
              <h4 className={styles.availableTitle}>Disponibles</h4>
              {availableIngredients.slice(0, 5).map((item) => (
                <div key={item.inventoryItemId} className={styles.availableItem}>
                  <span className={styles.availableName}>{item.name}</span>
                  <span className={styles.availableAmount}>
                    {item.available} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.inspectorSection}>
        <h3 className={styles.inspectorTitle}>⏱️ Producción</h3>
        <div className={styles.inspectorCard}>
          <div className={styles.productionRow}>
            <span className={styles.productionLabel}>Tiempo Estimado</span>
            <span className={styles.productionValue}>{estimatedTime} min</span>
          </div>
          <div className={styles.productionRow}>
            <span className={styles.productionLabel}>Complejidad</span>
            <span className={`${styles.productionValue} ${styles[`complexity${complexity.charAt(0).toUpperCase()}${complexity.slice(1)}`]}`}>
              {complexity}
            </span>
          </div>
          <div className={styles.productionRow}>
            <span className={styles.productionLabel}>Pasos</span>
            <span className={styles.productionValue}>{recipe.steps?.length || 0}</span>
          </div>
          <div className={styles.productionRow}>
            <span className={styles.productionLabel}>Ingredientes</span>
            <span className={styles.productionValue}>{recipe.ingredients?.length || 0}</span>
          </div>
        </div>
      </div>

      {masterRecipe && (
        <div className={styles.inspectorSection}>
          <h3 className={styles.inspectorTitle}>🔀 Variante</h3>
          <div className={styles.inspectorCard}>
            <div className={styles.variantInfo}>
              <span className={styles.variantLabel}>Receta Base</span>
              <span className={styles.variantValue}>{masterRecipe.product?.name}</span>
            </div>
            {overriddenFields && Object.keys(overriddenFields).length > 0 && (
              <div className={styles.overriddenFields}>
                <h4 className={styles.overriddenTitle}>Campos Modificados</h4>
                {Object.keys(overriddenFields).map((field) => (
                  <div key={field} className={styles.overriddenItem}>
                    <span className={styles.overriddenField}>{field}</span>
                    <span className={styles.overriddenBadge}>✓ Sobrescrito</span>
                  </div>
                ))}
              </div>
            )}
            {inheritedFields && Object.keys(inheritedFields).length > 0 && (
              <div className={styles.inheritedFields}>
                <h4 className={styles.inheritedTitle}>Campos Heredados</h4>
                {Object.keys(inheritedFields).slice(0, 5).map((field) => (
                  <div key={field} className={styles.inheritedItem}>
                    <span className={styles.inheritedField}>{field}</span>
                    <span className={styles.inheritedBadge}>→ Heredado</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.inspectorSection}>
        <h3 className={styles.inspectorTitle}>📦 Producto</h3>
        <div className={styles.inspectorCard}>
          <div className={styles.productInfo}>
            <span className={styles.productLabel}>Nombre</span>
            <span className={styles.productValue}>{recipe.product?.name || 'No asignado'}</span>
          </div>
          <div className={styles.productInfo}>
            <span className={styles.productLabel}>Precio</span>
            <span className={styles.productValue}>${(recipe.product?.price || 0).toFixed(2)}</span>
          </div>
          <div className={styles.productInfo}>
            <span className={styles.productLabel}>Categoría</span>
            <span className={styles.productValue}>{recipe.category}</span>
          </div>
          <div className={styles.productInfo}>
            <span className={styles.productLabel}>Tipo</span>
            <span className={styles.productValue}>{recipe.type}</span>
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
