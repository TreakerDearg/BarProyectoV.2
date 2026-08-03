import React from 'react';
import styles from './StudioHeader.module.css';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0-9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

interface StudioHeaderProps {
  onNewRecipe?: () => void;
  onImport?: () => void;
  onSearch?: (query: string) => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  onNewRecipe,
  onImport,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className={styles.studioHeader}>
      {/* Left Section */}
      <div className={styles.headerLeft}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>✨</div>
            <span className={styles.logoText}>Nebula</span>
          </div>
          <div className={styles.brandInfo}>
            <h1 className={styles.brandTitle}>Recipe Studio</h1>
            <p className={styles.brandSubtitle}>Workspace gastronómico inteligente</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.headerRight}>
        {/* Search */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            type="text"
            placeholder="Buscar recetas, colecciones, ingredientes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            className={`${styles.actionButton} ${styles.primary}`}
            onClick={onNewRecipe}
          >
            <span className={styles.buttonIcon}><PlusIcon /></span>
            <span>Nueva receta</span>
          </button>
          <button
            className={styles.actionButton}
            onClick={onImport}
          >
            <span className={styles.buttonIcon}><UploadIcon /></span>
            <span>Importar</span>
          </button>
          <button className={styles.actionButton} aria-label="Configuración">
            <span className={styles.buttonIcon}><SettingsIcon /></span>
          </button>
        </div>
      </div>
    </header>
  );
};
