import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  variant?: 'text' | 'circle' | 'rect' | 'card' | 'list';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

/**
 * SkeletonLoader - Componente de carga visual
 * Muestra placeholders animados mientras se cargan los datos
 */
export function SkeletonLoader({
  variant = 'rect',
  width,
  height,
  count = 1,
  className,
}: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${styles.skeleton} ${styles[variant]} ${className || ''}`}
      style={{ width, height }}
    />
  ));

  return <div className={styles.skeletonWrapper}>{skeletons}</div>;
}

/**
 * RecipeSkeleton - Skeleton específico para tarjetas de recetas
 */
export function RecipeSkeleton() {
  return (
    <div className={styles.recipeSkeleton}>
      <SkeletonLoader variant="rect" width="100%" height="120px" className={styles.recipeImage} />
      <div className={styles.recipeContent}>
        <SkeletonLoader variant="text" width="70%" height="20px" />
        <SkeletonLoader variant="text" width="40%" height="16px" />
        <div className={styles.recipeStats}>
          <SkeletonLoader variant="text" width="30%" height="14px" />
          <SkeletonLoader variant="text" width="30%" height="14px" />
        </div>
      </div>
    </div>
  );
}

/**
 * LibrarySkeleton - Skeleton para la vista de biblioteca
 */
export function LibrarySkeleton() {
  return (
    <div className={styles.librarySkeleton}>
      <SkeletonLoader variant="rect" width="200px" height="32px" className={styles.libraryHeader} />
      <div className={styles.libraryGrid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <RecipeSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * ChartSkeleton - Skeleton para gráficos
 */
export function ChartSkeleton() {
  return (
    <div className={styles.chartSkeleton}>
      <SkeletonLoader variant="rect" width="100%" height="24px" className={styles.chartTitle} />
      <SkeletonLoader variant="rect" width="100%" height="200px" className={styles.chartArea} />
    </div>
  );
}

/**
 * InspectorSkeleton - Skeleton para el panel inspector
 */
export function InspectorSkeleton() {
  return (
    <div className={styles.inspectorSkeleton}>
      <div className={styles.inspectorSection}>
        <SkeletonLoader variant="text" width="80px" height="18px" />
        <SkeletonLoader variant="rect" width="100%" height="60px" />
      </div>
      <div className={styles.inspectorSection}>
        <SkeletonLoader variant="text" width="80px" height="18px" />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonLoader key={i} variant="rect" width="100%" height="40px" />
        ))}
      </div>
      <div className={styles.inspectorSection}>
        <SkeletonLoader variant="text" width="80px" height="18px" />
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonLoader key={i} variant="rect" width="100%" height="32px" />
        ))}
      </div>
    </div>
  );
}

/**
 * IngredientSkeleton - Skeleton para tarjetas de ingredientes
 */
export function IngredientSkeleton() {
  return (
    <div className={styles.ingredientSkeleton}>
      <SkeletonLoader variant="circle" width="40px" height="40px" />
      <div className={styles.ingredientContent}>
        <SkeletonLoader variant="text" width="60%" height="16px" />
        <SkeletonLoader variant="text" width="40%" height="14px" />
      </div>
    </div>
  );
}

/**
 * PreviewSkeleton - Skeleton para vista previa
 */
export function PreviewSkeleton() {
  return (
    <div className={styles.previewSkeleton}>
      <SkeletonLoader variant="rect" width="100%" height="200px" className={styles.previewImage} />
      <div className={styles.previewContent}>
        <SkeletonLoader variant="text" width="60%" height="24px" />
        <SkeletonLoader variant="text" width="100%" height="16px" />
        <SkeletonLoader variant="text" width="100%" height="16px" />
        <SkeletonLoader variant="text" width="80%" height="16px" />
      </div>
    </div>
  );
}
