import React from 'react';
import { StudioCard } from './StudioCard';
import styles from './RecentRecipes.module.css';

interface Recipe {
  id: string;
  name: string;
  category: string;
  image?: string;
  healthScore: number;
  cost: number;
  time: number;
  status: 'active' | 'draft' | 'archived';
}

interface RecentRecipesProps {
  recipes: Recipe[];
  onRecipeClick?: (recipe: Recipe) => void;
}

export const RecentRecipes: React.FC<RecentRecipesProps> = ({ recipes, onRecipeClick }) => {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#34d399';
    if (score >= 60) return '#fbbf24';
    return '#f87171';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Activa', color: '#34d399' };
      case 'draft': return { label: 'Borrador', color: '#94a3b8' };
      case 'archived': return { label: 'Archivada', color: '#64748b' };
      default: return { label: status, color: '#94a3b8' };
    }
  };

  return (
    <div className={styles.recentRecipes}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recetas Recientes</h2>
        <button className={styles.viewAll}>Ver todas →</button>
      </div>
      <div className={styles.recipesGrid}>
        {Array.isArray(recipes) && recipes.map((recipe) => {
          const statusBadge = getStatusBadge(recipe.status);
          return (
            <StudioCard
              key={recipe.id}
              className={styles.recipeCard}
              variant="recipe"
              hoverable
              clickable
              onClick={() => onRecipeClick?.(recipe)}
            >
              <div className={styles.recipeImage}>
                {recipe.image ? (
                  <img src={recipe.image} alt={recipe.name} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span className={styles.placeholderIcon}>🍸</span>
                  </div>
                )}
                <div className={styles.recipeOverlay}>
                  <span
                    className={styles.healthBadge}
                    style={{ color: getHealthScoreColor(recipe.healthScore) }}
                  >
                    {recipe.healthScore}
                  </span>
                </div>
              </div>
              <div className={styles.recipeContent}>
                <div className={styles.recipeHeader}>
                  <h3 className={styles.recipeName}>{recipe.name}</h3>
                  <span
                    className={styles.statusBadge}
                    style={{ color: statusBadge.color }}
                  >
                    {statusBadge.label}
                  </span>
                </div>
                <p className={styles.recipeCategory}>{recipe.category}</p>
                <div className={styles.recipeMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>💰</span>
                    <span className={styles.metaValue}>${(recipe.cost || 0).toFixed(2)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>⏱️</span>
                    <span className={styles.metaValue}>{recipe.time} min</span>
                  </div>
                </div>
              </div>
            </StudioCard>
          );
        })}
      </div>
    </div>
  );
};
