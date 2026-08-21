import styles from "./MenuErrorState.module.css";

interface MenuErrorStateProps {
  onRetry: () => void;
}

export function MenuErrorState({ onRetry }: MenuErrorStateProps) {
  return (
    <div className={styles.wrapper} role="alert" aria-live="assertive">
      <div className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" className={styles.iconSvg}>
          <circle cx="32" cy="32" r="26" fill="rgba(255,69,58,0.07)" />
          <circle cx="32" cy="32" r="26" stroke="rgba(255,69,58,0.18)" strokeWidth="2" />
          <path d="M32 20v16M32 42v2" stroke="#FF453A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className={styles.heading}>No pudimos cargar la carta</h3>
      <p className={styles.description}>
        Algo salió mal al obtener los productos.
        <br />
        Verificá tu conexión e intentá nuevamente.
      </p>
      <button type="button" className={styles.retryBtn} onClick={onRetry}>
        <svg viewBox="0 0 24 24" fill="none" className={styles.retryIcon} aria-hidden="true">
          <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Reintentar
      </button>
    </div>
  );
}
