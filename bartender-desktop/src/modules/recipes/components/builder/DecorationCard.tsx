import type { Decoration } from '../../types';

interface DecorationCardProps {
  decoration: Decoration;
  onSelect?: () => void;
  isSelected?: boolean;
}

/**
 * DecorationCard - Card visual para decoraciones reutilizables
 */
export function DecorationCard({ decoration, onSelect, isSelected }: DecorationCardProps) {
  return (
    <div
      className={`decoration-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="decoration-icon">{decoration.icon}</div>
      <div className="decoration-info">
        <h4 className="decoration-name">{decoration.name}</h4>
        <span className="decoration-type">{decoration.type}</span>
        {decoration.category && (
          <span className="decoration-category">{decoration.category}</span>
        )}
      </div>
      {decoration.cost !== undefined && (
        <div className="decoration-cost">
          <span className="cost-value">${decoration.cost.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
