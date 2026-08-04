import { useState, memo } from 'react';
import styles from './LibraryTopBar.module.css';

type ViewMode = 'gallery' | 'masonry' | 'compact' | 'grid' | 'list';
type SortMode = 'name' | 'date' | 'cost' | 'popularity' | 'health';

interface LibraryTopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  onNewRecipe?: () => void;
  onImport?: () => void;
  onExport?: () => void;
}

const quickFilters = [
  { id: 'cocktails', label: 'Cocktails' },
  { id: 'mocktails', label: 'Mocktails' },
  { id: 'shots', label: 'Shots' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'popular', label: 'Popular' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'recent', label: 'Recent' },
];

/**
 * LibraryTopBar - Barra superior estilo Spotify
 * Búsqueda, filtros rápidos, view toggle, sort, acciones
 */
export const LibraryTopBar = memo(function LibraryTopBar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortMode,
  onSortModeChange,
  onNewRecipe,
  onImport,
  onExport,
}: LibraryTopBarProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
  };

  const viewModes: { id: ViewMode; icon: string; label: string }[] = [
    { id: 'gallery', icon: '▦', label: 'Gallery' },
    { id: 'masonry', icon: '▤', label: 'Masonry' },
    { id: 'compact', icon: '▥', label: 'Compact' },
    { id: 'grid', icon: '▣', label: 'Grid' },
    { id: 'list', icon: '☰', label: 'List' },
  ];

  const sortModes: { id: SortMode; label: string }[] = [
    { id: 'name', label: 'Nombre' },
    { id: 'date', label: 'Fecha' },
    { id: 'cost', label: 'Costo' },
    { id: 'popularity', label: 'Popularidad' },
    { id: 'health', label: 'Health' },
  ];

  return (
    <div className={styles.libraryTopBar}>
      <div className={styles.topBarMain}>
        <div className={styles.topBarTitle}>
          <h1 className={styles.title}>Nebula Library</h1>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchIcon}>🔍</div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar recetas por nombre, ingredientes, tags, categorías..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className={styles.searchShortcuts}>
            <kbd className={styles.kbd}>Ctrl</kbd>
            <kbd className={styles.kbd}>K</kbd>
          </div>
        </div>

        <div className={styles.topBarActions}>
          <button className={styles.actionBtn} onClick={onNewRecipe}>
            <span className={styles.actionIcon}>+</span>
            <span className={styles.actionLabel}>Nueva</span>
          </button>
          <button className={styles.actionBtn} onClick={onImport}>
            <span className={styles.actionIcon}>📥</span>
            <span className={styles.actionLabel}>Importar</span>
          </button>
          <button className={styles.actionBtn} onClick={onExport}>
            <span className={styles.actionIcon}>📤</span>
            <span className={styles.actionLabel}>Exportar</span>
          </button>
        </div>
      </div>

      <div className={styles.quickFilters}>
        {quickFilters.map((filter) => (
          <button
            key={filter.id}
            className={`${styles.filterChip} ${activeFilter === filter.id ? styles.active : ''}`}
            onClick={() => handleFilterClick(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className={styles.topBarControls}>
        <div className={styles.viewToggle}>
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              className={`${styles.viewBtn} ${viewMode === mode.id ? styles.active : ''}`}
              onClick={() => onViewModeChange(mode.id)}
              title={mode.label}
            >
              {mode.icon}
            </button>
          ))}
        </div>

        <div className={styles.sortControl}>
          <select
            className={styles.sortSelect}
            value={sortMode}
            onChange={(e) => onSortModeChange(e.target.value as SortMode)}
          >
            {sortModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
});
