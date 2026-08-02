import type { Recipe } from '../../types';

interface RecipePreparationPanelProps {
  recipe: Recipe;
}

/**
 * Componente de Preparación del Recipe Workspace
 * Muestra pasos y método de preparación
 * Preparado para evolucionar hacia el diseño Nebula Recipe Studio
 */
export function RecipePreparationPanel({ recipe }: RecipePreparationPanelProps) {
  return (
    <div className="recipe-preparation-panel">
      <h3 className="panel-title">Preparación</h3>
      
      {recipe.method && (
        <div className="preparation-method">
          <h4 className="method-title">Método</h4>
          <p className="method-description">{recipe.method}</p>
        </div>
      )}

      {recipe.steps && recipe.steps.length > 0 && (
        <div className="preparation-steps">
          <h4 className="steps-title">Pasos</h4>
          <ol className="steps-list">
            {recipe.steps.map((step) => (
              <li key={step.stepNumber} className="step-item">
                <span className="step-number">{step.stepNumber}</span>
                <span className="step-instruction">{step.instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {!recipe.method && (!recipe.steps || recipe.steps.length === 0) && (
        <p className="no-preparation">No hay información de preparación</p>
      )}
    </div>
  );
}
