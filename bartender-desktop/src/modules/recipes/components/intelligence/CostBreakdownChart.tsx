import { useState } from 'react';
import { useRecipeStudio } from '../../contexts/RecipeStudioContext';
import styles from './CostBreakdownChart.module.css';

type ChartType = 'horizontal' | 'stacked' | 'pie';

/**
 * CostBreakdownChart - Visualización de costos
 * Consume useRecipeCost sin duplicar lógica
 * Muestra barras horizontales, stacked bars, pie
 */
export function CostBreakdownChart() {
  const { totalCost, ingredientCosts, ingredientPercentages, recipe } = useRecipeStudio();
  const [chartType, setChartType] = useState<ChartType>('horizontal');

  const ingredients = recipe.ingredients.map(ingredient => ({
    id: ingredient.inventoryItem._id,
    name: ingredient.inventoryItem.name,
    cost: ingredientCosts.get(ingredient.inventoryItem._id) || 0,
    percentage: ingredientPercentages.get(ingredient.inventoryItem._id) || 0,
  })).sort((a, b) => b.percentage - a.percentage);

  return (
    <div className={styles.costBreakdownChart}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Desglose de Costos</h3>
        <span className={styles.chartTotal}>${totalCost.toFixed(2)}</span>
      </div>

      <div className={styles.chartControls}>
        <button
          className={`${styles.chartBtn} ${chartType === 'horizontal' ? styles.active : ''}`}
          onClick={() => setChartType('horizontal')}
        >
          Barras Horizontales
        </button>
        <button
          className={`${styles.chartBtn} ${chartType === 'stacked' ? styles.active : ''}`}
          onClick={() => setChartType('stacked')}
        >
          Stacked
        </button>
        <button
          className={`${styles.chartBtn} ${chartType === 'pie' ? styles.active : ''}`}
          onClick={() => setChartType('pie')}
        >
          Pie
        </button>
      </div>

      <div className={styles.chartContent}>
        {chartType === 'horizontal' && <HorizontalBars ingredients={ingredients} />}
        {chartType === 'stacked' && <StackedBars ingredients={ingredients} />}
        {chartType === 'pie' && <PieChart ingredients={ingredients} />}
      </div>
    </div>
  );
}

function HorizontalBars({ ingredients }: { ingredients: Array<{ id: string; name: string; cost: number; percentage: number }> }) {
  return (
    <div className={styles.horizontalBars}>
      {ingredients.map((ingredient) => (
        <div key={ingredient.id} className={styles.horizontalBarItem}>
          <span className={styles.barLabel}>{ingredient.name}</span>
          <div className={styles.barContainer}>
            <div
              className={styles.barFill}
              style={{ width: `${ingredient.percentage}%` }}
            />
          </div>
          <span className={styles.barPercentage}>{ingredient.percentage.toFixed(0)}%</span>
          <span className={styles.barCost}>${ingredient.cost.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function StackedBars({ ingredients }: { ingredients: Array<{ id: string; name: string; cost: number; percentage: number }> }) {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

  return (
    <div className={styles.stackedBars}>
      <div className={styles.stackedBarContainer}>
        {ingredients.map((ingredient, index) => (
          <div
            key={ingredient.id}
            className={styles.stackedBarSegment}
            style={{
              width: `${ingredient.percentage}%`,
              backgroundColor: colors[index % colors.length],
            }}
            title={`${ingredient.name}: ${ingredient.percentage.toFixed(0)}%`}
          />
        ))}
      </div>
      <div className={styles.stackedLegend}>
        {ingredients.map((ingredient, index) => (
          <div key={ingredient.id} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className={styles.legendLabel}>{ingredient.name}</span>
            <span className={styles.legendValue}>{ingredient.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChart({ ingredients }: { ingredients: Array<{ id: string; name: string; cost: number; percentage: number }> }) {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

  let cumulativePercentage = 0;
  const segments = ingredients.map((ingredient, index) => {
    const startPercentage = cumulativePercentage;
    cumulativePercentage += ingredient.percentage;
    return {
      ...ingredient,
      startPercentage,
      endPercentage: cumulativePercentage,
      color: colors[index % colors.length],
    };
  });

  return (
    <div className={styles.pieChart}>
      <div className={styles.pieChartContainer}>
        <svg viewBox="0 0 100 100" className={styles.pieSvg}>
          {segments.map((segment) => {
            const startAngle = (segment.startPercentage / 100) * 360;
            const endAngle = (segment.endPercentage / 100) * 360;
            const largeArcFlag = segment.percentage > 50 ? 1 : 0;
            
            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            return (
              <path
                key={segment.id}
                d={pathData}
                fill={segment.color}
                className={styles.pieSegment}
              >
                <title>{`${segment.name}: ${segment.percentage.toFixed(0)}%`}</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className={styles.pieLegend}>
        {segments.map((segment) => (
          <div key={segment.id} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: segment.color }}
            />
            <span className={styles.legendLabel}>{segment.name}</span>
            <span className={styles.legendValue}>{segment.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
