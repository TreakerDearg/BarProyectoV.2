import { useState } from 'react';
import { useRecipeStudio } from '../../contexts/RecipeStudioContext';
import type { RecipeRelation } from '../../types';
import styles from './RecipeSimilarityPanel.module.css';

type SimilarityFilter = 'all' | 'variant' | 'ingredient' | 'technique' | 'family';

/**
 * RecipeSimilarityPanel - Visualización de recetas similares
 * Consume useRecipeRelations sin duplicar lógica
 * Muestra porcentaje de similitud, filtros y cards profesionales
 */
export function RecipeSimilarityPanel() {
  const { relations } = useRecipeStudio();
  const [filter, setFilter] = useState<SimilarityFilter>('all');

  const filteredRelations = relations.filter(relation => {
    if (filter === 'all') return true;
    return relation.relationType === filter;
  });

  return (
    <div className={styles.recipeSimilarityPanel}>
      <div className={styles.similarityHeader}>
        <h3 className={styles.similarityTitle}>Recetas Similares</h3>
        <div className={styles.similarityFilters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'variant' ? styles.active : ''}`}
            onClick={() => setFilter('variant')}
          >
            Variantes
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'ingredient' ? styles.active : ''}`}
            onClick={() => setFilter('ingredient')}
          >
            Ingredientes
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'technique' ? styles.active : ''}`}
            onClick={() => setFilter('technique')}
          >
            Técnicas
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'family' ? styles.active : ''}`}
            onClick={() => setFilter('family')}
          >
            Familia
          </button>
        </div>
      </div>

      <div className={styles.similarityList}>
        {filteredRelations.length === 0 ? (
          <span className={styles.similarityEmpty}>Sin recetas similares</span>
        ) : (
          filteredRelations.map((relation) => (
            <SimilarityCard key={relation.recipeId} relation={relation} />
          ))
        )}
      </div>
    </div>
  );
}

function SimilarityCard({ relation }: { relation: RecipeRelation }) {
  const getRelationIcon = (type: string): string => {
    switch (type) {
      case 'variant': return '🔄';
      case 'ingredient': return '🥗';
      case 'technique': return '🎯';
      case 'family': return '👨‍👩‍👧‍👦';
      default: return '🔗';
    }
  };

  const getRelationLabel = (type: string): string => {
    switch (type) {
      case 'variant': return 'Variante';
      case 'ingredient': return 'Ingredientes';
      case 'technique': return 'Técnica';
      case 'family': return 'Familia';
      default: return 'Relacionada';
    }
  };

  const getSimilarityClass = (similarity: number): string => {
    if (similarity >= 80) return styles.high;
    if (similarity >= 60) return styles.medium;
    return styles.low;
  };

  return (
    <div className={styles.similarityCard}>
      <div className={styles.similarityCardHeader}>
        <span className={styles.similarityIcon}>{getRelationIcon(relation.relationType)}</span>
        <span className={styles.similarityName}>{relation.recipeName}</span>
        <span className={styles.similarityType}>{getRelationLabel(relation.relationType)}</span>
      </div>
      <div className={styles.similarityCardBody}>
        <div className={`${styles.similarityScore} ${getSimilarityClass(relation.similarity)}`}>
          <span className={styles.scoreValue}>{relation.similarity}%</span>
          <span className={styles.scoreLabel}>Similitud</span>
        </div>
      </div>
    </div>
  );
}
