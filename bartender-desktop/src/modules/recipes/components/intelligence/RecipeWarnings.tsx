import { useState } from 'react';
import type { RecipeWarning } from '../../types';

interface RecipeWarningsProps {
  warnings: RecipeWarning[];
  onDismiss?: (warningId: string) => void;
  onResolve?: (warningId: string) => void;
}

type WarningFilter = 'all' | 'high' | 'medium' | 'low';

/**
 * RecipeWarnings - Sistema de advertencias mejorado
 * Componente completo con filtros, prioridad, descartar, resolver, expandir información, acción sugerida
 */
export function RecipeWarnings({ warnings, onDismiss, onResolve }: RecipeWarningsProps) {
  const [filter, setFilter] = useState<WarningFilter>('all');
  const [expandedWarning, setExpandedWarning] = useState<string | null>(null);

  const filteredWarnings = warnings.filter(warning => {
    if (filter === 'all') return true;
    return warning.severity === filter;
  });

  if (warnings.length === 0) {
    return (
      <div className="recipe-warnings empty">
        <span className="warnings-empty">✓ Sin advertencias</span>
      </div>
    );
  }

  return (
    <div className="recipe-warnings">
      <div className="warnings-header">
        <h3 className="warnings-title">Advertencias</h3>
        <div className="warnings-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({warnings.length})
          </button>
          <button
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            Alta ({warnings.filter(w => w.severity === 'high').length})
          </button>
          <button
            className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            Media ({warnings.filter(w => w.severity === 'medium').length})
          </button>
          <button
            className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Baja ({warnings.filter(w => w.severity === 'low').length})
          </button>
        </div>
      </div>

      <div className="warnings-list">
        {filteredWarnings.map((warning) => (
          <div
            key={warning.id}
            className={`warning-item severity-${warning.severity} ${expandedWarning === warning.id ? 'expanded' : ''}`}
          >
            <div className="warning-content">
              <span className="warning-icon">
                {warning.severity === 'high' && '⚠️'}
                {warning.severity === 'medium' && '⚡'}
                {warning.severity === 'low' && 'ℹ️'}
              </span>
              <span className="warning-message">{warning.message}</span>
              <button
                className="warning-expand"
                onClick={() => setExpandedWarning(expandedWarning === warning.id ? null : warning.id)}
              >
                {expandedWarning === warning.id ? '▼' : '▶'}
              </button>
            </div>
            
            {expandedWarning === warning.id && (
              <div className="warning-details">
                {warning.field && (
                  <div className="warning-field">
                    <span className="field-label">Campo:</span>
                    <span className="field-value">{warning.field}</span>
                  </div>
                )}
                {warning.suggestion && (
                  <div className="warning-suggestion">
                    <span className="suggestion-label">Sugerencia:</span>
                    <span className="suggestion-value">{warning.suggestion}</span>
                  </div>
                )}
                <div className="warning-actions">
                  {onResolve && (
                    <button
                      className="warning-resolve"
                      onClick={() => onResolve(warning.id)}
                    >
                      Resolver
                    </button>
                  )}
                  {onDismiss && (
                    <button
                      className="warning-dismiss"
                      onClick={() => onDismiss(warning.id)}
                    >
                      Descartar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
