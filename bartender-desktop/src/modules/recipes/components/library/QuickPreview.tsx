import { memo } from 'react';
import type { Recipe } from '../../types';
import styles from './QuickPreview.module.css';

interface QuickPreviewProps {
  recipe: Recipe | null;
  onEdit?: () => void;
  onOpenBuilder?: () => void;
  onClose?: () => void;
}

/**
 * QuickPreview - Panel lateral derecho para preview rápido
 * Muestra información esencial de la receta sin navegar
 */
export const QuickPreview = memo(function QuickPreview({
  recipe,
  onEdit,
  onOpenBuilder,
  onClose,
}: QuickPreviewProps) {
  if (!recipe) {
    return (
      <div className={styles.quickPreview}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📖</span>
          <p className={styles.emptyText}>Selecciona una receta para ver el preview</p>
        </div>
      </div>
    );
  }

  const healthScore = recipe.healthScore?.overall || 0;
  const margin = recipe.analytics?.margin || 0;
  const popularity = recipe.analytics?.popularity || 0;
  const time = recipe.preparationTime || 0;
  const cost = recipe.totalCost || 0;
  const isAvailable = recipe.isAvailable !== false;
  const isFavorite = recipe.isFavorite || false;
  
  const getHealthColor = (score: number): string => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };
  
  const getMarginColor = (margin: number): string => {
    if (margin >= 70) return '#22c55e';
    if (margin >= 40) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className={styles.quickPreview}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>Quick Preview</h3>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.previewContent}>
        <div className={styles.previewImage}>
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.product?.name} />
          ) : (
            <div className={styles.imagePlaceholder}>{recipe.type === 'drink' ? '🍸' : '🍰'}</div>
          )}
        </div>

        <div className={styles.previewInfo}>
          <h2 className={styles.recipeName}>{recipe.product?.name}</h2>
          <span className={styles.recipeCategory}>{recipe.category}</span>
          
          {recipe.description && (
            <p className={styles.recipeDescription}>{recipe.description}</p>
          )}
        </div>

        <div className={styles.previewStats}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Health Score</span>
            <div className={styles.statBar}>
              <div 
                className={styles.statFill} 
                style={{ width: `${healthScore}%`, backgroundColor: getHealthColor(healthScore) }}
              />
            </div>
            <span className={styles.statValue} style={{ color: getHealthColor(healthScore) }}>
              {healthScore}
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Margen</span>
            <div className={styles.statBar}>
              <div 
                className={styles.statFill} 
                style={{ width: `${margin}%`, backgroundColor: getMarginColor(margin) }}
              />
            </div>
            <span className={styles.statValue} style={{ color: getMarginColor(margin) }}>
              {margin}%
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Tiempo</span>
            <span className={styles.statValue}>{time} min</span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Costo</span>
            <span className={styles.statValue}>${(cost || 0).toFixed(2)}</span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Popularidad</span>
            <span className={styles.statValue} style={{ color: '#a855f7' }}>{popularity}%</span>
          </div>
        </div>

        <div className={styles.previewSection}>
          <h4 className={styles.sectionTitle}>Ingredientes</h4>
          <div className={styles.ingredientsList}>
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className={styles.ingredientItem}>
                <span className={styles.ingredientName}>{ing.inventoryItem?.name || 'Ingrediente'}</span>
                <span className={styles.ingredientQuantity}>
                  {ing.quantity} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className={styles.previewSection}>
            <h4 className={styles.sectionTitle}>Preparación</h4>
            <div className={styles.instructionsList}>
              {recipe.instructions.slice(0, 3).map((step, idx) => (
                <div key={idx} className={styles.instructionItem}>
                  <span className={styles.instructionNumber}>{idx + 1}</span>
                  <span className={styles.instructionText}>{step}</span>
                </div>
              ))}
              {recipe.instructions.length > 3 && (
                <span className={styles.moreInstructions}>
                  +{recipe.instructions.length - 3} pasos más
                </span>
              )}
            </div>
          </div>
        )}

        <div className={styles.previewSection}>
          <h4 className={styles.sectionTitle}>Variantes</h4>
          <div className={styles.variantsList}>
            <span className={styles.variantCount}>{recipe.variants?.length || 0} variantes disponibles</span>
          </div>
        </div>

        <div className={styles.previewSection}>
          <h4 className={styles.sectionTitle}>Timeline</h4>
          <div className={styles.timelinePreview}>
            <span className={styles.timelineCount}>{recipe.versions?.length || 0} versiones</span>
            <span className={styles.timelineLast}>Última: {recipe.updatedAt || 'Sin fecha'}</span>
          </div>
        </div>

        <div className={styles.previewActions}>
          <button className={styles.actionBtn} onClick={onEdit}>
            <span className={styles.actionIcon}>✏️</span>
            Editar
          </button>
          <button className={styles.actionBtn} onClick={onOpenBuilder}>
            <span className={styles.actionIcon}>🛠️</span>
            Abrir Builder
          </button>
        </div>
      </div>
    </div>
  );
});
