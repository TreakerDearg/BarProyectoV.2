import { Star, Clock, DollarSign, Activity, GitBranch, ChevronRight, MoreVertical } from 'lucide-react';
import { DiffBadge } from './DiffViewer';
import styles from './VariantCard.module.css';

interface VariantCardProps {
  variant: any;
  masterRecipe?: any;
  isSelected?: boolean;
  onSelect?: () => void;
  diffCount?: number;
}

/**
 * VariantCard - Card grande reemplazando filas
 * Muestra información completa de la variante
 */
export function VariantCard({
  variant,
  masterRecipe,
  isSelected = false,
  onSelect,
  diffCount = 0,
}: VariantCardProps) {
  const isMaster = variant.isPrimary || !variant.parentId;
  const healthScore = variant.healthScore || 85;
  const cost = variant.totalCost || 0;
  const margin = variant.margin || 0;

  return (
    <div
      className={`${styles.variantCard} ${isSelected ? styles.selected : ''} ${isMaster ? styles.master : ''}`}
      onClick={onSelect}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardImage}>
          {variant.image ? (
            <img src={variant.image} alt={variant.product?.name} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <Star />
            </div>
          )}
        </div>
        <div className={styles.cardInfo}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>{variant.product?.name}</h3>
            {isMaster && <span className={styles.masterBadge}>Master</span>}
          </div>
          <p className={styles.cardSubtitle}>{variant.variantName || variant.category}</p>
          <div className={styles.cardBadges}>
            <span className={styles.badge}>Active</span>
            {diffCount > 0 && <DiffBadge type="modified" count={diffCount} />}
          </div>
        </div>
        <button className={styles.cardMenu}>
          <MoreVertical className={styles.menuIcon} />
        </button>
      </div>

      <div className={styles.cardMetrics}>
        <MetricCard
          icon={<DollarSign />}
          value={`$${cost.toFixed(2)}`}
          label="Cost"
          trend={variant.costTrend}
        />
        <MetricCard
          icon={<Activity />}
          value={healthScore.toString()}
          label="Health"
          trend={variant.healthTrend}
        />
        <MetricCard
          icon={<Clock />}
          value={`${variant.prepTime || 5}m`}
          label="Time"
        />
        <MetricCard
          icon={<GitBranch />}
          value={`${margin}%`}
          label="Margin"
        />
      </div>

      <div className={styles.cardContent}>
        <div className={styles.contentSection}>
          <h4>Ingredients</h4>
          <div className={styles.ingredientsPreview}>
            {variant.ingredients?.slice(0, 3).map((ing: any, idx: number) => (
              <span key={idx} className={styles.ingredientTag}>
                {ing.inventoryItem?.name || ing.name}
              </span>
            ))}
            {(variant.ingredients?.length || 0) > 3 && (
              <span className={styles.ingredientMore}>
                +{variant.ingredients.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className={styles.contentSection}>
          <h4>Relations</h4>
          {variant.parentId && (
            <div className={styles.relationItem}>
              <span className={styles.relationLabel}>Parent:</span>
              <span className={styles.relationValue}>{masterRecipe?.product?.name || 'Unknown'}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>
          Updated {formatDate(variant.updatedAt)}
        </span>
        <ChevronRight className={styles.cardArrow} />
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  value,
  label,
  trend,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon}>{icon}</div>
      <div className={styles.metricInfo}>
        <span className={styles.metricValue}>{value}</span>
        <span className={styles.metricLabel}>{label}</span>
      </div>
      {trend && (
        <div className={`${styles.metricTrend} ${styles[trend]}`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'neutral' && '→'}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}
