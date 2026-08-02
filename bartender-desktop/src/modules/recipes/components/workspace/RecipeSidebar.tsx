interface RecipeSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

/**
 * Componente Sidebar del Recipe Workspace
 * Permite navegación entre secciones de la receta
 * Preparado para evolucionar hacia el diseño Nebula Recipe Studio
 */
export function RecipeSidebar({ activeSection, onSectionChange }: RecipeSidebarProps) {
  const sections = [
    { id: 'info', label: 'Información General' },
    { id: 'ingredients', label: 'Ingredientes' },
    { id: 'preparation', label: 'Preparación' },
    { id: 'costs', label: 'Costos' },
    { id: 'preview', label: 'Vista Previa' },
  ];

  return (
    <div className="recipe-sidebar">
      <div className="recipe-sidebar-content">
        <h3 className="sidebar-title">Secciones</h3>
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
