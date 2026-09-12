import { memo } from 'react';
import {
  GlassWater, ChefHat, Star, DollarSign, Clock,
  CheckCircle2, XCircle, Pencil, Eye, Play,
  FlaskConical, Heart, Layers,
} from 'lucide-react';
import type { Recipe } from '../../types';
import styles from './PremiumRecipeCard.module.css';

interface PremiumRecipeCardProps {
  recipe: Recipe;
  onSelect?: () => void;
  onEdit?: () => void;
  onPreview?: () => void;
  isHero?: boolean;
}

/* ── Helpers ─────────────────────────────────────────────────── */
const healthColor = (s: number) => s >= 80 ? '#22c55e' : s >= 60 ? '#eab308' : '#ef4444';
const marginColor = (m: number) => m >= 70 ? '#22c55e' : m >= 40 ? '#eab308' : '#ef4444';
const diffColor   = (d: string) =>
  d === 'easy' ? '#22c55e' : d === 'hard' ? '#ef4444' : '#eab308';

function TypeIcon({ type, size = 16 }: { type?: string; size?: number }) {
  return type === 'food'
    ? <ChefHat size={size} className="text-emerald-400/50" />
    : <GlassWater size={size} className="text-cyan-400/50" />;
}

/* ── Hero Card ───────────────────────────────────────────────── */
function HeroCard({ recipe, onSelect, onEdit, onPreview }: PremiumRecipeCardProps) {
  const healthScore = recipe.healthScore?.overall ?? 0;
  const margin      = recipe.analytics?.margin     ?? 0;
  const popularity  = recipe.analytics?.popularity ?? 0;

  return (
    <div className={`${styles.premiumCard} ${styles.heroCard}`} onClick={onSelect}>
      {/* Image */}
      <div className={styles.heroImage}>
        {recipe.image
          ? <img src={recipe.image} alt={recipe.product?.name ?? 'Receta'} />
          : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/8 to-violet-500/8">
              <TypeIcon type={recipe.type} size={56} />
            </div>
          )
        }
        <div className={styles.heroOverlay} />
        <span className={styles.heroBadge}>
          {recipe.type === 'food' ? 'Plato destacado' : 'Cocktail del día'}
        </span>
      </div>

      {/* Content */}
      <div className={styles.heroContent}>
        <div className={styles.heroHeader}>
          <h2 className={styles.heroTitle}>{recipe.product?.name ?? 'Sin nombre'}</h2>
          <div className={styles.heroMeta}>
            <span className={styles.heroCategory}>{recipe.category ?? 'Sin categoría'}</span>
          </div>
        </div>

        <p className={styles.heroDescription}>
          {recipe.description ?? 'Receta sin descripción disponible.'}
        </p>

        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Health</span>
            <span className={styles.statValue} style={{ color: healthColor(healthScore) }}>
              {healthScore}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Popular</span>
            <span className={styles.statValue} style={{ color: '#a855f7' }}>
              {popularity}%
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Margen</span>
            <span className={styles.statValue} style={{ color: marginColor(margin) }}>
              {margin}%
            </span>
          </div>
        </div>

        <div className={styles.heroActions}>
          <button
            className={`${styles.heroBtn} ${styles.primary}`}
            onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
          >
            Preparar
          </button>
          <button
            className={`${styles.heroBtn} ${styles.secondary}`}
            onClick={(e) => { e.stopPropagation(); onPreview?.(); }}
          >
            Vista previa
          </button>
          <button
            className={`${styles.heroBtn} ${styles.tertiary}`}
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Standard Card ───────────────────────────────────────────── */
export const PremiumRecipeCard = memo(function PremiumRecipeCard({
  recipe, onSelect, onEdit, onPreview, isHero = false,
}: PremiumRecipeCardProps) {
  if (isHero) {
    return <HeroCard recipe={recipe} onSelect={onSelect} onEdit={onEdit} onPreview={onPreview} />;
  }

  const healthScore = recipe.healthScore?.overall ?? 0;
  const margin      = recipe.analytics?.margin     ?? 0;
  const difficulty  = recipe.difficulty  ?? 'medium';
  const time        = recipe.preparationTime ?? 0;
  const cost        = recipe.totalCost        ?? 0;
  const isAvailable = recipe.isAvailable !== false;
  const isFavorite  = recipe.isFavorite  ?? false;
  const isVariant   = recipe.isPrimary   === false;
  const variantName = recipe.variantName ?? '';
  const isPrimary   = recipe.isPrimary   === true;

  const ingredients = recipe.ingredients ?? [];
  const tags        = recipe.tags        ?? [];

  return (
    <div className={styles.premiumCard} onClick={onSelect}>
      {/* Image */}
      <div className={styles.cardImage}>
        {recipe.image
          ? <img src={recipe.image} alt={recipe.product?.name ?? 'Receta'} />
          : (
            <div className={styles.imagePlaceholder}>
              <TypeIcon type={recipe.type} size={52} />
            </div>
          )
        }
        <div className={styles.imageOverlay}>
          <div className="flex gap-1.5 flex-wrap">
            {isPrimary  && <span className={styles.primaryBadge}>Primaria</span>}
            {isVariant  && <span className={styles.variantBadge}>{variantName || 'Variante'}</span>}
            {isFavorite && <span className={styles.favoriteBadge}>Favorita</span>}
          </div>
          <span
            className={styles.availabilityBadge}
            style={{ borderColor: isAvailable ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
                     color: isAvailable ? '#4ade80' : '#f87171' }}
          >
            {isAvailable ? 'Disponible' : 'Sin stock'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{recipe.product?.name ?? 'Sin nombre'}</h3>
          {recipe.category && (
            <span className={styles.cardCategory}>{recipe.category}</span>
          )}
        </div>

        {/* Quick stats */}
        <div className={styles.quickStats}>
          <div className={styles.quickStat}>
            <DollarSign size={12} className={styles.quickStatIcon} />
            <span className={styles.quickStatValue}>${cost.toFixed(2)}</span>
          </div>
          <div className={styles.quickStat}>
            <Clock size={12} className={styles.quickStatIcon} />
            <span className={styles.quickStatValue}>{time}min</span>
          </div>
          <div className={styles.quickStat}>
            {isAvailable
              ? <CheckCircle2 size={12} className={styles.quickStatIcon} style={{ color: '#4ade80' }} />
              : <XCircle      size={12} className={styles.quickStatIcon} style={{ color: '#f87171' }} />
            }
            <span
              className={styles.quickStatValue}
              style={{ color: isAvailable ? '#4ade80' : '#f87171' }}
            >
              {isAvailable ? 'OK' : 'Low'}
            </span>
          </div>
        </div>

        {/* Mini analytics */}
        <div className={styles.miniAnalytics}>
          <div className={styles.miniStat}>
            <span className={styles.miniStatLabel}>Health</span>
            <span className={styles.miniStatValue} style={{ color: healthColor(healthScore) }}>
              {healthScore}
            </span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatLabel}>Margen</span>
            <span className={styles.miniStatValue} style={{ color: marginColor(margin) }}>
              {margin}%
            </span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatLabel}>Dific.</span>
            <span className={styles.miniStatValue} style={{ color: diffColor(difficulty) }}>
              {difficulty === 'easy' ? 'Fácil' : difficulty === 'hard' ? 'Difícil' : 'Med.'}
            </span>
          </div>
        </div>

        {/* Ingredients preview */}
        {ingredients.length > 0 && (
          <div className={styles.ingredientsPreview}>
            <span className={styles.ingredientsLabel}>Ingredientes</span>
            <div className={styles.ingredientsList}>
              {ingredients.slice(0, 3).map((ing, idx) => (
                <span key={idx} className={styles.ingredientTag}>
                  {ing.inventoryItem?.name ?? 'Ingrediente'}
                </span>
              ))}
              {ingredients.length > 3 && (
                <span className={styles.ingredientMore}>+{ingredients.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className={styles.tagsContainer}>
            {tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className={styles.tag}>
                {typeof tag === 'string' ? tag : tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div className={styles.cardActions}>
        <button
          className={styles.actionBtn}
          onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
          title="Abrir receta"
        >
          Abrir
        </button>
        <button
          className={styles.actionBtn}
          onClick={(e) => { e.stopPropagation(); onPreview?.(); }}
          title="Vista previa"
        >
          Preview
        </button>
        <button
          className={styles.actionBtn}
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          title="Editar"
        >
          Editar
        </button>
      </div>
    </div>
  );
});
