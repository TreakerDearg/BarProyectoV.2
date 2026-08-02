import type { RecipeHealthScore } from '../../types';

interface RecipeHealthScoreProps {
  healthScore: RecipeHealthScore;
}

/**
 * RecipeHealthScore - Puntaje de salud de receta
 * Desglosado en Costo, Disponibilidad, Tiempo, Complejidad, Rentabilidad, Consistencia, Presentación, Producción
 */
export function RecipeHealthScore({ healthScore }: RecipeHealthScoreProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muy bueno';
    if (score >= 70) return 'Bueno';
    if (score >= 60) return 'Aceptable';
    if (score >= 50) return 'Regular';
    return 'Necesita mejora';
  };

  return (
    <div className="recipe-health-score">
      <div className="health-score-header">
        <h3 className="health-score-title">Recipe Score</h3>
        <div className={`health-score-overall ${getScoreColor(healthScore.overall)}`}>
          <span className="score-value">{healthScore.overall}</span>
          <span className="score-max">/100</span>
        </div>
      </div>

      <div className="health-score-grid">
        <ScoreItem
          label="Costo"
          score={healthScore.cost}
          color={getScoreColor(healthScore.cost)}
          icon="💰"
        />
        <ScoreItem
          label="Disponibilidad"
          score={healthScore.availability}
          color={getScoreColor(healthScore.availability)}
          icon="📦"
        />
        <ScoreItem
          label="Tiempo"
          score={healthScore.time}
          color={getScoreColor(healthScore.time)}
          icon="⏱️"
        />
        <ScoreItem
          label="Complejidad"
          score={healthScore.complexity}
          color={getScoreColor(healthScore.complexity)}
          icon="🎯"
        />
        <ScoreItem
          label="Rentabilidad"
          score={healthScore.profitability}
          color={getScoreColor(healthScore.profitability)}
          icon="📊"
        />
        <ScoreItem
          label="Consistencia"
          score={healthScore.consistency}
          color={getScoreColor(healthScore.consistency)}
          icon="✓"
        />
        <ScoreItem
          label="Presentación"
          score={healthScore.presentation}
          color={getScoreColor(healthScore.presentation)}
          icon="✨"
        />
        <ScoreItem
          label="Producción"
          score={healthScore.production}
          color={getScoreColor(healthScore.production)}
          icon="🏭"
        />
      </div>

      <div className="health-score-footer">
        <span className="health-score-label">Estado general:</span>
        <span className={`health-score-status ${getScoreColor(healthScore.overall)}`}>
          {getScoreLabel(healthScore.overall)}
        </span>
      </div>
    </div>
  );
}

interface ScoreItemProps {
  label: string;
  score: number;
  color: string;
  icon: string;
}

function ScoreItem({ label, score, color, icon }: ScoreItemProps) {
  return (
    <div className="score-item">
      <span className="score-icon">{icon}</span>
      <div className="score-info">
        <span className="score-label">{label}</span>
        <div className="score-bar">
          <div
            className={`score-bar-fill ${color}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`score-value ${color}`}>{score}</span>
      </div>
    </div>
  );
}
