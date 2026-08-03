import { useState } from 'react';
import { useRecipeStudio } from '../../contexts/RecipeStudioContext';

type PreviewMode = 'standard' | 'print' | 'mobile' | 'menu';

/**
 * RecipePreview - Ficha gastronómica profesional mejorada
 * Muestra historia, decoraciones, cristalería, etiquetas, autor, versión, Health Score, Warnings
 * Soporta preview impresión/móvil/carta
 * Consume RecipeStudioContext para datos en tiempo real
 */
export function RecipePreview() {
  const { recipe, totalCost, isAvailable, healthScore, warnings, productionAnalysis } = useRecipeStudio();
  const [previewMode, setPreviewMode] = useState<PreviewMode>('standard');

  const complexity = productionAnalysis.difficulty;
  const estimatedTime = productionAnalysis.totalTime;
  const margin = productionAnalysis.margin;
  const difficulty = getDifficultyLabel(complexity);

  return (
    <div className={`recipe-preview mode-${previewMode}`}>
      <div className="preview-controls">
        <button
          className={`mode-btn ${previewMode === 'standard' ? 'active' : ''}`}
          onClick={() => setPreviewMode('standard')}
        >
          Standard
        </button>
        <button
          className={`mode-btn ${previewMode === 'print' ? 'active' : ''}`}
          onClick={() => setPreviewMode('print')}
        >
          Impresión
        </button>
        <button
          className={`mode-btn ${previewMode === 'mobile' ? 'active' : ''}`}
          onClick={() => setPreviewMode('mobile')}
        >
          Móvil
        </button>
        <button
          className={`mode-btn ${previewMode === 'menu' ? 'active' : ''}`}
          onClick={() => setPreviewMode('menu')}
        >
          Carta
        </button>
      </div>

      <div className="preview-content">
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
            {recipe.description && (
              <p className="preview-description">{recipe.description}</p>
            )}
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
          <div className="stat-card">
            <span className="stat-icon">❤️</span>
            <div className="stat-content">
              <span className={`stat-value ${healthScore.overall >= 80 ? 'success' : healthScore.overall >= 60 ? 'warning' : 'danger'}`}>
                {healthScore.overall}
              </span>
              <span className="stat-label">Health</span>
            </div>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="preview-warnings">
            <h4 className="warnings-preview-title">⚠️ Advertencias ({warnings.length})</h4>
            <div className="warnings-preview-list">
              {warnings.slice(0, 3).map((warning) => (
                <span key={warning.id} className="warning-preview-item">
                  {warning.message}
                </span>
              ))}
              {warnings.length > 3 && (
                <span className="warnings-more">+{warnings.length - 3} más</span>
              )}
            </div>
          </div>
        )}

        <div className="preview-section">
          <h3 className="section-title">📖 Historia</h3>
          <p className="history-text">
            {recipe.history || 'Sin historia disponible'}
          </p>
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
          <div className="footer-info">
            <span className="info-label">Versión:</span>
            <span className="info-value">{recipe.version || '1.0'}</span>
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
    </div>
  );
}

function getDifficultyLabel(complexity: 'low' | 'medium' | 'high'): string {
  switch (complexity) {
    case 'low': return 'Fácil';
    case 'medium': return 'Media';
    case 'high': return 'Difícil';
  }
}
