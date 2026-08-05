import { useState, memo } from 'react';
import { BarChart3, Package, DollarSign, Heart, Link, TrendingUp, Calendar, Bookmark, AlertTriangle, CheckCircle, X, Clock, Target, GitBranch } from 'lucide-react';
import { useRecipeWorkspace } from '../../contexts/RecipeWorkspaceContext';
import type { Recipe } from '../../types';
import styles from './SmartInspector.module.css';

type InspectorTab = 'overview' | 'inventory' | 'costs' | 'health' | 'relations' | 'analytics' | 'timeline' | 'versions' | 'warnings';

const tabs = [
  { id: 'overview' as InspectorTab, icon: BarChart3, label: 'Overview' },
  { id: 'inventory' as InspectorTab, icon: Package, label: 'Inventory' },
  { id: 'costs' as InspectorTab, icon: DollarSign, label: 'Costs' },
  { id: 'health' as InspectorTab, icon: Heart, label: 'Health' },
  { id: 'relations' as InspectorTab, icon: Link, label: 'Relations' },
  { id: 'analytics' as InspectorTab, icon: TrendingUp, label: 'Analytics' },
  { id: 'timeline' as InspectorTab, icon: Calendar, label: 'Timeline' },
  { id: 'versions' as InspectorTab, icon: Bookmark, label: 'Versions' },
  { id: 'warnings' as InspectorTab, icon: AlertTriangle, label: 'Warnings' },
];

/**
 * SmartInspector - Panel derecho estilo Figma
 * Tabs con Overview, Inventory, Costs, Health, Relations, Analytics, Timeline, Versions, Warnings
 */
