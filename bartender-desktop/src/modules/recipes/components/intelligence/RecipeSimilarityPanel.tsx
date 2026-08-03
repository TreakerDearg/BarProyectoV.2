import { useState } from 'react';
import { useRecipeStudio } from '../../contexts/RecipeStudioContext';
import type { RecipeRelation } from '../../types';

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
    <div className="recipe-similarity-panel">
      <div className="similarity-header">
        <h3 className="similarity-title">Recetas Similares</h3>
        <div className="similarity-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`filter-btn ${filter === 'variant' ? 'active' : ''}`}
            onClick={() => setFilter('variant')}
          >
            Variantes
          </button>
          <button
            className={`filter-btn ${filter === 'ingredient' ? 'active' : ''}`}
            onClick={() => setFilter('ingredient')}
          >
            Ingredientes
          </button>
          <button
            className={`filter-btn ${filter === 'technique' ? 'active' : ''}`}
            onClick={() => setFilter('technique')}
          >
            Técnicas
          </button>
          <button
            className={`filter-btn ${filter === 'family' ? 'active' : ''}`}
            onClick={() => setFilter('family')}
          >
            Familia
          </button>
        </div>
      </div>

      <div className="similarity-list">
        {filteredRelations.length === 0 ? (
          <span className="similarity-empty">Sin recetas similares</span>
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

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 80) return 'high';
    if (similarity >= 60) return 'medium';
    return 'low';
  };

  return (
    <div className="similarity-card">
      <div className="similarity-card-header">
        <span className="similarity-icon">{getRelationIcon(relation.relationType)}</span>
        <span className="similarity-name">{relation.recipeName}</span>
        <span className="similarity-type">{getRelationLabel(relation.relationType)}</span>
      </div>
      <div className="similarity-card-body">
        <div className={`similarity-score ${getSimilarityColor(relation.similarity)}`}>
          <span className="score-value">{relation.similarity}%</span>
          <span className="score-label">Similitud</span>
        </div>
      </div>
    </div>
  );
}
