import type { Technique } from '../../types';
import styles from './TechniqueCard.module.css';

interface TechniqueCardProps {
  technique: Technique;
  onSelect?: () => void;
  isSelected?: boolean;
}

/**
 * TechniqueCard - Card visual para técnicas reutilizables (Figma Assets style)
 */
export function TechniqueCard({ technique, onSelect, isSelected }: TechniqueCardProps) {
  return (
    <div
      className={`${styles.techniqueCard} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      <div className={styles.techniqueIcon}>{technique.icon}</div>
      <div className={styles.techniqueInfo}>
        <h4 className={styles.techniqueName}>{technique.name}</h4>
        <span className={styles.techniqueCategory}>{technique.category}</span>
        {technique.difficulty && (
          <span className={`${styles.techniqueDifficulty} ${styles[technique.difficulty]}`}>
            {technique.difficulty}
          </span>
        )}
      </div>
      {technique.time && (
        <div className={styles.techniqueTime}>
          <span className={styles.timeValue}>{technique.time}s</span>
        </div>
      )}
    </div>
  );
}
