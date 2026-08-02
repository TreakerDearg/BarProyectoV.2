import type { FormulaSuggestion } from '../../types';

interface FormulaSuggestionsProps {
  suggestions: FormulaSuggestion[];
  onApply?: (suggestion: FormulaSuggestion) => void;
}

/**
 * FormulaSuggestions - Sugerencias inteligentes
 * Muestra sugerencias de ingredientes alternativos, decoraciones, técnicas
 */
export function FormulaSuggestions({ suggestions, onApply }: FormulaSuggestionsProps) {
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

  return (
    <div className="formula-suggestions">
      <h3 className="suggestions-title">Sugerencias Inteligentes</h3>
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`suggestion-item priority-${getPriorityColor(suggestion.priority)}`}
          >
            <div className="suggestion-header">
              <span className="suggestion-icon">{getSuggestionIcon(suggestion.type)}</span>
              <span className="suggestion-message">{suggestion.message}</span>
            </div>
            {suggestion.action && (
              <span className="suggestion-action">{suggestion.action}</span>
            )}
            {onApply && (
              <button
                className="suggestion-apply"
                onClick={() => onApply(suggestion)}
              >
                Aplicar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
