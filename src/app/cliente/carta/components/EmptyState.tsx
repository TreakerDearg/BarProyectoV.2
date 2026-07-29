import { RefreshCw, SearchX } from "lucide-react";
import ui from "../../cliente-ui.module.css";

interface EmptyStateProps {
  onRetry?: () => void;
  isSearchResult?: boolean;
}

export default function EmptyState({ onRetry, isSearchResult = false }: EmptyStateProps) {
  return (
    <div className={ui.emptyStateContainer}>
      <div className={ui.emptyStateIcon}>
        <SearchX className="h-12 w-12" />
      </div>
      <h3 className={ui.emptyStateTitle}>
        {isSearchResult ? "Sin resultados" : "No hay productos disponibles"}
      </h3>
      <p className={ui.emptyStateMessage}>
        {isSearchResult
          ? "No encontramos productos que coincidan con tu búsqueda. Intenta con otros términos."
          : "No hay productos disponibles en este momento. Vuelve más tarde."}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={ui.emptyStateRetry}
        >
          <RefreshCw className="h-4 w-4" />
          Intentar nuevamente
        </button>
      )}
    </div>
  );
}