import type { Technique } from '../../types';

interface TechniqueCardProps {
  technique: Technique;
  onSelect?: () => void;
  isSelected?: boolean;
}

/**
 * TechniqueCard - Card visual para técnicas reutilizables
 */
export function TechniqueCard({ technique, onSelect, isSelected }: TechniqueCardProps) {
  return (
    <div
      className={`technique-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="technique-icon">{technique.icon}</div>
      <div className="technique-info">
        <h4 className="technique-name">{technique.name}</h4>
        <span className="technique-category">{technique.category}</span>
        {technique.difficulty && (
          <span className={`technique-difficulty ${technique.difficulty}`}>
            {technique.difficulty}
          </span>
        )}
      </div>
      {technique.time && (
        <div className="technique-time">
          <span className="time-value">{technique.time}s</span>
        </div>
      )}
    </div>
  );
}
