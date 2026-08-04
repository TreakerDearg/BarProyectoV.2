import styles from './LibrarySkeletons.module.css';

/**
 * LibrarySkeletons - Skeleton loaders para Library components
 * PremiumRecipeCard, CollectionDashboardCard, KnowledgeNavigator, LibraryTopBar
 */

export function PremiumRecipeCardSkeleton({ isHero = false }: { isHero?: boolean }) {
  return (
    <div className={`${styles.skeletonCard} ${isHero ? styles.hero : ''}`}>
      <div className={styles.skeletonImage}>
        <div className={styles.shimmer} />
      </div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonHeader}>
          <div className={`${styles.skeletonLine} ${styles.title}`} />
          <div className={`${styles.skeletonLine} ${styles.category}`} />
        </div>
        <div className={styles.skeletonRating}>
          <div className={styles.skeletonStars} />
          <div className={`${styles.skeletonLine} ${styles.small}`} />
        </div>
        <div className={styles.skeletonQuickStats}>
          <div className={styles.skeletonStat} />
          <div className={styles.skeletonStat} />
          <div className={styles.skeletonStat} />
        </div>
        <div className={styles.skeletonMiniAnalytics}>
          <div className={styles.skeletonMiniStat} />
          <div className={styles.skeletonMiniStat} />
          <div className={styles.skeletonMiniStat} />
        </div>
        <div className={styles.skeletonIngredients}>
          <div className={`${styles.skeletonLine} ${styles.label}`} />
          <div className={styles.skeletonTags}>
            <div className={styles.skeletonTag} />
            <div className={styles.skeletonTag} />
            <div className={styles.skeletonTag} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className={styles.skeletonCollection}>
      <div className={styles.skeletonCollectionHeader}>
        <div className={styles.skeletonCollectionIcon} />
        <div className={styles.skeletonCollectionInfo}>
          <div className={`${styles.skeletonLine} ${styles.collectionTitle}`} />
          <div className={`${styles.skeletonLine} ${styles.collectionCount}`} />
        </div>
      </div>
      <div className={styles.skeletonCollectionStats}>
        <div className={styles.skeletonStatRow} />
        <div className={styles.skeletonStatRow} />
        <div className={styles.skeletonStatRow} />
      </div>
      <div className={styles.skeletonProgressBar}>
        <div className={styles.shimmer} />
      </div>
      <div className={`${styles.skeletonLine} ${styles.description}`} />
      <div className={styles.skeletonCollectionTags}>
        <div className={styles.skeletonTag} />
        <div className={styles.skeletonTag} />
      </div>
    </div>
  );
}

export function NavigatorSkeleton() {
  return (
    <div className={styles.skeletonNavigator}>
      <div className={styles.skeletonNavigatorHeader}>
        <div className={`${styles.skeletonLine} ${styles.navTitle}`} />
        <div className={styles.skeletonCollapseBtn} />
      </div>
      <div className={styles.skeletonNavigatorContent}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className={styles.skeletonNavSection}>
            <div className={styles.skeletonNavSectionHeader}>
              <div className={styles.skeletonNavIcon} />
              <div className={`${styles.skeletonLine} ${styles.navLabel}`} />
              <div className={styles.skeletonNavCount} />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.skeletonNavigatorFooter}>
        <div className={styles.skeletonFooterBtn} />
        <div className={styles.skeletonFooterBtn} />
      </div>
    </div>
  );
}

export function TopBarSkeleton() {
  return (
    <div className={styles.skeletonTopBar}>
      <div className={styles.skeletonTopBarMain}>
        <div className={styles.skeletonTopBarTitle}>
          <div className={`${styles.skeletonLine} ${styles.title}`} />
        </div>
        <div className={styles.skeletonSearch}>
          <div className={styles.skeletonSearchIcon} />
          <div className={`${styles.skeletonLine} ${styles.searchInput}`} />
        </div>
        <div className={styles.skeletonTopBarActions}>
          <div className={styles.skeletonActionBtn} />
          <div className={styles.skeletonActionBtn} />
          <div className={styles.skeletonActionBtn} />
        </div>
      </div>
      <div className={styles.skeletonQuickFilters}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className={styles.skeletonFilterChip} />
        ))}
      </div>
      <div className={styles.skeletonTopBarControls}>
        <div className={styles.skeletonViewToggle}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonViewBtn} />
          ))}
        </div>
        <div className={styles.skeletonSortSelect} />
      </div>
    </div>
  );
}

export function PreviewSkeleton() {
  return (
    <div className={styles.skeletonPreview}>
      <div className={styles.skeletonPreviewHeader}>
        <div className={`${styles.skeletonLine} ${styles.previewTitle}`} />
        <div className={styles.skeletonCloseBtn} />
      </div>
      <div className={styles.skeletonPreviewContent}>
        <div className={styles.skeletonPreviewImage}>
          <div className={styles.shimmer} />
        </div>
        <div className={styles.skeletonPreviewInfo}>
          <div className={`${styles.skeletonLine} ${styles.recipeName}`} />
          <div className={`${styles.skeletonLine} ${styles.recipeCategory}`} />
          <div className={`${styles.skeletonLine} ${styles.description}`} />
        </div>
        <div className={styles.skeletonPreviewStats}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonStatRow} />
          ))}
        </div>
        <div className={styles.skeletonPreviewSection}>
          <div className={`${styles.skeletonLine} ${styles.sectionTitle}`} />
          <div className={styles.skeletonIngredientsList}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonIngredientItem} />
            ))}
          </div>
        </div>
        <div className={styles.skeletonPreviewActions}>
          <div className={styles.skeletonActionBtn} />
          <div className={styles.skeletonActionBtn} />
        </div>
      </div>
    </div>
  );
}
