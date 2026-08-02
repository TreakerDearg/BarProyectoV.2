import type { Recipe } from '../../types';

interface RecipeInfoPanelProps {
  recipe: Recipe;
}

/**
 * Componente de Información General del Recipe Workspace
 * Muestra información básica de la receta
 * Preparado para evolucionar hacia el diseño Nebula Recipe Studio
 */
export function RecipeInfoPanel({ recipe }: RecipeInfoPanelProps) {
  return (
    <div className="recipe-info-panel">
      <h3 className="panel-title">Información General</h3>
      <div className="panel-content">
        <div className="info-row">
          <span className="info-label">Producto:</span>
          <span className="info-value">{recipe.product?.name || 'No asignado'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Tipo:</span>
          <span className="info-value">{recipe.type}</span>
        </div>
        {recipe.drinkStyle && (
          <div className="info-row">
            <span className="info-label">Estilo:</span>
            <span className="info-value">{recipe.drinkStyle}</span>
          </div>
        )}
        <div className="info-row">
          <span className="info-label">Categoría:</span>
          <span className="info-value">{recipe.category}</span>
        </div>
        {recipe.method && (
          <div className="info-row">
            <span className="info-label">Método:</span>
            <span className="info-value">{recipe.method}</span>
          </div>
        )}
        <div className="info-row">
          <span className="info-label">Estado:</span>
          <span className={`info-value ${recipe.isActive ? 'active' : 'inactive'}`}>
            {recipe.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
    </div>
  );
}
