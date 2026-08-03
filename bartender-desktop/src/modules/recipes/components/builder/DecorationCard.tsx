import type { Decoration } from '../../types';
import styles from './DecorationCard.module.css';

interface DecorationCardProps {
  decoration: Decoration;
  onSelect?: () => void;
  isSelected?: boolean;
}

/**
 * DecorationCard - Card visual para decoraciones reutilizables (Grid visual)
 */
export function DecorationCard({ decoration, onSelect, isSelected }: DecorationCardProps) {
  return (
    <div
      className={`${styles.decorationCard} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
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
          <span className={styles.costValue}>${decoration.cost.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
