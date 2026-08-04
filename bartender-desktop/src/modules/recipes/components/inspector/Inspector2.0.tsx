import React, { useState } from 'react';
import { useRecipeStudio } from '../../contexts/RecipeStudioContext';
import { RecipeHealthScore } from '../intelligence/RecipeHealthScore';
import { RecipeWarnings } from '../intelligence/RecipeWarnings';
import { FormulaSuggestions } from '../intelligence/FormulaSuggestions';
import styles from './Inspector2.0.module.css';

type InspectorTab = 'overview' | 'inventory' | 'cost' | 'health' | 'relations' | 'analytics' | 'timeline' | 'versions' | 'warnings';

/**
 * Inspector Inteligente 2.0 - Inspector con pestañas
 * Inspirado en Unreal Engine Details Panel, Unity Inspector, Adobe Lightroom, Figma Right Panel
 * Reutiliza exclusivamente hooks existentes a través de RecipeStudioContext
 */
export function Inspector2_0() {
  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');
  const { recipe, healthScore, warnings, suggestions, relations, analytics, versions } = useRecipeStudio();

  const tabs: { key: InspectorTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📋' },
    { key: 'inventory', label: 'Inventory', icon: '📦' },
    { key: 'cost', label: 'Cost', icon: '💰' },
    { key: 'health', label: 'Health', icon: '❤️' },
    { key: 'relations', label: 'Relations', icon: '🔗' },
    { key: 'analytics', label: 'Analytics', icon: '📊' },
    { key: 'timeline', label: 'Timeline', icon: '📅' },
    { key: 'versions', label: 'Versions', icon: '🔖' },
    { key: 'warnings', label: 'Warnings', icon: '⚠️' },
  ];

  return (
    <div className={styles.inspector}>
      <div className={styles.inspectorTabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.inspectorTab} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.key === 'warnings' && warnings.length > 0 && (
              <span className={styles.tabBadge}>{warnings.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.inspectorContent}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'cost' && <CostTab />}
        {activeTab === 'health' && <HealthTab />}
        {activeTab === 'relations' && <RelationsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'timeline' && <TimelineTab />}
        {activeTab === 'versions' && <VersionsTab />}
        {activeTab === 'warnings' && <WarningsTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const { recipe, healthScore, analytics, isAvailable } = useRecipeStudio();

  return (
    <div className={`${styles.inspectorTabContent} ${styles.overviewTab}`}>
      <div className={styles.overviewHeader}>
        {recipe.image && <img src={recipe.image} alt={recipe.product?.name} className={styles.overviewImage} />}
        <div className={styles.overviewInfo}>
          <h2 className={styles.overviewName}>{recipe.product?.name || 'Sin nombre'}</h2>
          <span className={styles.overviewCategory}>{recipe.category}</span>
          <span className={`${styles.overviewStatus} ${isAvailable ? styles.available : styles.unavailable}`}>
            {isAvailable ? '✓ Disponible' : '✗ No disponible'}
          </span>
        </div>
      </div>

      <div className={styles.overviewStats}>
        <StatItem label="Health Score" value={healthScore.overall} icon="❤️" />
        <StatItem label="Popularidad" value={analytics.popularity} icon="⭐" />
        <StatItem label="Tiempo" value={`${analytics.time} min`} icon="⏱️" />
        <StatItem label="Costo" value={`$${(analytics.cost || 0).toFixed(2)}`} icon="💰" />
        <StatItem label="Margen" value={`${(analytics.margin || 0).toFixed(0)}%`} icon="📊" />
        <StatItem label="Complejidad" value={analytics.complexity} icon="🎯" />
      </div>

      <div className={styles.overviewMeta}>
        <MetaItem label="Versión" value={recipe.version || '1.0'} />
        <MetaItem label="Autor" value={recipe.author || 'Desconocido'} />
        <MetaItem label="Etiquetas" value={recipe.tags?.join(', ') || 'Sin etiquetas'} />
        <MetaItem label="Colecciones" value={recipe.collectionIds?.length || 0} />
      </div>
    </div>
  );
}

function InventoryTab() {
  const { recipe, inventoryItems, isAvailable, missingIngredients } = useRecipeStudio();

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return (
      <div className={`${styles.inspectorTabContent} ${styles.inventoryTab}`}>
        <span className={styles.inventoryEmpty}>Sin ingredientes</span>
      </div>
    );
  }

  return (
    <div className={`${styles.inspectorTabContent} ${styles.inventoryTab}`}>
      <div className={styles.inventoryHeader}>
        <h3 className={styles.inventoryTitle}>Inventario</h3>
        <span className={`${styles.inventoryStatus} ${isAvailable ? styles.available : styles.unavailable}`}>
          {isAvailable ? '✓ Todos disponibles' : `✗ ${missingIngredients.length} faltantes`}
        </span>
      </div>

      <div className={styles.inventoryList}>
        {recipe.ingredients.map((ingredient) => {
          const inventoryItem = inventoryItems.find(item => item._id === ingredient.inventoryItem._id);
          return (
            <div key={ingredient.inventoryItem._id} className={styles.inventoryItem}>
              <span className={styles.inventoryName}>{ingredient.inventoryItem.name}</span>
              <span className={styles.inventoryQuantity}>{ingredient.quantity} {ingredient.unit}</span>
              <span className={styles.inventoryStock}>{inventoryItem?.stock || 0}</span>
              <span className={styles.inventoryCost}>${inventoryItem?.cost || 0}</span>
              <span className={styles.inventorySupplier}>{inventoryItem?.supplier || 'N/A'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CostTab() {
  const { totalCost, ingredientCosts, ingredientPercentages, productionAnalysis, recipe } = useRecipeStudio();

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return (
      <div className={`${styles.inspectorTabContent} ${styles.costTab}`}>
        <span className={styles.costEmpty}>Sin ingredientes para calcular costo</span>
      </div>
    );
  }

  return (
    <div className={`${styles.inspectorTabContent} ${styles.costTab}`}>
      <div className={styles.costSummary}>
        <h3 className={styles.costTitle}>Costo Total</h3>
        <span className={styles.costValue}>${(totalCost || 0).toFixed(2)}</span>
        <span className={styles.costMargin}>Margen: {(productionAnalysis?.margin || 0).toFixed(0)}%</span>
      </div>

      <div className={styles.costBreakdown}>
        <h4 className={styles.breakdownTitle}>Desglose por Ingrediente</h4>
        {recipe.ingredients.map((ingredient) => {
          const ingredientId = ingredient.inventoryItem._id;
          const cost = ingredientCosts.get(ingredientId) || 0;
          const percentage = ingredientPercentages.get(ingredientId) || 0;
          return (
            <div key={ingredientId} className={styles.costBreakdownItem}>
              <span className={styles.breakdownName}>{ingredient.inventoryItem.name}</span>
              <div className={styles.breakdownBar}>
                <div
                  className={styles.breakdownFill}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className={styles.breakdownPercentage}>{(percentage || 0).toFixed(0)}%</span>
              <span className={styles.breakdownValue}>${(cost || 0).toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HealthTab() {
  const { healthScore } = useRecipeStudio();

  return (
    <div className={`${styles.inspectorTabContent} ${styles.healthTab}`}>
      <RecipeHealthScore healthScore={healthScore} />
    </div>
  );
}

function RelationsTab() {
  const { relations } = useRecipeStudio();

  return (
    <div className={`${styles.inspectorTabContent} ${styles.relationsTab}`}>
      <h3 className={styles.relationsTitle}>Relaciones</h3>
      {relations.length === 0 ? (
        <span className={styles.relationsEmpty}>Sin relaciones</span>
      ) : (
        <div className={styles.relationsList}>
          {relations.map((relation) => (
            <div key={relation.recipeId} className={styles.relationItem}>
              <span className={styles.relationName}>{relation.recipeName}</span>
              <span className={styles.relationType}>{relation.relationType}</span>
              <span className={styles.relationSimilarity}>{relation.similarity}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const { analytics, healthScore, versions } = useRecipeStudio();

  return (
    <div className={`${styles.inspectorTabContent} ${styles.analyticsTab}`}>
      <h3 className={styles.analyticsTitle}>Analytics</h3>
      <div className={styles.analyticsGrid}>
        <AnalyticsItem label="Popularidad" value={analytics.popularity} icon="⭐" />
        <AnalyticsItem label="Margen" value={`${(analytics.margin || 0).toFixed(0)}%`} icon="📊" />
        <AnalyticsItem label="Costo" value={`$${(analytics.cost || 0).toFixed(2)}`} icon="💰" />
        <AnalyticsItem label="Tiempo" value={`${analytics.time} min`} icon="⏱️" />
        <AnalyticsItem label="Complejidad" value={analytics.complexity} icon="🎯" />
        <AnalyticsItem label="Health Score" value={healthScore.overall} icon="❤️" />
        <AnalyticsItem label="Versiones" value={versions.length} icon="🔖" />
        <AnalyticsItem label="Variantes" value={analytics.variantCount} icon="🔄" />
      </div>
    </div>
  );
}

function TimelineTab() {
  const { versions } = useRecipeStudio();

  return (
    <div className={`${styles.inspectorTabContent} ${styles.timelineTab}`}>
      <h3 className={styles.timelineTitle}>Timeline</h3>
      {versions.length === 0 ? (
        <span className={styles.timelineEmpty}>Sin versiones</span>
      ) : (
        <div className={styles.timelineList}>
          {versions.map((version) => (
            <div key={version._id} className={styles.timelineItem}>
              <span className={styles.timelineVersion}>{version.version}</span>
              <span className={styles.timelineDate}>{version.date}</span>
              <span className={styles.timelineAuthor}>{version.author}</span>
              <span className={styles.timelineDescription}>{version.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VersionsTab() {
  const { versions } = useRecipeStudio();

  return (
    <div className={`${styles.inspectorTabContent} ${styles.versionsTab}`}>
      <h3 className={styles.versionsTitle}>Versiones</h3>
      {versions.length === 0 ? (
        <span className={styles.versionsEmpty}>Sin versiones</span>
      ) : (
        <div className={styles.versionsList}>
          {versions.map((version) => (
            <div key={version._id} className={styles.versionItem}>
              <span className={styles.versionNumber}>{version.version}</span>
              <span className={styles.versionDate}>{version.date}</span>
              <span className={styles.versionAuthor}>{version.author}</span>
              <span className={styles.versionNotes}>{version.notes || 'Sin notas'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WarningsTab() {
  const { warnings, suggestions } = useRecipeStudio();

  return (
    <div className={`${styles.inspectorTabContent} ${styles.warningsTab}`}>
      <RecipeWarnings warnings={warnings} />
      <FormulaSuggestions suggestions={suggestions} />
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className={styles.statItem}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.metaItem}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  );
}

function AnalyticsItem({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className={styles.analyticsItem}>
      <span className={styles.analyticsIcon}>{icon}</span>
      <div className={styles.analyticsInfo}>
        <span className={styles.analyticsLabel}>{label}</span>
        <span className={styles.analyticsValue}>{value}</span>
      </div>
    </div>
  );
}
