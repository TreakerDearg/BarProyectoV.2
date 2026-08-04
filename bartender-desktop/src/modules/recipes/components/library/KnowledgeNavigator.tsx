import { useState, memo } from 'react';
import type { RecipeCollection } from '../../types';
import styles from './KnowledgeNavigator.module.css';

interface KnowledgeNavigatorProps {
  collections: RecipeCollection[];
  favoritesCount: number;
  variantsCount: number;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface NavSection {
  id: string;
  icon: string;
  label: string;
  count?: number;
  subsections?: Array<{ id: string; label: string; count?: number }>;
}

/**
 * KnowledgeNavigator - Sidebar estilo accordion
 * Knowledge Navigator moderno para explorar recetas
 */
export const KnowledgeNavigator = memo(function KnowledgeNavigator({
  collections,
  favoritesCount,
  variantsCount,
  activeSection,
  onSectionChange,
}: KnowledgeNavigatorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['library', 'collections']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const navSections: NavSection[] = [
    {
      id: 'library',
      icon: '📚',
      label: 'Library',
      subsections: [
        { id: 'all', label: 'Todas' },
        { id: 'favorites', label: 'Favoritas', count: favoritesCount },
        { id: 'recent', label: 'Recientes' },
        { id: 'popular', label: 'Populares' },
      ],
    },
    {
      id: 'collections',
      icon: '📁',
      label: 'Collections',
      subsections: collections.map(c => ({ id: c._id || '', label: c.name, count: c.recipeCount })),
    },
    {
      id: 'categories',
      icon: '🏷️',
      label: 'Categories',
      subsections: [
        { id: 'cocktails', label: 'Cocktails' },
        { id: 'mocktails', label: 'Mocktails' },
        { id: 'shots', label: 'Shots' },
        { id: 'coffee', label: 'Coffee' },
        { id: 'kitchen', label: 'Kitchen' },
        { id: 'desserts', label: 'Desserts' },
      ],
    },
    {
      id: 'tags',
      icon: '🏷️',
      label: 'Tags',
      subsections: [
        { id: 'summer', label: 'Summer' },
        { id: 'sweet', label: 'Sweet' },
        { id: 'iba', label: 'IBA' },
        { id: 'classic', label: 'Classic' },
        { id: 'citrus', label: 'Citrus' },
        { id: 'refreshing', label: 'Refreshing' },
      ],
    },
    {
      id: 'authors',
      icon: '✍️',
      label: 'Authors',
    },
    {
      id: 'difficulty',
      icon: '📊',
      label: 'Difficulty',
      subsections: [
        { id: 'easy', label: 'Easy' },
        { id: 'medium', label: 'Medium' },
        { id: 'hard', label: 'Hard' },
      ],
    },
    {
      id: 'ingredients',
      icon: '🥗',
      label: 'Ingredients',
    },
    {
      id: 'techniques',
      icon: '🎯',
      label: 'Techniques',
      subsections: [
        { id: 'shake', label: 'Shake' },
        { id: 'stir', label: 'Stir' },
        { id: 'muddle', label: 'Muddle' },
        { id: 'build', label: 'Build' },
      ],
    },
    {
      id: 'decorations',
      icon: '✨',
      label: 'Decorations',
    },
    {
      id: 'glassware',
      icon: '🥃',
      label: 'Glassware',
    },
    {
      id: 'variants',
      icon: '🔀',
      label: 'Variants',
      count: variantsCount,
    },
    {
      id: 'trash',
      icon: '🗑️',
      label: 'Trash',
    },
  ];

  return (
    <div className={styles.knowledgeNavigator}>
      <div className={styles.navigatorHeader}>
        <h2 className={styles.navigatorTitle}>Navigator</h2>
        <button className={styles.collapseBtn}>◀</button>
      </div>

      <div className={styles.navigatorContent}>
        {navSections.map((section) => (
          <div key={section.id} className={styles.navSection}>
            <button
              className={`${styles.navSectionHeader} ${activeSection === section.id ? styles.active : ''}`}
              onClick={() => {
                if (section.subsections) {
                  toggleSection(section.id);
                } else {
                  onSectionChange(section.id);
                }
              }}
            >
              <span className={styles.navIcon}>{section.icon}</span>
              <span className={styles.navLabel}>{section.label}</span>
              {section.count !== undefined && (
                <span className={styles.navCount}>{section.count}</span>
              )}
              {section.subsections && (
                <span className={`${styles.chevron} ${expandedSections.has(section.id) ? styles.open : ''}`}>
                  ▼
                </span>
              )}
            </button>

            {section.subsections && expandedSections.has(section.id) && (
              <div className={styles.navSubsections}>
                {section.subsections.map((subsection) => (
                  <button
                    key={subsection.id}
                    className={`${styles.navSubsection} ${activeSection === subsection.id ? styles.active : ''}`}
                    onClick={() => onSectionChange(subsection.id)}
                  >
                    <span className={styles.subsectionLabel}>{subsection.label}</span>
                    {subsection.count !== undefined && (
                      <span className={styles.subsectionCount}>{subsection.count}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.navigatorFooter}>
        <button className={styles.footerBtn}>+ New Collection</button>
        <button className={styles.footerBtn}>Settings</button>
      </div>
    </div>
  );
});
