import React from 'react';
import { StudioCard } from './StudioCard';
import styles from './RecipeStats.module.css';

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'violet' | 'indigo' | 'cyan' | 'emerald' | 'amber' | 'pink';
}

interface RecipeStatsProps {
  stats: StatItem[];
}

export const RecipeStats: React.FC<RecipeStatsProps> = ({ stats }) => {
  return (
    <div className={styles.recipeStats}>
      <div className={styles.statsHeader}>
        <h2 className={styles.statsTitle}>Resumen</h2>
      </div>
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <StudioCard
            key={stat.id}
            className={`${styles.statCard} ${stat.color ? styles[stat.color] : ''}`}
            variant="stat"
            hoverable
          >
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>{stat.label}</p>
              <h3 className={styles.statValue}>{stat.value}</h3>
              {stat.trend && (
                <div className={`${styles.statTrend} ${styles[stat.trend.direction]}`}>
                  {stat.trend.direction === 'up' && '↑'}
                  {stat.trend.direction === 'down' && '↓'}
                  {stat.trend.direction === 'neutral' && '→'}
                  <span>{Math.abs(stat.trend.value)}%</span>
                </div>
              )}
            </div>
          </StudioCard>
        ))}
      </div>
    </div>
  );
};
