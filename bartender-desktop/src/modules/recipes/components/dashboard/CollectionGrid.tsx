import React from 'react';
import { StudioCard } from './StudioCard';
import styles from './CollectionGrid.module.css';

interface Collection {
  id: string;
  name: string;
  description: string;
  image?: string;
  recipeCount: number;
  color?: 'violet' | 'indigo' | 'cyan' | 'emerald' | 'amber' | 'pink' | 'rose' | 'orange';
}

interface CollectionGridProps {
  collections: Collection[];
  onCollectionClick?: (collection: Collection) => void;
}

export const CollectionGrid: React.FC<CollectionGridProps> = ({ collections, onCollectionClick }) => {
  const getColorGradient = (color?: string) => {
    const gradients = {
      violet: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 100%)',
      indigo: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.1) 100%)',
      cyan: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.1) 100%)',
      emerald: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%)',
      amber: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)',
      pink: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 100%)',
      rose: 'linear-gradient(135deg, rgba(244, 63, 94, 0.3) 0%, rgba(244, 63, 94, 0.1) 100%)',
      orange: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(249, 115, 22, 0.1) 100%)',
    };
    return gradients[color as keyof typeof gradients] || gradients.violet;
  };

  return (
    <div className={styles.collectionGrid}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Colecciones</h2>
        <button className={styles.viewAll}>Ver todas →</button>
      </div>
      <div className={styles.grid}>
        {Array.isArray(collections) && collections.map((collection) => (
          <StudioCard
            key={collection.id}
            className={`${styles.collectionCard} ${collection.color ? styles[collection.color] : ''}`}
            variant="collection"
            hoverable
            clickable
            onClick={() => onCollectionClick?.(collection)}
          >
            <div
              className={styles.collectionCover}
              style={{
                background: collection.image
                  ? `url(${collection.image}) center/cover`
                  : getColorGradient(collection.color),
              }}
            >
              {!collection.image && (
                <div className={styles.collectionIcon}>
                  <span className={styles.iconEmoji}>📚</span>
                </div>
              )}
              <div className={styles.collectionBadge}>
                <span className={styles.badgeCount}>{collection.recipeCount}</span>
                <span className={styles.badgeLabel}>recetas</span>
              </div>
            </div>
            <div className={styles.collectionContent}>
              <h3 className={styles.collectionName}>{collection.name}</h3>
              <p className={styles.collectionDescription}>{collection.description}</p>
            </div>
          </StudioCard>
        ))}
      </div>
    </div>
  );
};
