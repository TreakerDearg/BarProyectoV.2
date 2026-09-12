import { memo } from 'react';
import {
  Package, FlaskConical, Paintbrush2, Flower2,
  GitBranch, Folder,
} from 'lucide-react';
import styles from './BuilderNavigation.module.css';

type ExplorerTab = 'products' | 'ingredients' | 'techniques' | 'decorations' | 'variants' | 'collections';

interface BuilderNavigationProps {
  activeTab: ExplorerTab;
  onTabChange: (tab: ExplorerTab) => void;
  counts: Record<ExplorerTab, number | null>;
  loading: Record<ExplorerTab, boolean>;
  errors:  Record<ExplorerTab, boolean>;
}

const TABS: { id: ExplorerTab; icon: React.ElementType; label: string }[] = [
  { id: 'products',     icon: Package,      label: 'Productos'    },
  { id: 'ingredients',  icon: FlaskConical, label: 'Ingredientes' },
  { id: 'techniques',   icon: Paintbrush2,  label: 'Técnicas'     },
  { id: 'decorations',  icon: Flower2,      label: 'Decoraciones' },
  { id: 'variants',     icon: GitBranch,    label: 'Variantes'    },
  { id: 'collections',  icon: Folder,       label: 'Colecciones'  },
];

function CountBadge({ tab, counts, loading, errors }: {
  tab: ExplorerTab;
  counts: Record<ExplorerTab, number | null>;
  loading: Record<ExplorerTab, boolean>;
  errors:  Record<ExplorerTab, boolean>;
}) {
  if (loading[tab]) return <span className={styles.tabCount}>•</span>;
  if (errors[tab])  return <span className={styles.tabCount}>—</span>;
  const count = counts[tab];
  if (count === null) return <span className={styles.tabCount}>•</span>;
  return <span className={styles.tabCount}>{count}</span>;
}

export const BuilderNavigation = memo(function BuilderNavigation({
  activeTab, onTabChange, counts, loading, errors,
}: BuilderNavigationProps) {
  return (
    <div className={styles.builderNavigation}>
      <div className={styles.navigationHeader}>
        <h3 className={styles.navigationTitle}>Explorador</h3>
        <p className={styles.navigationSubtitle}>Elementos disponibles</p>
      </div>

      <div className={styles.navigationTabs}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            className={`${styles.navTab} ${activeTab === id ? styles.active : ''}`}
            onClick={() => onTabChange(id)}
          >
            <div className={styles.tabIcon}>
              <Icon size={14} />
            </div>
            <div className={styles.tabContent}>
              <span className={styles.tabLabel}>{label}</span>
            </div>
            <CountBadge tab={id} counts={counts} loading={loading} errors={errors} />
          </button>
        ))}
      </div>
    </div>
  );
});
