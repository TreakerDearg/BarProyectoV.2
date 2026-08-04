import { useState, memo } from 'react';
import { Clock, Thermometer, Palette, ChevronUp, ChevronDown, ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';
import type { RecipeStep } from '../../types';
import styles from './RecipeStepBlock.module.css';

interface RecipeStepBlockProps {
  step: RecipeStep;
  index: number;
  onUpdate?: (step: RecipeStep) => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleExpand?: () => void;
}

/**
 * RecipeStepBlock - Bloque estilo Notion/FigJam
 * Número, título, descripción, tiempo, temperatura, técnica, utensilios, notas
 */
export const RecipeStepBlock = memo(function RecipeStepBlock({
  step,
  index,
  onUpdate,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onToggleExpand,
}: RecipeStepBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    onToggleExpand?.();
  };

  const getBorderColor = () => {
    switch (step.technique) {
      case 'shake': return 'rgba(99, 102, 241, 0.5)';
      case 'stir': return 'rgba(34, 197, 94, 0.5)';
      case 'muddle': return 'rgba(234, 179, 8, 0.5)';
      case 'build': return 'rgba(168, 85, 247, 0.5)';
      default: return 'rgba(120, 120, 255, 0.3)';
    }
  };

  return (
    <div
      className={`${styles.stepBlock} ${isHovered ? styles.hovered : ''} ${isExpanded ? styles.expanded : styles.collapsed}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ borderLeftColor: getBorderColor() }}
    >
      {/* Header */}
      <div className={styles.stepHeader}>
        <div className={styles.stepNumber}>
          <span>{index + 1}</span>
        </div>
        <div className={styles.stepInfo}>
          <input
            type="text"
            className={styles.stepTitle}
            value={step.title || ''}
            onChange={(e) => onUpdate?.({ ...step, title: e.target.value })}
            placeholder="Título del paso"
          />
          <div className={styles.stepMeta}>
            {step.time && (
              <span className={styles.metaTag}>
                <Clock size={12} className={styles.metaIcon} />
                {step.time}s
              </span>
            )}
            {step.temperature && (
              <span className={styles.metaTag}>
                <Thermometer size={12} className={styles.metaIcon} />
                {step.temperature}°C
              </span>
            )}
            {step.technique && (
              <span className={styles.metaTag}>
                <Palette size={12} className={styles.metaIcon} />
                {step.technique}
              </span>
            )}
          </div>
        </div>
        <button className={styles.expandBtn} onClick={handleToggleExpand}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className={styles.stepContent}>
          <textarea
            className={styles.stepDescription}
            value={step.description || ''}
            onChange={(e) => onUpdate?.({ ...step, description: e.target.value })}
            placeholder="Describe este paso..."
            rows={3}
          />

          {step.utensils && step.utensils.length > 0 && (
            <div className={styles.utensilsSection}>
              <span className={styles.sectionLabel}>Utensilios:</span>
              <div className={styles.utensilsList}>
                {step.utensils.map((utensil, idx) => (
                  <span key={idx} className={styles.utensilTag}>{utensil}</span>
                ))}
              </div>
            </div>
          )}

          {step.notes && (
            <div className={styles.notesSection}>
              <span className={styles.sectionLabel}>Notas:</span>
              <p className={styles.notesText}>{step.notes}</p>
            </div>
          )}

          {isHovered && (
            <div className={styles.stepActions}>
              <button className={styles.actionBtn} onClick={onMoveUp} title="Mover arriba">
                <ArrowUp size={14} />
              </button>
              <button className={styles.actionBtn} onClick={onMoveDown} title="Mover abajo">
                <ArrowDown size={14} />
              </button>
              <button className={styles.actionBtn} onClick={onDuplicate} title="Duplicar">
                <Copy size={14} />
              </button>
              <button className={`${styles.actionBtn} ${styles.danger}`} onClick={onRemove} title="Eliminar">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
