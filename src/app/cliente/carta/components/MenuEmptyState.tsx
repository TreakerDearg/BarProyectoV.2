import styles from "./MenuEmptyState.module.css";

interface MenuEmptyStateProps {
  isFiltered: boolean;
  searchQuery: string;
  onClearFilters: () => void;
  onRetry?: () => void;
}

export function MenuEmptyState({
  isFiltered,
  searchQuery,
  onClearFilters,
  onRetry,
}: MenuEmptyStateProps) {
  const isSearch = searchQuery.trim().length > 0;

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.icon} aria-hidden="true">
        {isSearch ? (
          <svg viewBox="0 0 64 64" fill="none" className={styles.iconSvg}>
            <circle cx="28" cy="28" r="18" stroke="rgba(255,90,31,0.2)" strokeWidth="3" strokeDasharray="8 4" />
            <path d="M41 41l10 10" stroke="rgba(255,90,31,0.3)" strokeWidth="3" strokeLinecap="round" />
            <path d="M22 28h12M28 22v12" stroke="rgba(255,90,31,0.2)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 64 64" fill="none" className={styles.iconSvg}>
            <rect x="8" y="16" width="48" height="36" rx="6" stroke="rgba(255,90,31,0.2)" strokeWidth="2.5" strokeDasharray="8 4" />
            <path d="M20 28h24M20 36h16" stroke="rgba(255,90,31,0.2)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
      </div>

      <h3 className={styles.heading}>
        {isSearch
          ? `Sin resultados para "${searchQuery}"`
          : isFiltered
          ? "No hay productos en esta categoría"
          : "La carta está vacía por el momento"}
      </h3>

      <p className={styles.description}>
        {isSearch
          ? "Intentá con otro término o explorá por categoría."
          : isFiltered
          ? "Probá seleccionando otra categoría."
          : "Volvé a intentarlo más tarde."}
      </p>

      <div className={styles.actions}>
        {isFiltered && (
          <button type="button" className={styles.clearBtn} onClick={onClearFilters}>
            Ver todos los productos
          </button>
        )}
        {!isFiltered && onRetry && (
          <button type="button" className={styles.retryBtn} onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
