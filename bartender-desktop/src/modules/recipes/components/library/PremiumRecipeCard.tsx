import { memo, useState } from 'react';
import type { Recipe } from '../../types';
import styles from './PremiumRecipeCard.module.css';

interface PremiumRecipeCardProps {
  recipe: Recipe;
  onSelect?: () => void;
  onEdit?: () => void;
  onPreview?: () => void;
  isHero?: boolean;
}

/**
 * PremiumRecipeCard - Tarjeta premium estilo Steam/Spotify
 * Glassmorphism, rich data, hover effects, mini analytics
 */
export const PremiumRecipeCard = memo(function PremiumRecipeCard({ 
  recipe, 
  onSelect, 
  onEdit, 
  onPreview,
  isHero = false 
}: PremiumRecipeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const healthScore = recipe.healthScore?.overall || 0;
  const margin = recipe.analytics?.margin || 0;
  const popularity = recipe.analytics?.popularity || 0;
  const difficulty = recipe.difficulty || 'medium';
  const time = recipe.preparationTime || 0;
  const cost = recipe.totalCost || 0;
  const isAvailable = recipe.isAvailable !== false;
  const isFavorite = recipe.isFavorite || false;
  const isVariant = recipe.isPrimary === false;
  const variantName = recipe.variantName || '';
  
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
  
  const getDifficultyColor = (diff: string): string => {
    switch (diff) {
      case 'easy': return '#22c55e';
      case 'medium': return '#eab308';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  const getAvailabilityStatus = (): { label: string; color: string } => {
    if (!isAvailable) return { label: 'Sin Stock', color: '#ef4444' };
    if (recipe.isExperimental) return { label: 'Experimental', color: '#a855f7' };
    if (recipe.isArchived) return { label: 'Archivada', color: '#6b7280' };
    return { label: 'Disponible', color: '#22c55e' };
  };
  
  const availability = getAvailabilityStatus();
  
  if (isHero) {
    return (
      <div 
        className={`${styles.premiumCard} ${styles.heroCard}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onSelect}
      >
        <div className={styles.heroImage}>
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.product?.name} />
          ) : (
            <div className={styles.imagePlaceholder}>{recipe.type === 'drink' ? '🍸' : '🍰'}</div>
          )}
          <div className={styles.heroOverlay}>
            <span className={styles.heroBadge}>Cocktail del Día</span>
          </div>
        </div>
        
        <div className={styles.heroContent}>
          <div className={styles.heroHeader}>
            <h2 className={styles.heroTitle}>{recipe.product?.name}</h2>
            <div className={styles.heroMeta}>
              <span className={styles.heroCategory}>{recipe.category}</span>
              <span className={styles.heroRating}>⭐⭐⭐⭐⭐</span>
            </div>
          </div>
          
          <p className={styles.heroDescription}>{recipe.description || 'Sin descripción'}</p>
          
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Health</span>
              <span className={styles.statValue} style={{ color: getHealthColor(healthScore) }}>
                {healthScore}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Popularidad</span>
              <span className={styles.statValue} style={{ color: '#a855f7' }}>
                {popularity}%
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Margen</span>
              <span className={styles.statValue} style={{ color: getMarginColor(margin) }}>
                {margin}%
              </span>
            </div>
          </div>
          
          <div className={styles.heroActions}>
            <button className={`${styles.heroBtn} ${styles.primary}`}>Preparar</button>
            <button className={`${styles.heroBtn} ${styles.secondary}`} onClick={(e) => { e.stopPropagation(); onPreview?.(); }}>
              Preview
            </button>
            <button className={`${styles.heroBtn} ${styles.tertiary}`} onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
              Editar
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`${styles.premiumCard} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className={styles.cardImage}>
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.product?.name} />
        ) : (
          <div className={styles.imagePlaceholder}>{recipe.type === 'drink' ? '🍸' : '🍰'}</div>
        )}
        <div className={styles.imageOverlay}>
          {isVariant && <span className={styles.variantBadge}>🔄 {variantName}</span>}
          {isFavorite && <span className={styles.favoriteBadge}>⭐</span>}
          <span className={styles.availabilityBadge} style={{ backgroundColor: availability.color }}>
            {availability.label}
          </span>
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{recipe.product?.name}</h3>
          <span className={styles.cardCategory}>{recipe.category}</span>
        </div>
        
        <div className={styles.cardRating}>
          <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
          <span className={styles.popularity}>❤ Popular</span>
        </div>
        
        <div className={styles.quickStats}>
          <div className={styles.quickStat}>
            <span className={styles.quickStatIcon}>💰</span>
            <span className={styles.quickStatValue}>${(cost || 0).toFixed(2)}</span>
          </div>
          <div className={styles.quickStat}>
            <span className={styles.quickStatIcon}>⏱</span>
            <span className={styles.quickStatValue}>{time} min</span>
          </div>
          <div className={styles.quickStat}>
            <span className={styles.quickStatIcon}>📦</span>
            <span className={styles.quickStatValue} style={{ color: availability.color }}>
              {isAvailable ? 'OK' : 'Low'}
            </span>
          </div>
        </div>
        
        <div className={styles.miniAnalytics}>
          <div className={styles.miniStat}>
            <span className={styles.miniStatLabel}>Health</span>
            <span className={styles.miniStatValue} style={{ color: getHealthColor(healthScore) }}>
              {healthScore}
            </span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatLabel}>Margin</span>
            <span className={styles.miniStatValue} style={{ color: getMarginColor(margin) }}>
              {margin}%
            </span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatLabel}>Diff</span>
            <span className={styles.miniStatValue} style={{ color: getDifficultyColor(difficulty) }}>
              {difficulty}
            </span>
          </div>
        </div>
        
        <div className={styles.ingredientsPreview}>
          <span className={styles.ingredientsLabel}>Ingredientes</span>
          <div className={styles.ingredientsList}>
            {recipe.ingredients.slice(0, 3).map((ing, idx) => (
              <span key={idx} className={styles.ingredientTag}>
                {ing.inventoryItem?.name || 'Ingrediente'}
              </span>
            ))}
            {recipe.ingredients.length > 3 && (
              <span className={styles.ingredientMore}>+{recipe.ingredients.length - 3}</span>
            )}
          </div>
        </div>
        
        {recipe.tags && recipe.tags.length > 0 && (
          <div className={styles.tagsContainer}>
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>
      
      {isHovered && (
        <div className={styles.cardActions}>
          <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); onSelect?.(); }}>
            Abrir
          </button>
          <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); onPreview?.(); }}>
            Preview
          </button>
          <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
            Editar
          </button>
          <button className={styles.actionBtn}>⋮</button>
        </div>
      )}
    </div>
  );
});
