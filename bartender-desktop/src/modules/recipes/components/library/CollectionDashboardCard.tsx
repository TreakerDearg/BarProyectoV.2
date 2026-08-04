import { memo } from 'react';
import type { RecipeCollection } from '../../types';
import styles from './CollectionDashboardCard.module.css';

interface CollectionDashboardCardProps {
  collection: RecipeCollection;
  onSelect?: () => void;
}

/**
 * CollectionDashboardCard - Card estilo dashboard para colecciones
 * Inspirado en Steam/Spotify collections
 */
export const CollectionDashboardCard = memo(function CollectionDashboardCard({
  collection,
  onSelect,
}: CollectionDashboardCardProps) {
  const healthPercentage = collection.healthScore || 85;
  const newRecipes = collection.newRecipesCount || 0;
  const lastUpdated = collection.lastUpdated || 'Recientemente';
  
  const getHealthColor = (score: number): string => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#eab308';
    return '#ef4444';
  };
  
  const healthColor = getHealthColor(healthPercentage);

  return (
    <div 
      className={styles.collectionCard}
      onClick={onSelect}
      style={{ borderColor: collection.color }}
    >
      <div className={styles.cardHeader}>
        <div 
          className={styles.collectionIcon}
          style={{ backgroundColor: collection.color }}
        >
          <span className={styles.iconEmoji}>{collection.icon}</span>
        </div>
        <div className={styles.headerInfo}>
          <h3 className={styles.collectionName}>{collection.name}</h3>
          <span className={styles.recipeCount}>{collection.recipeCount} recetas</span>
        </div>
      </div>

      <div className={styles.cardStats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Health</span>
          <div className={styles.statValue}>
            <span className={styles.statNumber} style={{ color: healthColor }}>
              {healthPercentage}%
            </span>
          </div>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Nuevas</span>
          <div className={styles.statValue}>
            <span className={styles.statNumber} style={{ color: '#a855f7' }}>
              {newRecipes}
            </span>
          </div>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Actualizado</span>
          <div className={styles.statValue}>
            <span className={styles.statText}>{lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ 
            width: `${healthPercentage}%`,
            backgroundColor: healthColor,
            boxShadow: `0 0 10px ${healthColor}40`
          }}
        />
      </div>

      {collection.description && (
        <p className={styles.collectionDescription}>{collection.description}</p>
      )}

      {collection.tags && collection.tags.length > 0 && (
        <div className={styles.collectionTags}>
          {collection.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className={styles.tag} style={{ borderColor: collection.color }}>
              {tag}
            </span>
          ))}
          {collection.tags.length > 3 && (
            <span className={styles.moreTags}>+{collection.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className={styles.cardFooter}>
        <button className={styles.footerBtn}>Ver Colección</button>
        <button className={styles.footerBtnSecondary}>⋮</button>
      </div>
    </div>
  );
});
