import { memo } from 'react';
import {
  Save, Copy, ChevronRight, Star, Archive, AlertCircle,
  BookOpen, Wrench, GlassWater, ChefHat, Loader2,
} from 'lucide-react';
import type { Recipe } from '../../types';
import styles from './BuilderHeader.module.css';

interface BuilderHeaderProps {
  recipe: Recipe | null | undefined;
  onSave?: () => void;
  isSaving?: boolean;
  saveError?: string | null;
  onPublish?: () => void;
  onDuplicate?: () => void;
  onVersions?: () => void;
  onPreview?: () => void;
}

export const BuilderHeader = memo(function BuilderHeader({
  recipe,
  onSave,
  isSaving = false,
  saveError = null,
  onDuplicate,
}: BuilderHeaderProps) {
  const isDrink = recipe?.type !== 'food';
  const TypeIcon = isDrink ? GlassWater : ChefHat;

  return (
    <div className={styles.builderHeader}>
      {/* ── Left: nombre + meta ─────────────────────────────── */}
      <div className={styles.headerLeft}>
        <div className={styles.recipeInfo}>
          <div className={styles.recipeIcon}>
            <TypeIcon size={16} />
          </div>
          <div className={styles.recipeDetails}>
            <h1 className={styles.recipeName}>
              {recipe?.product?.name || 'Nueva Receta'}
            </h1>
            <div className={styles.recipeMeta}>
              {recipe?.category && (
                <span className={styles.recipeCategory}>{recipe.category}</span>
              )}
              {recipe?.isFavorite && (
                <span className={`${styles.badge} ${styles.favorite}`}>
                  <Star size={9} /> Favorita
                </span>
              )}
              {recipe?.isActive === false && (
                <span className={`${styles.badge} ${styles.archived}`}>
                  <Archive size={9} /> Inactiva
                </span>
              )}
              {saveError && (
                <span className={`${styles.badge} ${styles.error}`}>
                  <AlertCircle size={9} /> {saveError}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Center: breadcrumbs ──────────────────────────────── */}
      <div className={styles.headerCenter}>
        <div className={styles.breadcrumbs}>
          <span className={styles.breadcrumbItem}>
            <BookOpen size={12} className={styles.breadcrumbIcon} />
            Biblioteca
          </span>
          <ChevronRight size={12} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbItem}>
            <Wrench size={12} className={styles.breadcrumbIcon} />
            Constructor
          </span>
          <ChevronRight size={12} className={styles.breadcrumbSeparator} />
          <span className={`${styles.breadcrumbItem} ${styles.active}`}>
            <TypeIcon size={12} className={styles.breadcrumbIcon} />
            {recipe?.product?.name || 'Nueva Receta'}
          </span>
        </div>
      </div>

      {/* ── Right: acciones ──────────────────────────────────── */}
      <div className={styles.headerRight}>
        {onDuplicate && (
          <button
            type="button"
            className={styles.headerBtn}
            onClick={onDuplicate}
            title="Duplicar receta"
          >
            <Copy size={14} className={styles.btnIcon} />
            <span className={styles.btnLabel}>Duplicar</span>
          </button>
        )}

        <button
          type="button"
          className={`${styles.headerBtn} ${styles.primary} ${isSaving ? styles.saving : ''}`}
          onClick={onSave}
          disabled={isSaving}
          title="Guardar receta"
        >
          {isSaving
            ? <><Loader2 size={14} className={`${styles.btnIcon} animate-spin`} /><span className={styles.btnLabel}>Guardando…</span></>
            : <><Save    size={14} className={styles.btnIcon} /><span className={styles.btnLabel}>Guardar</span></>
          }
        </button>
      </div>
    </div>
  );
});
