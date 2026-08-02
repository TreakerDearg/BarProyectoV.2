import type { RecipeCollection } from '../../types';

interface GrimoireSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collections: RecipeCollection[];
  favoritesCount: number;
  variantsCount: number;
}

type SidebarSection = 'library' | 'collections' | 'favorites' | 'variants' | 'ingredients' | 'techniques' | 'decorations' | 'versions' | 'trash' | 'settings';

/**
 * GrimoireSidebar - Sidebar del Grimorio Digital
 * Navegación principal inspirada en Obsidian, Notion, Figma
 */
export function GrimoireSidebar({
  activeSection,
  onSectionChange,
  collections,
  favoritesCount,
  variantsCount,
}: GrimoireSidebarProps) {
  const sections: Array<{ id: SidebarSection; icon: string; label: string; count?: number }> = [
    { id: 'library', icon: '📚', label: 'Biblioteca' },
    { id: 'collections', icon: '📁', label: 'Colecciones', count: collections.length },
    { id: 'favorites', icon: '⭐', label: 'Favoritas', count: favoritesCount },
    { id: 'variants', icon: '🔀', label: 'Variantes', count: variantsCount },
    { id: 'ingredients', icon: '🥗', label: 'Ingredientes' },
    { id: 'techniques', icon: '🎯', label: 'Técnicas' },
    { id: 'decorations', icon: '✨', label: 'Decoraciones' },
    { id: 'versions', icon: '📜', label: 'Versiones' },
    { id: 'trash', icon: '🗑️', label: 'Papelera' },
    { id: 'settings', icon: '⚙️', label: 'Configuración' },
  ];

  return (
    <div className="grimorie-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Grimorio</h2>
        <span className="sidebar-subtitle">Digital Grimoire</span>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
          >
            <span className="sidebar-icon">{section.icon}</span>
            <span className="sidebar-label">{section.label}</span>
            {section.count !== undefined && (
              <span className="sidebar-count">{section.count}</span>
            )}
          </button>
        ))}
      </nav>

      {activeSection === 'collections' && (
        <div className="sidebar-collections">
          <h3 className="collections-title">Colecciones</h3>
          {collections.map((collection) => (
            <button
              key={collection._id}
              className="collection-item"
              onClick={() => onSectionChange(collection._id!)}
            >
              <span className="collection-icon">{collection.icon}</span>
              <span className="collection-name">{collection.name}</span>
              <span className="collection-count">{collection.recipeCount}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
