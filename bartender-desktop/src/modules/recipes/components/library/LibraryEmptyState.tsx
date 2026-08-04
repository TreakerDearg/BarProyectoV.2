import { memo } from 'react';
import styles from './LibraryEmptyState.module.css';

interface LibraryEmptyStateProps {
  onNewRecipe?: () => void;
  onImport?: () => void;
}

/**
 * LibraryEmptyState - Empty state con ilustración
 * Cuando no hay recetas en la biblioteca
 */
export const LibraryEmptyState = memo(function LibraryEmptyState({
  onNewRecipe,
  onImport,
}: LibraryEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIllustration}>
        <div className={styles.illustrationIcon}>📚</div>
        <div className={styles.illustrationDecor}>
          <span className={styles.decorItem}>🍸</span>
          <span className={styles.decorItem}>🍰</span>
          <span className={styles.decorItem}>🥃</span>
          <span className={styles.decorItem}>🍹</span>
        </div>
      </div>

      <h2 className={styles.emptyTitle}>Tu biblioteca está vacía</h2>
      <p className={styles.emptyDescription}>
        Comienza tu colección de recetas creando tu primera bebida o importando desde un archivo existente.
      </p>

      <div className={styles.emptyActions}>
        <button className={styles.primaryBtn} onClick={onNewRecipe}>
          <span className={styles.btnIcon}>✨</span>
          <span className={styles.btnLabel}>Crear primera receta</span>
        </button>
        <button className={styles.secondaryBtn} onClick={onImport}>
          <span className={styles.btnIcon}>📥</span>
          <span className={styles.btnLabel}>Importar recetas</span>
        </button>
      </div>

      <div className={styles.emptyTips}>
        <h4 className={styles.tipsTitle}>Tips para comenzar:</h4>
        <ul className={styles.tipsList}>
          <li className={styles.tipItem}>
            <span className={styles.tipIcon}>💡</span>
            <span className={styles.tipText}>Usa el Builder para crear recetas paso a paso</span>
          </li>
          <li className={styles.tipItem}>
            <span className={styles.tipIcon}>🏷️</span>
            <span className={styles.tipText}>Organiza tus recetas en colecciones</span>
          </li>
          <li className={styles.tipItem}>
            <span className={styles.tipIcon}>📊</span>
            <span className={styles.tipText}>Analiza costos y márgenes en tiempo real</span>
          </li>
          <li className={styles.tipItem}>
            <span className={styles.tipIcon}>🔄</span>
            <span className={styles.tipText}>Crea variantes y versiones de tus recetas</span>
          </li>
        </ul>
      </div>
    </div>
  );
});
