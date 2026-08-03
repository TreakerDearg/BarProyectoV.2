import { useState } from 'react';
import { useRecipeStudio } from '../../contexts/RecipeStudioContext';

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
    <div className="cost-breakdown-chart">
      <div className="chart-header">
        <h3 className="chart-title">Desglose de Costos</h3>
        <span className="chart-total">${totalCost.toFixed(2)}</span>
      </div>

      <div className="chart-controls">
        <button
          className={`chart-btn ${chartType === 'horizontal' ? 'active' : ''}`}
          onClick={() => setChartType('horizontal')}
        >
          Barras Horizontales
        </button>
        <button
          className={`chart-btn ${chartType === 'stacked' ? 'active' : ''}`}
          onClick={() => setChartType('stacked')}
        >
          Stacked
        </button>
        <button
          className={`chart-btn ${chartType === 'pie' ? 'active' : ''}`}
          onClick={() => setChartType('pie')}
        >
          Pie
        </button>
      </div>

      <div className="chart-content">
        {chartType === 'horizontal' && <HorizontalBars ingredients={ingredients} />}
        {chartType === 'stacked' && <StackedBars ingredients={ingredients} />}
        {chartType === 'pie' && <PieChart ingredients={ingredients} />}
      </div>
    </div>
  );
}

function HorizontalBars({ ingredients }: { ingredients: Array<{ id: string; name: string; cost: number; percentage: number }> }) {
  return (
    <div className="horizontal-bars">
      {ingredients.map((ingredient) => (
        <div key={ingredient.id} className="horizontal-bar-item">
          <span className="bar-label">{ingredient.name}</span>
          <div className="bar-container">
            <div
              className="bar-fill"
              style={{ width: `${ingredient.percentage}%` }}
            />
          </div>
          <span className="bar-percentage">{ingredient.percentage.toFixed(0)}%</span>
          <span className="bar-cost">${ingredient.cost.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function StackedBars({ ingredients }: { ingredients: Array<{ id: string; name: string; cost: number; percentage: number }> }) {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

  return (
    <div className="stacked-bars">
      <div className="stacked-bar-container">
        {ingredients.map((ingredient, index) => (
          <div
            key={ingredient.id}
            className="stacked-bar-segment"
            style={{
              width: `${ingredient.percentage}%`,
              backgroundColor: colors[index % colors.length],
            }}
            title={`${ingredient.name}: ${ingredient.percentage.toFixed(0)}%`}
          />
        ))}
      </div>
      <div className="stacked-legend">
        {ingredients.map((ingredient, index) => (
          <div key={ingredient.id} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="legend-label">{ingredient.name}</span>
            <span className="legend-value">{ingredient.percentage.toFixed(0)}%</span>
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
    <div className="pie-chart">
      <div className="pie-chart-container">
        <svg viewBox="0 0 100 100" className="pie-svg">
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
                className="pie-segment"
              >
                <title>{`${segment.name}: ${segment.percentage.toFixed(0)}%`}</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="pie-legend">
        {segments.map((segment) => (
          <div key={segment.id} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: segment.color }}
            />
            <span className="legend-label">{segment.name}</span>
            <span className="legend-value">{segment.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
