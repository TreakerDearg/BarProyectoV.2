import React, { useState } from 'react';
import { useRecipeStudio } from '../../contexts/RecipeStudioContext';
import { RecipeHealthScore } from '../intelligence/RecipeHealthScore';
import { RecipeWarnings } from '../intelligence/RecipeWarnings';
import { FormulaSuggestions } from '../intelligence/FormulaSuggestions';

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
    <div className="inspector-2-0">
      <div className="inspector-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`inspector-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.key === 'warnings' && warnings.length > 0 && (
              <span className="tab-badge">{warnings.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="inspector-content">
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
    <div className="inspector-tab-content overview-tab">
      <div className="overview-header">
        {recipe.image && <img src={recipe.image} alt={recipe.product?.name} className="overview-image" />}
        <div className="overview-info">
          <h2 className="overview-name">{recipe.product?.name || 'Sin nombre'}</h2>
          <span className="overview-category">{recipe.category}</span>
          <span className={`overview-status ${isAvailable ? 'available' : 'unavailable'}`}>
            {isAvailable ? '✓ Disponible' : '✗ No disponible'}
          </span>
        </div>
      </div>

      <div className="overview-stats">
        <StatItem label="Health Score" value={healthScore.overall} icon="❤️" />
        <StatItem label="Popularidad" value={analytics.popularity} icon="⭐" />
        <StatItem label="Tiempo" value={`${analytics.time} min`} icon="⏱️" />
        <StatItem label="Costo" value={`$${analytics.cost.toFixed(2)}`} icon="💰" />
        <StatItem label="Margen" value={`${analytics.margin.toFixed(0)}%`} icon="📊" />
        <StatItem label="Complejidad" value={analytics.complexity} icon="🎯" />
      </div>

      <div className="overview-meta">
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

  return (
    <div className="inspector-tab-content inventory-tab">
      <div className="inventory-header">
        <h3 className="inventory-title">Inventario</h3>
        <span className={`inventory-status ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? '✓ Todos disponibles' : `✗ ${missingIngredients.length} faltantes`}
        </span>
      </div>

      <div className="inventory-list">
        {recipe.ingredients.map((ingredient) => {
          const inventoryItem = inventoryItems.find(item => item._id === ingredient.inventoryItem._id);
          return (
            <div key={ingredient.inventoryItem._id} className="inventory-item">
              <span className="inventory-name">{ingredient.inventoryItem.name}</span>
              <span className="inventory-quantity">{ingredient.quantity} {ingredient.unit}</span>
              <span className="inventory-stock">{inventoryItem?.stock || 0}</span>
              <span className="inventory-cost">${inventoryItem?.cost || 0}</span>
              <span className="inventory-supplier">{inventoryItem?.supplier || 'N/A'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CostTab() {
  const { totalCost, ingredientCosts, ingredientPercentages, productionAnalysis, recipe } = useRecipeStudio();

  return (
    <div className="inspector-tab-content cost-tab">
      <div className="cost-summary">
        <h3 className="cost-title">Costo Total</h3>
        <span className="cost-value">${totalCost.toFixed(2)}</span>
        <span className="cost-margin">Margen: {productionAnalysis.margin.toFixed(0)}%</span>
      </div>

      <div className="cost-breakdown">
        <h4 className="breakdown-title">Desglose por Ingrediente</h4>
        {recipe.ingredients.map((ingredient) => {
          const ingredientId = ingredient.inventoryItem._id;
          const cost = ingredientCosts.get(ingredientId) || 0;
          const percentage = ingredientPercentages.get(ingredientId) || 0;
          return (
            <div key={ingredientId} className="cost-breakdown-item">
              <span className="breakdown-name">{ingredient.inventoryItem.name}</span>
              <div className="breakdown-bar">
                <div
                  className="breakdown-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="breakdown-percentage">{percentage.toFixed(0)}%</span>
              <span className="breakdown-value">${cost.toFixed(2)}</span>
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
    <div className="inspector-tab-content health-tab">
      <RecipeHealthScore healthScore={healthScore} />
    </div>
  );
}

function RelationsTab() {
  const { relations } = useRecipeStudio();

  return (
    <div className="inspector-tab-content relations-tab">
      <h3 className="relations-title">Relaciones</h3>
      {relations.length === 0 ? (
        <span className="relations-empty">Sin relaciones</span>
      ) : (
        <div className="relations-list">
          {relations.map((relation) => (
            <div key={relation.recipeId} className="relation-item">
              <span className="relation-name">{relation.recipeName}</span>
              <span className="relation-type">{relation.relationType}</span>
              <span className="relation-similarity">{relation.similarity}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const { analytics, healthScore } = useRecipeStudio();

  return (
    <div className="inspector-tab-content analytics-tab">
      <h3 className="analytics-title">Analytics</h3>
      <div className="analytics-grid">
        <AnalyticsItem label="Popularidad" value={analytics.popularity} icon="⭐" />
        <AnalyticsItem label="Margen" value={`${analytics.margin.toFixed(0)}%`} icon="📊" />
        <AnalyticsItem label="Costo" value={`$${analytics.cost.toFixed(2)}`} icon="💰" />
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
    <div className="inspector-tab-content timeline-tab">
      <h3 className="timeline-title">Timeline</h3>
      {versions.length === 0 ? (
        <span className="timeline-empty">Sin versiones</span>
      ) : (
        <div className="timeline-list">
          {versions.map((version) => (
            <div key={version._id} className="timeline-item">
              <span className="timeline-version">{version.version}</span>
              <span className="timeline-date">{version.date}</span>
              <span className="timeline-author">{version.author}</span>
              <span className="timeline-description">{version.description}</span>
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
    <div className="inspector-tab-content versions-tab">
      <h3 className="versions-title">Versiones</h3>
      {versions.length === 0 ? (
        <span className="versions-empty">Sin versiones</span>
      ) : (
        <div className="versions-list">
          {versions.map((version) => (
            <div key={version._id} className="version-item">
              <span className="version-number">{version.version}</span>
              <span className="version-date">{version.date}</span>
              <span className="version-author">{version.author}</span>
              <span className="version-notes">{version.notes || 'Sin notas'}</span>
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
    <div className="inspector-tab-content warnings-tab">
      <RecipeWarnings warnings={warnings} />
      <FormulaSuggestions suggestions={suggestions} />
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="stat-item">
      <span className="stat-icon">{icon}</span>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="meta-item">
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  );
}

function AnalyticsItem({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="analytics-item">
      <span className="analytics-icon">{icon}</span>
      <div className="analytics-info">
        <span className="analytics-label">{label}</span>
        <span className="analytics-value">{value}</span>
      </div>
    </div>
  );
}
