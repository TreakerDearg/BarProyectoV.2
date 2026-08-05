import React from 'react';
import { StudioCard } from './StudioCard';
import styles from './ActivityTimeline.module.css';

interface ActivityItem {
  id: string;
  type: 'recipe-created' | 'cost-updated' | 'ingredient-added' | 'variant-created' | 'version-published';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getActivityColor = (type: string) => {
    const colors = {
      'recipe-created': '#8b5cf6',
      'cost-updated': '#6366f1',
      'ingredient-added': '#06b6d4',
      'variant-created': '#ec4899',
      'version-published': '#10b981',
    };
    return colors[type as keyof typeof colors] || '#8b5cf6';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={styles.activityTimeline}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Actividad Reciente</h2>
        <button className={styles.viewAll}>Ver todo →</button>
      </div>
      <div className={styles.timeline}>
        {Array.isArray(activities) && activities.map((activity) => (
          <div key={activity.id} className={styles.timelineItem}>
            <div className={styles.timelineLine} />
            <div
              className={styles.timelineDot}
              style={{ backgroundColor: getActivityColor(activity.type) }}
            />
            <StudioCard className={styles.activityCard} hoverable clickable>
              <div className={styles.activityIcon}>{activity.icon}</div>
              <div className={styles.activityContent}>
                <h3 className={styles.activityTitle}>{activity.title}</h3>
                <p className={styles.activityDescription}>{activity.description}</p>
                <span className={styles.activityTimestamp}>
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            </StudioCard>
          </div>
        ))}
      </div>
    </div>
  );
};
