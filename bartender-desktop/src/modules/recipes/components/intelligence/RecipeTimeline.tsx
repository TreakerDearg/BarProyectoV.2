import { useRecipeStudio } from '../../contexts/RecipeStudioContext';

/**
 * RecipeTimeline - Timeline tipo Git
 * Consume el historial de versiones sin implementar un sistema paralelo
 * Muestra versiones, cambios, autor, fecha, colores por tipo
 */
export function RecipeTimeline() {
  const { versions } = useRecipeStudio();

  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case 'created': return 'created';
      case 'ingredient_added': return 'ingredient';
      case 'ingredient_removed': return 'ingredient';
      case 'cost_changed': return 'cost';
      case 'variant_created': return 'variant';
      case 'product_associated': return 'product';
      case 'version_created': return 'version';
      default: return 'default';
    }
  };

  const getEventIcon = (type: string): string => {
    switch (type) {
      case 'created': return '🎉';
      case 'ingredient_added': return '➕';
      case 'ingredient_removed': return '➖';
      case 'cost_changed': return '💰';
      case 'variant_created': return '🔄';
      case 'product_associated': return '📦';
      case 'version_created': return '🔖';
      default: return '📝';
    }
  };

  const getEventTypeLabel = (type: string): string => {
    switch (type) {
      case 'created': return 'Creada';
      case 'ingredient_added': return 'Ingrediente añadido';
      case 'ingredient_removed': return 'Ingrediente eliminado';
      case 'cost_changed': return 'Cambio de costo';
      case 'variant_created': return 'Variante creada';
      case 'product_associated': return 'Producto asociado';
      case 'version_created': return 'Versión creada';
      default: return 'Edición';
    }
  };

  return (
    <div className="recipe-timeline">
      <h3 className="timeline-title">Timeline</h3>
      {versions.length === 0 ? (
        <span className="timeline-empty">Sin versiones</span>
      ) : (
        <div className="timeline-list">
          {versions.map((version, index) => (
            <div key={version._id || index} className="timeline-item">
              <div className="timeline-marker">
                <span className="timeline-icon">{getEventIcon('version_created')}</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-version">{version.version}</span>
                  <span className={`timeline-type ${getEventTypeColor('version_created')}`}>
                    {getEventTypeLabel('version_created')}
                  </span>
                  <span className="timeline-date">{version.date}</span>
                </div>
                <div className="timeline-body">
                  <span className="timeline-author">{version.author}</span>
                  <span className="timeline-description">{version.notes || version.description || 'Sin descripción'}</span>
                  {version.changes && version.changes.length > 0 && (
                    <div className="timeline-changes">
                      {version.changes.map((change: string, changeIndex: number) => (
                        <span key={changeIndex} className="timeline-change">
                          {change}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
