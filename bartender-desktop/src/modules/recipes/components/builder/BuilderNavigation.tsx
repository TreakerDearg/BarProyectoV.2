import { memo } from 'react';
import { Package, UtensilsCrossed, Palette, Sparkles, GitBranch, Folder } from 'lucide-react';
import styles from './BuilderNavigation.module.css';

type ExplorerTab = 'products' | 'ingredients' | 'techniques' | 'decorations' | 'variants' | 'collections';

interface BuilderNavigationProps {
  activeTab: ExplorerTab;
  onTabChange: (tab: ExplorerTab) => void;
  counts: {
    products: number | null;
    ingredients: number | null;
    techniques: number | null;
    decorations: number | null;
    variants: number | null;
    collections: number | null;
  };
  loading: {
    products: boolean;
    ingredients: boolean;
    techniques: boolean;
    decorations: boolean;
    variants: boolean;
    collections: boolean;
  };
  errors: {
    products: boolean;
    ingredients: boolean;
    techniques: boolean;
    decorations: boolean;
    variants: boolean;
    collections: boolean;
  };
}

const tabs = [
  { id: 'products' as ExplorerTab, icon: Package, label: 'Productos' },
  { id: 'ingredients' as ExplorerTab, icon: UtensilsCrossed, label: 'Ingredientes' },
  { id: 'techniques' as ExplorerTab, icon: Palette, label: 'Técnicas' },
  { id: 'decorations' as ExplorerTab, icon: Sparkles, label: 'Decoraciones' },
  { id: 'variants' as ExplorerTab, icon: GitBranch, label: 'Variantes' },
  { id: 'collections' as ExplorerTab, icon: Folder, label: 'Colecciones' },
];

/**
 * BuilderNavigation - Sidebar de navegación del Explorer
 * Solo muestra los tabs con contadores, sin cards
 */
export const BuilderNavigation = memo(function BuilderNavigation({
  activeTab,
  onTabChange,
  counts,
  loading,
  errors,
}: BuilderNavigationProps) {
  const getCountDisplay = (tab: ExplorerTab) => {
    if (loading[tab]) return '•'; // Loading indicator
    if (errors[tab]) return '—'; // Error indicator
    const count = counts[tab];
    return count !== null ? count : '•';
  };

  return (
    <div className={styles.builderNavigation}>
      <div className={styles.navigationHeader}>
        <h3 className={styles.navigationTitle}>Explorador</h3>
        <p className={styles.navigationSubtitle}>Elementos disponibles</p>
      </div>

      <div className={styles.navigationTabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const countDisplay = getCountDisplay(tab.id);

          return (
            <button
              key={tab.id}
              className={`${styles.navTab} ${isActive ? styles.active : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={18} className={styles.navIcon} />
              <span className={styles.navLabel}>{tab.label}</span>
              <span className={`${styles.navCount} ${loading[tab.id] ? styles.loading : ''} ${errors[tab.id] ? styles.error : ''}`}>
                {countDisplay}
              </span>
              {isActive && <span className={styles.navIndicator} />}
            </button>
          );
        })}
      </div>
    </div>
  );
});