export const SmartInspector = memo(function SmartInspector() {
  const {
    recipe,
    masterRecipe,
    totalCost,
    ingredientCosts,
    ingredientPercentages,
    isAvailable,
    missingIngredients,
    availableIngredients,
    healthScore,
    margin,
  } = useRecipeWorkspace();

  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');

  const complexity = calculateComplexity(recipe);
  const estimatedTime = calculateEstimatedTime(recipe);

  return (
    <div className={styles.smartInspector}>
      {/* Tabs */}
      <div className={styles.inspectorTabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <Icon size={16} className={styles.tabIcon} />
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className={styles.inspectorContent}>
        {activeTab === 'overview' && (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Overview</h3>
            <div className={styles.overviewGrid}>
              <div className={styles.overviewCard}>
                <DollarSign size={20} className={styles.overviewIcon} />
                <div className={styles.overviewInfo}>
                  <span className={styles.overviewLabel}>Costo</span>
                  <span className={styles.overviewValue}>${(totalCost || 0).toFixed(2)}</span>
                </div>
              </div>
              <div className={styles.overviewCard}>
                <Clock size={20} className={styles.overviewIcon} />
                <div className={styles.overviewInfo}>
                  <span className={styles.overviewLabel}>Tiempo</span>
                  <span className={styles.overviewValue}>{estimatedTime} min</span>
                </div>
              </div>
              <div className={styles.overviewCard}>
                <Package size={20} className={styles.overviewIcon} />
                <div className={styles.overviewInfo}>
                  <span className={styles.overviewLabel}>Ingredientes</span>
                  <span className={styles.overviewValue}>{recipe.ingredients.length}</span>
                </div>
              </div>
              <div className={styles.overviewCard}>
                <Target size={20} className={styles.overviewIcon} />
                <div className={styles.overviewInfo}>
                  <span className={styles.overviewLabel}>Complejidad</span>
                  <span className={styles.overviewValue}>{complexity}</span>
                </div>
              </div>
              <div className={styles.overviewCard}>
                <TrendingUp size={20} className={styles.overviewIcon} />
                <div className={styles.overviewInfo}>
                  <span className={styles.overviewLabel}>Rentabilidad</span>
                  <span className={`${styles.overviewValue} ${margin.isProfitable ? styles.success : styles.danger}`}>
                    {margin.marginPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className={styles.overviewCard}>
                <Heart size={20} className={styles.overviewIcon} />
                <div className={styles.overviewInfo}>
                  <span className={styles.overviewLabel}>Health Score</span>
                  <span className={styles.overviewValue} style={{ color: getHealthColor(healthScore) }}>
                    {healthScore}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.statusSection}>
              <span className={styles.statusLabel}>Estado</span>
              <span className={`${styles.statusBadge} ${isAvailable ? styles.available : styles.unavailable}`}>
                {isAvailable ? <CheckCircle size={12} /> : <X size={12} />} {isAvailable ? 'Disponible' : 'Faltan ingredientes'}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Inventory</h3>
            <div className={styles.inventoryStatus}>
              <span className={`${styles.statusBadge} ${isAvailable ? styles.available : styles.unavailable}`}>
                {isAvailable ? <CheckCircle size={12} /> : <X size={12} />} {isAvailable ? 'Disponible' : 'No disponible'}
              </span>
            </div>
            {missingIngredients.length > 0 && (
              <div className={styles.missingSection}>
                <h4 className={styles.sectionSubtitle}>Faltantes</h4>
                {missingIngredients.map((item) => (
                  <div key={item.inventoryItemId} className={styles.inventoryItem}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemAmount}>
                      {item.required} {item.unit} (disponible: {item.available})
                    </span>
                  </div>
                ))}
              </div>
            )}
            {availableIngredients.length > 0 && (
              <div className={styles.availableSection}>
                <h4 className={styles.sectionSubtitle}>Disponibles</h4>
                {availableIngredients.slice(0, 5).map((item) => (
                  <div key={item.inventoryItemId} className={styles.inventoryItem}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemAmount}>{item.available} {item.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'costs' && (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Costs</h3>
            <div className={styles.costSummary}>
              <div className={styles.costRow}>
                <span className={styles.costLabel}>Costo Total</span>
                <span className={styles.costValue}>${(totalCost || 0).toFixed(2)}</span>
              </div>
              <div className={styles.costRow}>
                <span className={styles.costLabel}>Margen</span>
                <span className={`${styles.costValue} ${margin.isProfitable ? styles.success : styles.danger}`}>
                  {margin.marginPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
            <h4 className={styles.sectionSubtitle}>Desglose por Ingrediente</h4>
            <div className={styles.costBreakdown}>
              {Array.from(ingredientCosts.entries()).map(([id, cost]) => (
                <div key={id} className={styles.breakdownItem}>
                  <span className={styles.breakdownIngredient}>{id}</span>
                  <span className={styles.breakdownCost}>${(cost || 0).toFixed(2)}</span>
                  <span className={styles.breakdownPercentage}>
                    {(ingredientPercentages.get(id) || 0).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Health Score</h3>
            <div className={styles.healthScore}>
              <span className={styles.healthValue} style={{ color: getHealthColor(healthScore) }}>
                {healthScore}
              </span>
              <span className={styles.healthLabel}>/ 100</span>
            </div>
            <div className={styles.healthMetrics}>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Balance</span>
                <div className={styles.metricBar}>
                  <div className={styles.metricFill} style={{ width: `${healthScore}%` }} />
                </div>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Complexity</span>
                <div className={styles.metricBar}>
                  <div className={styles.metricFill} style={{ width: `${healthScore}%` }} />
                </div>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Originality</span>
                <div className={styles.metricBar}>
                  <div className={styles.metricFill} style={{ width: `${healthScore}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'relations' && (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Relations</h3>
            {masterRecipe && (
              <div className={styles.relationCard}>
                <GitBranch size={20} className={styles.relationIcon} />
                <div className={styles.relationInfo}>
                  <span className={styles.relationLabel}>Receta Base</span>
                  <span className={styles.relationValue}>{masterRecipe.product?.name}</span>
                </div>
              </div>
            )}
            <div className={styles.relationSection}>
              <h4 className={styles.sectionSubtitle}>Recetas Similares</h4>
              <p className={styles.emptyText}>No hay recetas similares</p>
            </div>
            <div className={styles.relationSection}>
              <h4 className={styles.sectionSubtitle}>Variantes</h4>
              <p className={styles.emptyText}>No hay variantes</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Analytics</h3>
            <div className={styles.analyticsGrid}>
                    <div className={styles.healthMetric}>
                      <span className={styles.healthLabel}>Balance</span>
                      <span className={styles.healthValue}>{healthScore}/10</span>
                    </div>
                    <div className={styles.healthMetric}>
                      <span className={styles.healthLabel}>Alcohol</span>
                      <span className={styles.healthValue}>{healthScore}/10</span>
                    </div>
                    <div className={styles.healthMetric}>
                      <span className={styles.healthLabel}>Complexidad</span>
                      <span className={styles.healthValue}>{healthScore}/10</span>
                    </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Timeline</h3>
            <div className={styles.timelineList}>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>{recipe.createdAt || 'Hoy'}</span>
                <span className={styles.timelineEvent}>Receta creada</span>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>{recipe.updatedAt || 'Ahora'}</span>
                <span className={styles.timelineEvent}>Última modificación</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Versions</h3>
            <p className={styles.emptyText}>No hay versiones guardadas</p>
          </div>
        )}

        {activeTab === 'warnings' && (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Warnings</h3>
            {!isAvailable && (
              <div className={styles.warningCard}>
                <span className={styles.warningIcon}>⚠️</span>
                <span className={styles.warningText}>Faltan ingredientes para preparar esta receta</span>
              </div>
            )}
            {!margin.isProfitable && (
              <div className={styles.warningCard}>
                <span className={styles.warningIcon}>💰</span>
                <span className={styles.warningText}>El margen es negativo, revisa el precio</span>
              </div>
            )}
            {isAvailable && margin.isProfitable && (
              <p className={styles.emptyText}>No hay advertencias</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

function getHealthColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  return '#ef4444';
}

function calculateComplexity(recipe: Recipe): 'low' | 'medium' | 'high' {
  const ingredientCount = recipe.ingredients.length;
  const stepCount = recipe.steps?.length || 0;
  
  if (ingredientCount <= 3 && stepCount <= 2) return 'low';
  if (ingredientCount <= 6 && stepCount <= 4) return 'medium';
  return 'high';
}

function calculateEstimatedTime(recipe: Recipe): number {
  const stepCount = recipe.steps?.length || 0;
  const ingredientCount = recipe.ingredients.length;
  return stepCount * 2 + ingredientCount * 0.5;
}
