import React from 'react';
import styles from './Explorer.module.css';

interface ExplorerSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  count?: number;
  badge?: number;
  active?: boolean;
}

interface ExplorerProps {
  sections: ExplorerSection[];
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

const LibraryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const VariantsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h20"></path>
    <path d="M2 12l5-5"></path>
    <path d="M2 12l5 5"></path>
    <path d="M22 12l-5-5"></path>
    <path d="M22 12l-5 5"></path>
  </svg>
);

const IngredientsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20"></path>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const TechniquesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 6v6l4 2"></path>
  </svg>
);

const DecorationsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
  </svg>
);

const CollectionsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18v18H3z"></path>
    <path d="M3 9h18"></path>
    <path d="M9 21V9"></path>
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const TimelineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export const Explorer: React.FC<ExplorerProps> = ({
  sections = [
    { id: 'library', name: 'Library', icon: <LibraryIcon />, count: 24 },
    { id: 'variants', name: 'Variants', icon: <VariantsIcon />, count: 8 },
    { id: 'ingredients', name: 'Ingredients', icon: <IngredientsIcon />, count: 156 },
    { id: 'techniques', name: 'Techniques', icon: <TechniquesIcon />, count: 12 },
    { id: 'decorations', name: 'Decorations', icon: <DecorationsIcon />, count: 24 },
    { id: 'collections', name: 'Collections', icon: <CollectionsIcon />, count: 5 },
    { id: 'analytics', name: 'Analytics', icon: <AnalyticsIcon />, count: 0 },
    { id: 'timeline', name: 'Timeline', icon: <TimelineIcon />, count: 0 },
    { id: 'trash', name: 'Trash', icon: <TrashIcon />, count: 3, badge: 3 },
  ],
  activeSection = 'library',
  onSectionClick,
}) => {
  return (
    <div className={styles.explorer}>
      <div className={styles.explorerHeader}>
        <h2 className={styles.explorerTitle}>Explorer</h2>
      </div>
      
      <div className={styles.explorerSections}>
        {sections.map((section) => (
          <button
            key={section.id}
            className={`${styles.explorerSection} ${activeSection === section.id ? styles.active : ''}`}
            onClick={() => onSectionClick?.(section.id)}
          >
            <span className={styles.sectionIcon}>{section.icon}</span>
            <span className={styles.sectionName}>{section.name}</span>
            {section.count !== undefined && section.count > 0 && (
              <span className={styles.sectionCount}>{section.count}</span>
            )}
            {section.badge && section.badge > 0 && (
              <span className={styles.sectionBadge}>{section.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
