import React from 'react';
import styles from './StudioHeader.module.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

const BranchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15"></line>
    <circle cx="18" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <path d="M18 9a9 9 0 0 1-9 9"></path>
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

interface StudioHeaderProps {
  recipeName?: string;
  status?: 'draft' | 'published' | 'archived';
  healthScore?: number;
  onSave?: () => void;
  onPublish?: () => void;
  onVersion?: () => void;
  onSearch?: (query: string) => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  recipeName = 'Untitled Recipe',
  status = 'draft',
  healthScore = 85,
  onSave,
  onPublish,
  onVersion,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'published': return 'var(--nebula-success)';
      case 'archived': return 'var(--nebula-text-tertiary)';
      default: return 'var(--nebula-warning)';
    }
  };

  const getHealthScoreColor = () => {
    if (healthScore >= 80) return 'var(--nebula-success)';
    if (healthScore >= 60) return 'var(--nebula-warning)';
    return 'var(--nebula-danger)';
  };

  return (
    <header className={styles.studioHeader}>
      {/* Logo and Breadcrumb */}
      <div className={styles.headerLeft}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>✨</div>
          <span className={styles.logoText}>Nebula</span>
        </div>
        
        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbItem}>Library</span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbItem}>Cocktails</span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbItemActive}>{recipeName}</span>
        </div>
      </div>

      {/* Recipe Info */}
      <div className={styles.headerCenter}>
        <div className={styles.recipeInfo}>
          <h1 className={styles.recipeName}>{recipeName}</h1>
          <div className={styles.recipeMeta}>
            <span 
              className={styles.status} 
              style={{ color: getStatusColor() }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className={styles.separator}>•</span>
            <span 
              className={styles.healthScore}
              style={{ color: getHealthScoreColor() }}
            >
              Health: {healthScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.headerRight}>
        {/* Search */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            type="text"
            placeholder="Quick search..."
            value={searchQuery}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button 
            className={styles.actionButton}
            onClick={onSave}
            title="Save"
          >
            <SaveIcon />
          </button>
          <button 
            className={styles.actionButton}
            onClick={onPublish}
            title="Publish"
          >
            <ShareIcon />
          </button>
          <button 
            className={styles.actionButton}
            onClick={onVersion}
            title="Versions"
          >
            <BranchIcon />
          </button>
          <button 
            className={styles.actionButton}
            title="More"
          >
            <MoreIcon />
          </button>
        </div>
      </div>
    </header>
  );
};
