import { useState } from 'react';
import type { FormulaSuggestion } from '../../types';

interface FormulaSuggestionsProps {
  suggestions: FormulaSuggestion[];
  onApply?: (suggestion: FormulaSuggestion) => void;
}

type SuggestionFilter = 'all' | 'production' | 'cost' | 'decoration' | 'presentation' | 'technique' | 'stock' | 'margin' | 'complexity';

/**
 * FormulaSuggestions - Panel inteligente mejorado
 * Clasificado por tipo (Producción, Costo, Decoración, Presentación, Técnicas, Stock, Margen, Complejidad)
 * Preparado para IA futura
 */
export function FormulaSuggestions({ suggestions, onApply }: FormulaSuggestionsProps) {
  const [filter, setFilter] = useState<SuggestionFilter>('all');

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === 'all') return true;
    return suggestion.type === filter;
  });

  if (suggestions.length === 0) {
    return (
      <div className="formula-suggestions empty">
        <span className="suggestions-empty">✓ Sin sugerencias</span>
      </div>
    );
  }

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

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
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
    <div className="formula-suggestions">
      <div className="suggestions-header">
        <h3 className="suggestions-title">Sugerencias Inteligentes</h3>
        <div className="suggestions-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({suggestions.length})
          </button>
          <button
            className={`filter-btn ${filter === 'production' ? 'active' : ''}`}
            onClick={() => setFilter('production')}
          >
            Producción ({suggestions.filter(s => s.type === 'production').length})
          </button>
          <button
            className={`filter-btn ${filter === 'cost' ? 'active' : ''}`}
            onClick={() => setFilter('cost')}
          >
            Costo ({suggestions.filter(s => s.type === 'cost').length})
          </button>
          <button
            className={`filter-btn ${filter === 'decoration' ? 'active' : ''}`}
            onClick={() => setFilter('decoration')}
          >
            Decoración ({suggestions.filter(s => s.type === 'decoration').length})
          </button>
          <button
            className={`filter-btn ${filter === 'presentation' ? 'active' : ''}`}
            onClick={() => setFilter('presentation')}
          >
            Presentación ({suggestions.filter(s => s.type === 'presentation').length})
          </button>
          <button
            className={`filter-btn ${filter === 'technique' ? 'active' : ''}`}
            onClick={() => setFilter('technique')}
          >
            Técnicas ({suggestions.filter(s => s.type === 'technique').length})
          </button>
        </div>
      </div>

      <div className="suggestions-list">
        {filteredSuggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`suggestion-item priority-${getPriorityColor(suggestion.priority)}`}
          >
            <div className="suggestion-header">
              <span className="suggestion-icon">{getSuggestionIcon(suggestion.type)}</span>
              <div className="suggestion-content">
                <span className="suggestion-message">{suggestion.message}</span>
                <span className="suggestion-type">{getFilterLabel(suggestion.type as SuggestionFilter)}</span>
              </div>
            </div>
            {suggestion.action && (
              <div className="suggestion-footer">
                <span className="suggestion-action">{suggestion.action}</span>
                {onApply && (
                  <button
                    className="suggestion-apply"
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
}
