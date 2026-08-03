import React from 'react';
import { StudioCard } from './StudioCard';
import styles from './SuggestionPanel.module.css';

interface Suggestion {
  id: string;
  type: 'create-variant' | 'update-cost' | 'add-decoration' | 'optimize-recipe';
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel: string;
}

interface SuggestionPanelProps {
  suggestions: Suggestion[];
  onSuggestionClick?: (suggestion: Suggestion) => void;
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className={styles.suggestionPanel}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Sugerencias</h2>
        <button className={styles.dismissAll}>Descartar todo</button>
      </div>
      <div className={styles.suggestionGrid}>
        {suggestions.map((suggestion) => (
          <StudioCard
            key={suggestion.id}
            className={styles.suggestionCard}
            variant="suggestion"
            hoverable
            clickable
            onClick={() => onSuggestionClick?.(suggestion)}
          >
            <div className={styles.suggestionIcon}>{suggestion.icon}</div>
            <div className={styles.suggestionContent}>
              <h3 className={styles.suggestionTitle}>{suggestion.title}</h3>
              <p className={styles.suggestionDescription}>{suggestion.description}</p>
            </div>
            <button className={styles.suggestionAction}>{suggestion.actionLabel}</button>
          </StudioCard>
        ))}
      </div>
    </div>
  );
};
