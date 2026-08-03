import React from 'react';
import { StudioCard } from './StudioCard';
import styles from './QuickActions.module.css';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color?: 'violet' | 'indigo' | 'cyan' | 'emerald' | 'amber' | 'pink';
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className={styles.quickActions}>
      {actions.map((action) => (
        <StudioCard
          key={action.id}
          className={`${styles.actionCard} ${action.color ? styles[action.color] : ''}`}
          hoverable
          clickable
          glow
          onClick={action.onClick}
        >
          <div className={styles.actionIcon}>{action.icon}</div>
          <div className={styles.actionContent}>
            <h3 className={styles.actionLabel}>{action.label}</h3>
            <p className={styles.actionDescription}>{action.description}</p>
          </div>
        </StudioCard>
      ))}
    </div>
  );
};
