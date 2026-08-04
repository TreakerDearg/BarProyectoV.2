import { memo } from 'react';
import { Save, Copy, Bookmark, Eye, Rocket, ChevronRight, Star, Archive, AlertCircle, BookOpen, Wrench } from 'lucide-react';
import type { Recipe } from '../../types';
import styles from './BuilderHeader.module.css';

interface BuilderHeaderProps {
  recipe: Recipe;
  onSave?: () => void;
  isSaving?: boolean;
  saveError?: string | null;
  onPublish?: () => void;
  onDuplicate?: () => void;
  onVersions?: () => void;
  onPreview?: () => void;
}

/**
 * BuilderHeader - Header estilo Figma
 * Breadcrumbs, badges, acciones principales
 */
export const BuilderHeader = memo(function BuilderHeader({
  recipe,
  onSave,
  isSaving = false,
  saveError = null,
  onPublish,
  onDuplicate,
  onVersions,
  onPreview,
}: BuilderHeaderProps) {
  return (
    <div className={styles.builderHeader}>
      {/* Left Section */}
      <div className={styles.headerLeft}>
        <div className={styles.recipeInfo}>
          <div className={styles.recipeIcon}>
            {recipe.type === 'drink' ? '🍸' : '🍰'}
          </div>
          <div className={styles.recipeDetails}>
            <h1 className={styles.recipeName}>{recipe.product?.name || 'Nueva Receta'}</h1>
            <div className={styles.recipeMeta}>
              <span className={styles.recipeCategory}>{recipe.category}</span>
              {recipe.isExperimental && <span className={`${styles.badge} ${styles.experimental}`}><AlertCircle size={12} /> Experimental</span>}
              {recipe.isFavorite && <span className={`${styles.badge} ${styles.favorite}`}><Star size={12} /> Favorita</span>}
              {recipe.isArchived && <span className={`${styles.badge} ${styles.archived}`}><Archive size={12} /> Archivada</span>}
              {saveError && <span className={`${styles.badge} ${styles.error}`}><AlertCircle size={12} /> {saveError}</span>}
            </div>
          </div>
        </div>
      </div>
      {/* Center Section - Breadcrumbs */}
      <div className={styles.headerCenter}>
        <div className={styles.breadcrumbs}>
          <span className={styles.breadcrumbItem}>
            <BookOpen size={14} className={styles.breadcrumbIcon} />Library
          </span>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbItem}>
            <Wrench size={14} className={styles.breadcrumbIcon} />Builder
          </span>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <span className={`${styles.breadcrumbItem} ${styles.active}`}>
            {recipe.type === 'drink' ? '🍸' : '🍰'} {recipe.product?.name || 'Nueva Receta'}
          </span>
        </div>
      </div>
      {/* Right Section - Actions */}
      <div className={styles.headerRight}>
        <button 
          className={`${styles.headerBtn} ${isSaving ? styles.saving : ''}`} 
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className={styles.btnLabel}>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={16} className={styles.btnIcon} /><span className={styles.btnLabel}>Guardar</span>
            </>
          )}
        </button>
        <button className={styles.headerBtn} onClick={onDuplicate}>
          <Copy size={16} className={styles.btnIcon} /><span className={styles.btnLabel}>Duplicar</span>
        </button>
        <button className={styles.headerBtn} onClick={onVersions}>
          <Bookmark size={16} className={styles.btnIcon} /><span className={styles.btnLabel}>Versiones</span>
        </button>
        <button className={styles.headerBtn} onClick={onPreview}>
          <Eye size={16} className={styles.btnIcon} /><span className={styles.btnLabel}>Vista previa</span>
        </button>
        <button className={`${styles.headerBtn} ${styles.primary}`} onClick={onPublish}>
          <Rocket size={16} className={styles.btnIcon} /><span className={styles.btnLabel}>Publicar</span>
        </button>
      </div>
    </div>
  );
});
