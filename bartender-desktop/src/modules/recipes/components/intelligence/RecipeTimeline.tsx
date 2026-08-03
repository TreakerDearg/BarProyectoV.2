import { useRecipeStudio } from '../../contexts/RecipeStudioContext';
import styles from './RecipeTimeline.module.css';

/**
 * RecipeTimeline - Timeline tipo Git
 * Consume el historial de versiones sin implementar un sistema paralelo
 * Muestra versiones, cambios, autor, fecha, colores por tipo
 */
export function RecipeTimeline() {
  const { versions } = useRecipeStudio();

  const getEventTypeClass = (type: string): string => {
    switch (type) {
      case 'created': return styles.created;
      case 'ingredient_added': return styles.ingredient;
      case 'ingredient_removed': return styles.ingredient;
      case 'cost_changed': return styles.cost;
      case 'variant_created': return styles.variant;
      case 'product_associated': return styles.product;
      case 'version_created': return styles.version;
      default: return styles.default;
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
    <div className={styles.recipeTimeline}>
      <h3 className={styles.timelineTitle}>Timeline</h3>
      {versions.length === 0 ? (
        <span className={styles.timelineEmpty}>Sin versiones</span>
      ) : (
        <div className={styles.timelineList}>
          {versions.map((version, index) => (
            <div key={version._id || index} className={styles.timelineItem}>
              <div className={styles.timelineMarker}>
                <span className={styles.timelineIcon}>{getEventIcon('version_created')}</span>
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineVersion}>{version.version}</span>
                  <span className={`${styles.timelineType} ${getEventTypeClass('version_created')}`}>
                    {getEventTypeLabel('version_created')}
                  </span>
                  <span className={styles.timelineDate}>{version.date}</span>
                </div>
                <div className={styles.timelineBody}>
                  <span className={styles.timelineAuthor}>{version.author}</span>
                  <span className={styles.timelineDescription}>{version.notes || version.description || 'Sin descripción'}</span>
                  {version.changes && version.changes.length > 0 && (
                    <div className={styles.timelineChanges}>
                      {version.changes.map((change: string, changeIndex: number) => (
                        <span key={changeIndex} className={styles.timelineChange}>
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
