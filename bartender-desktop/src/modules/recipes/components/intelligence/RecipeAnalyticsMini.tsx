import { memo } from 'react';
import { useRecipeStudio } from '../../contexts/RecipeStudioContext';
import styles from './RecipeAnalyticsMini.module.css';

type WidgetType = 'percentage' | 'currency' | 'time' | 'score' | 'number' | 'text';

interface MiniWidgetProps {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  type: WidgetType;
}

/**
 * RecipeAnalyticsMini - Mini widgets inspirados en Steam, GitHub Insights, Figma Analytics
 * Muestra Popularidad, Costo, Margen, Tiempo, Complejidad, Health, Versiones, Favoritos, Variantes
 * Reutiliza análisis existentes sin duplicar lógica
 * Optimizado con React.memo
 */
export const RecipeAnalyticsMini = memo(function RecipeAnalyticsMini() {
  const { analytics, healthScore, versions } = useRecipeStudio();

  if (!analytics) {
    return (
      <div className={styles.recipeAnalyticsMini}>
        <h3 className={styles.analyticsTitle}>Analytics</h3>
        <span className={styles.analyticsEmpty}>Sin datos de análisis</span>
      </div>
    );
  }

  return (
    <div className={styles.recipeAnalyticsMini}>
      <h3 className={styles.analyticsTitle}>Analytics</h3>
      <div className={styles.analyticsGrid}>
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
});

function MiniWidget({ label, value, icon, color, type }: MiniWidgetProps) {
  const formatValue = (val: number | string): string => {
    const safeVal = typeof val === 'number' ? val : Number(val || 0);
    switch (type) {
      case 'percentage':
        return `${safeVal}%`;
      case 'currency':
        return `$${safeVal.toFixed(2)}`;
      case 'time':
        return `${safeVal} min`;
      case 'score':
        return `${safeVal}/100`;
      case 'number':
        return String(safeVal);
      case 'text':
        return String(val || '');
      default:
        return String(val || '');
    }
  };

  const getProgress = (val: number | string): number => {
    const safeVal = typeof val === 'number' ? val : Number(val || 0);
    if (type === 'percentage') return safeVal;
    if (type === 'score') return safeVal;
    if (type === 'currency') return Math.min(safeVal / 10 * 100, 100);
    if (type === 'time') return Math.min(safeVal / 15 * 100, 100);
    return 0;
  };

  const getColorClass = (color: string): string => {
    switch (color) {
      case 'success': return styles.colorSuccess;
      case 'warning': return styles.colorWarning;
      case 'danger': return styles.colorDanger;
      case 'info': return styles.colorInfo;
      default: return styles.colorInfo;
    }
  };

  return (
    <div className={`${styles.miniWidget} ${getColorClass(color)}`}>
      <div className={styles.widgetHeader}>
        <span className={styles.widgetIcon}>{icon}</span>
        <span className={styles.widgetLabel}>{label}</span>
      </div>
      <div className={styles.widgetBody}>
        <span className={styles.widgetValue}>{formatValue(value)}</span>
        {(type === 'percentage' || type === 'score') && (
          <div className={styles.widgetProgress}>
            <div
              className={styles.widgetProgressFill}
              style={{ width: `${getProgress(value)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
