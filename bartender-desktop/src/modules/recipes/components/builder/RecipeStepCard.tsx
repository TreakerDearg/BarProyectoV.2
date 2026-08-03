import type { RecipeStep } from '../../types';
import styles from './RecipeStepCard.module.css';

interface RecipeStepCardProps {
  step: RecipeStep;
  stepNumber: number;
  onUpdate?: (updated: RecipeStep) => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isDraggable?: boolean;
}

/**
 * RecipeStepCard - Card independiente para pasos de preparación
 * Contiene número, descripción, técnica, duración, temperatura, utensilios, observaciones
 */
export function RecipeStepCard({
  step,
  stepNumber,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isDraggable = true,
}: RecipeStepCardProps) {
  const handleInstructionChange = (instruction: string) => {
    if (onUpdate) {
      onUpdate({ ...step, instruction });
    }
  };

  const handleDurationChange = (duration: number) => {
    if (onUpdate) {
      onUpdate({ ...step, duration });
    }
  };

  const handleTemperatureChange = (temperature: number | null) => {
    if (onUpdate) {
      onUpdate({ ...step, temperature });
    }
  };

  return (
    <div
      className={`${styles.recipeStepCard} ${isDraggable ? styles.draggable : ''}`}
      draggable={isDraggable}
    >
      <div className={styles.stepHeader}>
        <div className={styles.stepNumber}>{stepNumber}</div>
        <div className={styles.stepActions}>
          {onMoveUp && <button className={styles.stepAction} onClick={onMoveUp}>↑</button>}
          {onMoveDown && <button className={styles.stepAction} onClick={onMoveDown}>↓</button>}
          {onRemove && <button className={`${styles.stepAction} ${styles.danger}`} onClick={onRemove}>✕</button>}
        </div>
      </div>

      <div className={styles.stepContent}>
        <textarea
          value={step.instruction}
          onChange={(e) => handleInstructionChange(e.target.value)}
          placeholder="Describe este paso..."
          className={styles.stepInstruction}
          rows={3}
        />

        <div className={styles.stepDetails}>
          <div className={styles.stepDetail}>
            <label className={styles.detailLabel}>Duración (min)</label>
            <input
              type="number"
              value={step.duration || 0}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              className={styles.detailInput}
              min="0"
              step="0.5"
            />
          </div>

          <div className={styles.stepDetail}>
            <label className={styles.detailLabel}>Temperatura (°C)</label>
            <input
              type="number"
              value={step.temperature || ''}
              onChange={(e) => handleTemperatureChange(e.target.value ? Number(e.target.value) : null)}
              className={styles.detailInput}
              placeholder="Opcional"
            />
          </div>
        </div>

        {step.technique && (
          <div className={styles.stepTechnique}>
            <span className={styles.techniqueBadge}>{step.technique}</span>
          </div>
        )}

        {step.utensils && step.utensils.length > 0 && (
          <div className={styles.stepUtensils}>
            <span className={styles.utensilsLabel}>Utensilios:</span>
            <div className={styles.utensilsList}>
              {step.utensils.map((utensil, index) => (
                <span key={index} className={styles.utensilTag}>{utensil}</span>
              ))}
            </div>
          </div>
        )}

        {step.notes && (
          <div className={styles.stepNotes}>
            <span className={styles.notesLabel}>Notas:</span>
            <p className={styles.notesText}>{step.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
