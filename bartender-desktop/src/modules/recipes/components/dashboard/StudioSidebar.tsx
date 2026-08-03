import React from 'react';
import { StudioCard } from './StudioCard';
import styles from './StudioSidebar.module.css';

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  status?: 'active' | 'coming-soon' | 'beta';
  count?: number;
  onClick: () => void;
}

interface StudioSidebarProps {
  items: SidebarItem[];
  activeItem?: string;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({ items, activeItem }) => {
  return (
    <aside className={styles.studioSidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Navegación</h2>
      </div>
      <nav className={styles.sidebarNav}>
        {items.map((item) => (
          <StudioCard
            key={item.id}
            className={`${styles.sidebarItem} ${activeItem === item.id ? styles.active : ''}`}
            hoverable
            clickable
            onClick={item.onClick}
          >
            <div className={styles.itemIcon}>{item.icon}</div>
            <div className={styles.itemContent}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemLabel}>{item.label}</h3>
                {item.status && (
                  <span className={`${styles.itemStatus} ${styles[item.status]}`}>
                    {item.status === 'coming-soon' && 'Próximamente'}
                    {item.status === 'beta' && 'Beta'}
                  </span>
                )}
              </div>
              <p className={styles.itemDescription}>{item.description}</p>
              {item.count !== undefined && item.count > 0 && (
                <span className={styles.itemCount}>{item.count}</span>
              )}
            </div>
            {activeItem === item.id && (
              <div className={styles.activeIndicator} />
            )}
          </StudioCard>
        ))}
      </nav>
    </aside>
  );
};
