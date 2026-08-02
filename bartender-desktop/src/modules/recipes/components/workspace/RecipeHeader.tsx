import type { Recipe } from '../../types';

interface RecipeHeaderProps {
  recipe: Recipe;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Componente Header del Recipe Workspace
 * Muestra información básica de la receta y acciones principales
 * Preparado para evolucionar hacia el diseño Nebula Recipe Studio
 */
export function RecipeHeader({ recipe, onEdit, onDelete }: RecipeHeaderProps) {
  return (
    <div className="recipe-header">
      <div className="recipe-header-content">
        <h1 className="recipe-title">{recipe.product?.name || 'Sin nombre'}</h1>
        <div className="recipe-meta">
          <span className="recipe-type">{recipe.type}</span>
          {recipe.category && <span className="recipe-category">{recipe.category}</span>}
        </div>
      </div>
      <div className="recipe-header-actions">
        {onEdit && (
          <button onClick={onEdit} className="btn-edit">
            Editar
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="btn-delete">
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
