import { useState } from 'react';
import type { RecipeWarning } from '../../types';
import styles from './RecipeWarnings.module.css';

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
      <div className={`${styles.recipeWarnings} ${styles.empty}`}>
        <span className={styles.warningsEmpty}>✓ Sin advertencias</span>
      </div>
    );
  }

  return (
    <div className={styles.recipeWarnings}>
      <div className={styles.warningsHeader}>
        <h3 className={styles.warningsTitle}>Advertencias</h3>
        <div className={styles.warningsFilters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({warnings.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'high' ? styles.active : ''}`}
            onClick={() => setFilter('high')}
          >
            Alta ({warnings.filter(w => w.severity === 'high').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'medium' ? styles.active : ''}`}
            onClick={() => setFilter('medium')}
          >
            Media ({warnings.filter(w => w.severity === 'medium').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'low' ? styles.active : ''}`}
            onClick={() => setFilter('low')}
          >
            Baja ({warnings.filter(w => w.severity === 'low').length})
          </button>
        </div>
      </div>

      <div className={styles.warningsList}>
        {filteredWarnings.map((warning) => (
          <div
            key={warning.id}
            className={`${styles.warningItem} ${warning.severity === 'high' ? styles.severityHigh : warning.severity === 'medium' ? styles.severityMedium : styles.severityLow} ${expandedWarning === warning.id ? styles.expanded : ''}`}
          >
            <div className={styles.warningContent}>
              <span className={styles.warningIcon}>
                {warning.severity === 'high' && '⚠️'}
                {warning.severity === 'medium' && '⚡'}
                {warning.severity === 'low' && 'ℹ️'}
              </span>
              <span className={styles.warningMessage}>{warning.message}</span>
              <button
                className={styles.warningExpand}
                onClick={() => setExpandedWarning(expandedWarning === warning.id ? null : warning.id)}
              >
                {expandedWarning === warning.id ? '▼' : '▶'}
              </button>
            </div>
            
            {expandedWarning === warning.id && (
              <div className={styles.warningDetails}>
                {warning.field && (
                  <div className={styles.warningField}>
                    <span className={styles.fieldLabel}>Campo:</span>
                    <span className={styles.fieldValue}>{warning.field}</span>
                  </div>
                )}
                {warning.suggestion && (
                  <div className={styles.warningSuggestion}>
                    <span className={styles.suggestionLabel}>Sugerencia:</span>
                    <span className={styles.suggestionValue}>{warning.suggestion}</span>
                  </div>
                )}
                <div className={styles.warningActions}>
                  {onResolve && (
                    <button
                      className={styles.warningResolve}
                      onClick={() => onResolve(warning.id)}
                    >
                      Resolver
                    </button>
                  )}
                  {onDismiss && (
                    <button
                      className={styles.warningDismiss}
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
