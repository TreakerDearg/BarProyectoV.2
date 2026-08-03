import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: 'recipes' | 'collections' | 'activity' | 'default';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  illustration = 'default',
}) => {
  const getIllustration = () => {
    switch (illustration) {
      case 'recipes':
        return (
          <div className={styles.illustration}>
            <div className={styles.illustrationIcon}>🍸</div>
            <div className={styles.illustrationDecor}>
              <span className={styles.decorItem}>✨</span>
              <span className={styles.decorItem}>📚</span>
              <span className={styles.decorItem}>🎨</span>
            </div>
          </div>
        );
      case 'collections':
        return (
          <div className={styles.illustration}>
            <div className={styles.illustrationIcon}>📁</div>
            <div className={styles.illustrationDecor}>
              <span className={styles.decorItem}>📂</span>
              <span className={styles.decorItem}>📋</span>
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className={styles.illustration}>
            <div className={styles.illustrationIcon}>📊</div>
            <div className={styles.illustrationDecor}>
              <span className={styles.decorItem}>⏱️</span>
              <span className={styles.decorItem}>📈</span>
            </div>
          </div>
        );
      default:
        return (
          <div className={styles.illustration}>
            <div className={styles.illustrationIcon}>{icon || '✨'}</div>
          </div>
        );
    }
  };

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateContent}>
        {getIllustration()}
        <h2 className={styles.emptyStateTitle}>{title}</h2>
        <p className={styles.emptyStateDescription}>{description}</p>
        {actionLabel && onAction && (
          <button className={styles.emptyStateAction} onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
