import React from 'react';
import { StudioCard } from './StudioCard';
import styles from './WarningPanel.module.css';

interface Warning {
  id: string;
  type: 'low-stock' | 'no-image' | 'low-margin' | 'no-recipe';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
}

interface WarningPanelProps {
  warnings: Warning[];
  onWarningClick?: (warning: Warning) => void;
}

export const WarningPanel: React.FC<WarningPanelProps> = ({ warnings, onWarningClick }) => {
  const getSeverityColor = (severity: string) => {
    const colors = {
      high: '#f87171',
      medium: '#fbbf24',
      low: '#60a5fa',
    };
    return colors[severity as keyof typeof colors] || '#fbbf24';
  };

  return (
    <div className={styles.warningPanel}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Advertencias</h2>
        <span className={styles.warningCount}>{warnings.length}</span>
      </div>
      <div className={styles.warningGrid}>
        {warnings.map((warning) => (
          <StudioCard
            key={warning.id}
            className={`${styles.warningCard} ${styles[warning.severity]}`}
            variant="warning"
            hoverable
            clickable
            onClick={() => onWarningClick?.(warning)}
          >
            <div
              className={styles.warningIcon}
              style={{ color: getSeverityColor(warning.severity) }}
            >
              {warning.icon}
            </div>
            <div className={styles.warningContent}>
              <h3 className={styles.warningTitle}>{warning.title}</h3>
              <p className={styles.warningDescription}>{warning.description}</p>
            </div>
            <div
              className={styles.severityIndicator}
              style={{ backgroundColor: getSeverityColor(warning.severity) }}
            />
          </StudioCard>
        ))}
      </div>
    </div>
  );
};
