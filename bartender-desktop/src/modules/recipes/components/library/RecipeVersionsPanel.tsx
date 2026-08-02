import type { Recipe, RecipeVersion } from '../../types';
import { useRecipeVersions } from '../../hooks';

interface RecipeVersionsPanelProps {
  recipe: Recipe;
  onVersionCreate?: (version: RecipeVersion) => void;
}

/**
 * RecipeVersionsPanel - Panel de versiones e historial
 * Muestra línea temporal de cambios y versión actual
 */
export function RecipeVersionsPanel({ recipe, onVersionCreate }: RecipeVersionsPanelProps) {
  const { currentVersion, versionHistory, history, createVersion } = useRecipeVersions({ recipe });

  const handleCreateVersion = () => {
    const changes = ['Versión creada manualmente'];
    const newVersion = createVersion(changes, 'Creada desde panel de versiones');
    onVersionCreate?.(newVersion);
  };

  return (
    <div className="recipe-versions-panel">
      <div className="versions-header">
        <h3 className="versions-title">Versiones</h3>
        <button onClick={handleCreateVersion} className="btn-create-version">
          + Nueva Versión
        </button>
      </div>

      {/* Versión Actual */}
      {currentVersion && (
        <div className="current-version">
          <div className="version-badge current">Actual</div>
          <div className="version-info">
            <span className="version-number">v{currentVersion.version}</span>
            <span className="version-date">{formatDate(currentVersion.date)}</span>
            <span className="version-author">{currentVersion.author}</span>
          </div>
          <div className="version-changes">
            <h4 className="changes-title">Cambios:</h4>
            <ul className="changes-list">
              {currentVersion.changes.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>
          {currentVersion.notes && (
            <div className="version-notes">
              <h4 className="notes-title">Notas:</h4>
              <p>{currentVersion.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      <div className="history-timeline">
        <h4 className="history-title">Historial de Cambios</h4>
        <div className="timeline">
          {history.map((item) => (
            <div key={item.id} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <span className="timeline-date">{formatDate(item.date)}</span>
                <span className="timeline-action">{item.action}</span>
                <span className="timeline-author">por {item.author}</span>
                <p className="timeline-details">{item.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de Versiones */}
      {versionHistory.length > 0 && (
        <div className="version-history">
          <h4 className="history-title">Historial de Versiones</h4>
          <div className="version-list">
            {versionHistory.map((version) => (
              <div key={version.version} className="version-item">
                <span className="version-number">v{version.version}</span>
                <span className="version-date">{formatDate(version.date)}</span>
                <span className="version-author">{version.author}</span>
                <span className="version-changes-count">{version.changes.length} cambios</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} minutos`;
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
