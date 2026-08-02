import type { Recipe } from '../../types';

interface RecipePreviewProps {
  recipe: Recipe;
  totalCost: number;
  isAvailable: boolean;
}

/**
 * RecipePreview - Ficha gastronómica que se actualiza en tiempo real
 * Muestra fotografía, ingredientes, presentación, cristalería, decoración, pasos resumidos, tiempo, dificultad, rentabilidad
 */
export function RecipePreview({ recipe, totalCost, isAvailable }: RecipePreviewProps) {
  const complexity = calculateComplexity(recipe);
  const estimatedTime = calculateEstimatedTime(recipe);
  const margin = calculateMargin(recipe, totalCost);
  const difficulty = getDifficultyLabel(complexity);

  return (
    <div className="recipe-preview">
      <div className="preview-header">
        <div className="preview-image">
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.product?.name} />
          ) : (
            <div className="image-placeholder">
              {recipe.type === 'drink' ? '🍸' : '🍰'}
            </div>
          )}
        </div>
        <div className="preview-info">
          <h2 className="preview-title">{recipe.product?.name}</h2>
          <span className="preview-category">{recipe.category}</span>
          <div className="preview-badges">
            <span className={`badge ${isAvailable ? 'available' : 'unavailable'}`}>
              {isAvailable ? '✓ Disponible' : '✗ No disponible'}
            </span>
            {recipe.isFavorite && <span className="badge favorite">⭐ Favorita</span>}
            {recipe.drinkStyle === 'author' && <span className="badge author">✨ Autor</span>}
          </div>
        </div>
      </div>

      <div className="preview-stats">
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <div className="stat-content">
            <span className="stat-value">${totalCost.toFixed(2)}</span>
            <span className="stat-label">Costo</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-content">
            <span className={`stat-value ${margin > 0 ? 'success' : 'danger'}`}>
              {margin.toFixed(0)}%
            </span>
            <span className="stat-label">Margen</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏱️</span>
          <div className="stat-content">
            <span className="stat-value">{estimatedTime}m</span>
            <span className="stat-label">Tiempo</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <div className="stat-content">
            <span className="stat-value">{difficulty}</span>
            <span className="stat-label">Dificultad</span>
          </div>
        </div>
      </div>

      <div className="preview-section">
        <h3 className="section-title">🥗 Ingredientes</h3>
        <div className="ingredients-list">
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="preview-ingredient">
              <span className="ingredient-name">{ingredient.inventoryItem.name}</span>
              <span className="ingredient-amount">
                {ingredient.quantity} {ingredient.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="preview-section">
        <h3 className="section-title">✨ Presentación</h3>
        <div className="presentation-grid">
          <div className="presentation-item">
            <span className="item-label">Cristalería</span>
            <span className="item-value">{recipe.specifications?.glass || 'No especificado'}</span>
          </div>
          <div className="presentation-item">
            <span className="item-label">Hielo</span>
            <span className="item-value">{recipe.specifications?.ice || 'No especificado'}</span>
          </div>
          <div className="presentation-item">
            <span className="item-label">Decoración</span>
            <span className="item-value">{recipe.decorationIds?.length || 0} elementos</span>
          </div>
          <div className="presentation-item">
            <span className="item-label">Técnica</span>
            <span className="item-value">{recipe.method || 'No especificado'}</span>
          </div>
        </div>
      </div>

      {recipe.steps && recipe.steps.length > 0 && (
        <div className="preview-section">
          <h3 className="section-title">📝 Pasos Resumidos</h3>
          <div className="steps-summary">
            {recipe.steps.slice(0, 5).map((step, index) => (
              <div key={index} className="summary-step">
                <span className="step-number">{step.stepNumber}</span>
                <span className="step-text">{step.instruction}</span>
              </div>
            ))}
            {recipe.steps.length > 5 && (
              <span className="steps-more">+{recipe.steps.length - 5} pasos más</span>
            )}
          </div>
        </div>
      )}

      <div className="preview-footer">
        <div className="footer-info">
          <span className="info-label">Autor:</span>
          <span className="info-value">{recipe.author || 'Sistema'}</span>
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="footer-tags">
            {recipe.tags.map((tag) => (
              <span key={tag} className="footer-tag">{tag}</span>
            ))}
          </div>
        )}
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
  return Math.round(stepCount * 2 + ingredientCount * 0.5);
}

function calculateMargin(recipe: Recipe, totalCost: number): number {
  const price = recipe.product?.price || 0;
  if (price === 0) return 0;
  return ((price - totalCost) / price) * 100;
}

function getDifficultyLabel(complexity: 'low' | 'medium' | 'high'): string {
  switch (complexity) {
    case 'low': return 'Fácil';
    case 'medium': return 'Media';
    case 'high': return 'Difícil';
  }
}
