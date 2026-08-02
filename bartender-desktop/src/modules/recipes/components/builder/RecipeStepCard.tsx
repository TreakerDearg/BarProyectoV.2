import type { RecipeStep } from '../../types';

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
      className={`recipe-step-card ${isDraggable ? 'draggable' : ''}`}
      draggable={isDraggable}
    >
      <div className="step-header">
        <div className="step-number">{stepNumber}</div>
        <div className="step-actions">
          {onMoveUp && <button className="step-action" onClick={onMoveUp}>↑</button>}
          {onMoveDown && <button className="step-action" onClick={onMoveDown}>↓</button>}
          {onRemove && <button className="step-action danger" onClick={onRemove}>✕</button>}
        </div>
      </div>

      <div className="step-content">
        <textarea
          value={step.instruction}
          onChange={(e) => handleInstructionChange(e.target.value)}
          placeholder="Describe este paso..."
          className="step-instruction"
          rows={3}
        />

        <div className="step-details">
          <div className="step-detail">
            <label className="detail-label">Duración (min)</label>
            <input
              type="number"
              value={step.duration || 0}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              className="detail-input"
              min="0"
              step="0.5"
            />
          </div>

          <div className="step-detail">
            <label className="detail-label">Temperatura (°C)</label>
            <input
              type="number"
              value={step.temperature || ''}
              onChange={(e) => handleTemperatureChange(e.target.value ? Number(e.target.value) : null)}
              className="detail-input"
              placeholder="Opcional"
            />
          </div>
        </div>

        {step.technique && (
          <div className="step-technique">
            <span className="technique-badge">{step.technique}</span>
          </div>
        )}

        {step.utensils && step.utensils.length > 0 && (
          <div className="step-utensils">
            <span className="utensils-label">Utensilios:</span>
            <div className="utensils-list">
              {step.utensils.map((utensil, index) => (
                <span key={index} className="utensil-tag">{utensil}</span>
              ))}
            </div>
          </div>
        )}

        {step.notes && (
          <div className="step-notes">
            <span className="notes-label">Notas:</span>
            <p className="notes-text">{step.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
