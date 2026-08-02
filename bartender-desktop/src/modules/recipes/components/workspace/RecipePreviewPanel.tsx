import type { Recipe } from '../../types';

interface RecipePreviewPanelProps {
  recipe: Recipe;
}

/**
 * Componente de Vista Previa del Recipe Workspace
 * Muestra vista previa de la receta
 * Preparado para evolucionar hacia el diseño Nebula Recipe Studio
 */
export function RecipePreviewPanel({ recipe }: RecipePreviewPanelProps) {
  return (
    <div className="recipe-preview-panel">
      <h3 className="panel-title">Vista Previa</h3>
      
      <div className="preview-content">
        <div className="preview-header">
          <h4 className="preview-title">{recipe.product?.name || 'Sin nombre'}</h4>
          <span className="preview-type">{recipe.type}</span>
        </div>

        <div className="preview-stats">
          <div className="stat-item">
            <span className="stat-label">Ingredientes</span>
            <span className="stat-value">{recipe.ingredients.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pasos</span>
            <span className="stat-value">{recipe.steps?.length || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Costo</span>
            <span className="stat-value">${recipe.totalCost?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {recipe.image && (
          <div className="preview-image">
            <img src={recipe.image} alt={recipe.product?.name} />
          </div>
        )}

        {recipe.method && (
          <div className="preview-method">
            <span className="method-label">Método:</span>
            <span className="method-value">{recipe.method}</span>
          </div>
        )}
      </div>
    </div>
  );
}
