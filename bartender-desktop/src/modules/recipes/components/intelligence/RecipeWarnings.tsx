import type { RecipeWarning } from '../../types';

interface RecipeWarningsProps {
  warnings: RecipeWarning[];
  onDismiss?: (warningId: string) => void;
}

/**
 * RecipeWarnings - Sistema de advertencias
 * Muestra advertencias de stock, costo, producto sin receta, etc.
 */
export function RecipeWarnings({ warnings, onDismiss }: RecipeWarningsProps) {
  if (warnings.length === 0) {
    return (
      <div className="recipe-warnings empty">
        <span className="warnings-empty">✓ Sin advertencias</span>
      </div>
    );
  }

  return (
    <div className="recipe-warnings">
      <h3 className="warnings-title">Advertencias</h3>
      <div className="warnings-list">
        {warnings.map((warning) => (
          <div
            key={warning.id}
            className={`warning-item severity-${warning.severity}`}
          >
            <div className="warning-content">
              <span className="warning-icon">
                {warning.severity === 'high' && '⚠️'}
                {warning.severity === 'medium' && '⚡'}
                {warning.severity === 'low' && 'ℹ️'}
              </span>
              <span className="warning-message">{warning.message}</span>
            </div>
            {warning.suggestion && (
              <span className="warning-suggestion">{warning.suggestion}</span>
            )}
            {onDismiss && (
              <button
                className="warning-dismiss"
                onClick={() => onDismiss(warning.id)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
