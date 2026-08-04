import { useState, memo } from 'react';
import type { FormulaSuggestion } from '../../types';
import styles from './FormulaSuggestions.module.css';

interface FormulaSuggestionsProps {
  suggestions: FormulaSuggestion[];
  onApply?: (suggestion: FormulaSuggestion) => void;
}

type SuggestionFilter = 'all' | 'production' | 'cost' | 'decoration' | 'presentation' | 'technique' | 'stock' | 'margin' | 'complexity';

/**
 * FormulaSuggestions - Panel inteligente mejorado
 * Clasificado por tipo (Producción, Costo, Decoración, Presentación, Técnicas, Stock, Margen, Complejidad)
 * Preparado para IA futura
 * Optimizado con React.memo
 */
export const FormulaSuggestions = memo(function FormulaSuggestions({ suggestions, onApply }: FormulaSuggestionsProps) {
  const [filter, setFilter] = useState<SuggestionFilter>('all');

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className={`${styles.formulaSuggestions} ${styles.empty}`}>
        <span className={styles.suggestionsEmpty}>✓ Sin sugerencias</span>
      </div>
    );
  }

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === 'all') return true;
    return suggestion.type === filter;
  });

  const getSuggestionIcon = (type: string): string => {
    switch (type) {
      case 'ingredient': return '🥗';
      case 'technique': return '🎯';
      case 'decoration': return '✨';
      case 'cost': return '💰';
      case 'production': return '🏭';
      case 'presentation': return '🎨';
      case 'stock': return '📦';
      case 'margin': return '📊';
      case 'complexity': return '🧩';
      default: return '💡';
    }
  };

  const getPriorityClass = (priority: string): string => {
    switch (priority) {
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return styles.priorityLow;
    }
  };

  const getFilterLabel = (filter: SuggestionFilter): string => {
    switch (filter) {
      case 'all': return 'Todas';
      case 'production': return 'Producción';
      case 'cost': return 'Costo';
      case 'decoration': return 'Decoración';
      case 'presentation': return 'Presentación';
      case 'technique': return 'Técnicas';
      case 'stock': return 'Stock';
      case 'margin': return 'Margen';
      case 'complexity': return 'Complejidad';
    }
  };

  return (
    <div className={styles.formulaSuggestions}>
      <div className={styles.suggestionsHeader}>
        <h3 className={styles.suggestionsTitle}>Sugerencias Inteligentes</h3>
        <div className={styles.suggestionsFilters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({suggestions.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'production' ? styles.active : ''}`}
            onClick={() => setFilter('production')}
          >
            Producción ({suggestions.filter(s => s.type === 'production').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'cost' ? styles.active : ''}`}
            onClick={() => setFilter('cost')}
          >
            Costo ({suggestions.filter(s => s.type === 'cost').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'decoration' ? styles.active : ''}`}
            onClick={() => setFilter('decoration')}
          >
            Decoración ({suggestions.filter(s => s.type === 'decoration').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'presentation' ? styles.active : ''}`}
            onClick={() => setFilter('presentation')}
          >
            Presentación ({suggestions.filter(s => s.type === 'presentation').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'technique' ? styles.active : ''}`}
            onClick={() => setFilter('technique')}
          >
            Técnicas ({suggestions.filter(s => s.type === 'technique').length})
          </button>
        </div>
      </div>

      <div className={styles.suggestionsList}>
        {filteredSuggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`${styles.suggestionItem} ${getPriorityClass(suggestion.priority)}`}
          >
            <div className={styles.suggestionHeader}>
              <span className={styles.suggestionIcon}>{getSuggestionIcon(suggestion.type)}</span>
              <div className={styles.suggestionContent}>
                <span className={styles.suggestionMessage}>{suggestion.message}</span>
                <span className={styles.suggestionType}>{getFilterLabel(suggestion.type as SuggestionFilter)}</span>
              </div>
            </div>
            {suggestion.action && (
              <div className={styles.suggestionFooter}>
                <span className={styles.suggestionAction}>{suggestion.action}</span>
                {onApply && (
                  <button
                    className={styles.suggestionApply}
                    onClick={() => onApply(suggestion)}
                  >
                    Aplicar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
