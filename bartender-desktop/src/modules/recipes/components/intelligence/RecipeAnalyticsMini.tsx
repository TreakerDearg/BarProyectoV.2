import { useRecipeStudio } from '../../contexts/RecipeStudioContext';

/**
 * RecipeAnalyticsMini - Mini widgets inspirados en Steam, GitHub Insights, Figma Analytics
 * Muestra Popularidad, Costo, Margen, Tiempo, Complejidad, Health, Versiones, Favoritos, Variantes
 * Reutiliza análisis existentes sin duplicar lógica
 */
export function RecipeAnalyticsMini() {
  const { analytics, healthScore, versions } = useRecipeStudio();

  return (
    <div className="recipe-analytics-mini">
      <h3 className="analytics-title">Analytics</h3>
      <div className="analytics-grid">
        <MiniWidget
          label="Popularidad"
          value={analytics.popularity}
          icon="⭐"
          color={analytics.popularity >= 70 ? 'success' : analytics.popularity >= 40 ? 'warning' : 'danger'}
          type="percentage"
        />
        <MiniWidget
          label="Margen"
          value={analytics.margin}
          icon="📊"
          color={analytics.margin >= 70 ? 'success' : analytics.margin >= 40 ? 'warning' : 'danger'}
          type="percentage"
        />
        <MiniWidget
          label="Costo"
          value={analytics.cost}
          icon="💰"
          color={analytics.cost <= 3 ? 'success' : analytics.cost <= 5 ? 'warning' : 'danger'}
          type="currency"
        />
        <MiniWidget
          label="Tiempo"
          value={analytics.time}
          icon="⏱️"
          color={analytics.time <= 5 ? 'success' : analytics.time <= 10 ? 'warning' : 'danger'}
          type="time"
        />
        <MiniWidget
          label="Complejidad"
          value={analytics.complexity}
          icon="🎯"
          color={analytics.complexity === 'low' ? 'success' : analytics.complexity === 'medium' ? 'warning' : 'danger'}
          type="text"
        />
        <MiniWidget
          label="Health Score"
          value={healthScore.overall}
          icon="❤️"
          color={healthScore.overall >= 80 ? 'success' : healthScore.overall >= 60 ? 'warning' : 'danger'}
          type="score"
        />
        <MiniWidget
          label="Versiones"
          value={versions.length}
          icon="🔖"
          color="info"
          type="number"
        />
        <MiniWidget
          label="Variantes"
          value={analytics.variantCount}
          icon="🔄"
          color={analytics.variantCount > 0 ? 'success' : 'info'}
          type="number"
        />
        <MiniWidget
          label="Ingredientes"
          value={analytics.ingredientCount}
          icon="🥗"
          color={analytics.ingredientCount <= 8 ? 'success' : analytics.ingredientCount <= 12 ? 'warning' : 'danger'}
          type="number"
        />
      </div>
    </div>
  );
}

interface MiniWidgetProps {
  label: string;
  value: number | string;
  icon: string;
  color: 'success' | 'warning' | 'danger' | 'info';
  type: 'percentage' | 'currency' | 'time' | 'text' | 'score' | 'number';
}

function MiniWidget({ label, value, icon, color, type }: MiniWidgetProps) {
  const formatValue = (val: number | string): string => {
    switch (type) {
      case 'percentage':
        return `${val}%`;
      case 'currency':
        return `$${Number(val).toFixed(2)}`;
      case 'time':
        return `${val} min`;
      case 'score':
        return `${val}/100`;
      case 'number':
        return String(val);
      case 'text':
        return String(val);
      default:
        return String(val);
    }
  };

  const getProgress = (val: number | string): number => {
    if (type === 'percentage') return Number(val);
    if (type === 'score') return Number(val);
    if (type === 'currency') return Math.min(Number(val) / 10 * 100, 100);
    if (type === 'time') return Math.min(Number(val) / 15 * 100, 100);
    return 0;
  };

  return (
    <div className={`mini-widget color-${color}`}>
      <div className="widget-header">
        <span className="widget-icon">{icon}</span>
        <span className="widget-label">{label}</span>
      </div>
      <div className="widget-body">
        <span className="widget-value">{formatValue(value)}</span>
        {(type === 'percentage' || type === 'score') && (
          <div className="widget-progress">
            <div
              className="widget-progress-fill"
              style={{ width: `${getProgress(value)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
