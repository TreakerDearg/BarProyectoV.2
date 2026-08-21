import styles from "./SkeletonGrid.module.css";

// ─────────────────────────────────────────────────────────────────
// SkeletonGrid — carga visual mientras llegan los productos
// ─────────────────────────────────────────────────────────────────

export function SkeletonGrid() {
  return (
    <div className={styles.wrapper} aria-label="Cargando carta" role="status">
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.card} aria-hidden="true">
            <div className={styles.image} />
            <div className={styles.body}>
              <div className={styles.lineSm} />
              <div className={styles.lineMd} />
              <div className={styles.lineLg} />
              <div className={styles.footer}>
                <div className={styles.price} />
                <div className={styles.btn} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Cargando productos…</span>
    </div>
  );
}
