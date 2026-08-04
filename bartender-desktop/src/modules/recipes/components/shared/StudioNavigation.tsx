import { memo } from 'react';
import { Home, BookOpen, Wrench, Clapperboard, GitBranch, Palette, Sparkles, Folder, BarChart3, Calendar, AlertTriangle, Lightbulb, Bookmark, Trash2 } from 'lucide-react';
import styles from './StudioNavigation.module.css';

type StudioMode = 'dashboard' | 'library' | 'builder' | 'studio' | 'variants' | 'techniques' | 'decorations' | 'collections' | 'analytics' | 'timeline' | 'versions' | 'warnings' | 'suggestions' | 'trash';

interface StudioNavigationProps {
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  navigationHistory: StudioMode[];
  onBack?: () => void;
}

/**
 * StudioNavigation - Sistema de navegación compartido
 * Barra de navegación principal que aparece en todas las páginas del Recipe Studio
 */
export const StudioNavigation = memo(function StudioNavigation({
  mode,
  onModeChange,
  navigationHistory,
  onBack,
}: StudioNavigationProps) {
  const navItems = [
    { id: 'dashboard' as StudioMode, icon: Home, label: 'Dashboard' },
    { id: 'library' as StudioMode, icon: BookOpen, label: 'Library' },
    { id: 'builder' as StudioMode, icon: Wrench, label: 'Builder' },
    { id: 'studio' as StudioMode, icon: Clapperboard, label: 'Studio' },
    { id: 'variants' as StudioMode, icon: GitBranch, label: 'Variants' },
    { id: 'techniques' as StudioMode, icon: Palette, label: 'Techniques' },
    { id: 'decorations' as StudioMode, icon: Sparkles, label: 'Decorations' },
    { id: 'collections' as StudioMode, icon: Folder, label: 'Collections' },
    { id: 'analytics' as StudioMode, icon: BarChart3, label: 'Analytics' },
    { id: 'timeline' as StudioMode, icon: Calendar, label: 'Timeline' },
    { id: 'warnings' as StudioMode, icon: AlertTriangle, label: 'Warnings' },
    { id: 'suggestions' as StudioMode, icon: Lightbulb, label: 'Suggestions' },
    { id: 'versions' as StudioMode, icon: Bookmark, label: 'Versions' },
    { id: 'trash' as StudioMode, icon: Trash2, label: 'Trash' },
  ];

  const getLabelForMode = (m: StudioMode) => {
    return navItems.find(item => item.id === m)?.label || m;
  };

  const getIconForMode = (m: StudioMode) => {
    return navItems.find(item => item.id === m)?.icon || BookOpen;
  };

  return (
    <div className={styles.studioNavigation}>
      <div className={styles.navigationContent}>
        <div className={styles.navBar}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`${styles.navBtn} ${mode === item.id ? styles.active : ''}`}
                onClick={() => onModeChange(item.id)}
                title={item.label}
              >
                <Icon className={styles.navBtnIcon} />
                <span className={styles.navBtnLabel}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {onBack && navigationHistory.length > 1 && (
          <button className={styles.backBtn} onClick={onBack}>
            <span className={styles.backIcon}>←</span>
            <span className={styles.backLabel}>Volver</span>
          </button>
        )}
      </div>
    </div>
  );
});
