import { memo } from 'react';
import type { RecipeDecoration } from '../../types';
import styles from './DecorationCard.module.css';

interface DecorationCardProps {
  decoration: RecipeDecoration;
  onRemove?: () => void;
}

/**
 * DecorationCard - Tarjeta de decoración
 * Optimizado con React.memo para evitar renders innecesarios
 */
export const DecorationCard = memo(function DecorationCard({ decoration, onRemove }: DecorationCardProps) {
  return (
    <div
      className={styles.decorationCard}
    >
      <div className={styles.decorationIcon}>{decoration.icon}</div>
      <div className={styles.decorationInfo}>
        <h4 className={styles.decorationName}>{decoration.name}</h4>
        <span className={styles.decorationType}>{decoration.type}</span>
        {decoration.category && (
          <span className={styles.decorationCategory}>{decoration.category}</span>
        )}
      </div>
      {decoration.cost !== undefined && (
        <div className={styles.decorationCost}>
          <span className={styles.costValue}>${(decoration.cost || 0).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
});
