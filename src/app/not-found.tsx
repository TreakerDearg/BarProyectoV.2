// ─────────────────────────────────────────────────────────────────
// 404 — Not Found
//
// Página global para cualquier ruta que no exista.
// Server Component puro — sin "use client" para máxima compatibilidad
// con Next.js App Router y Vercel Edge Runtime.
// ─────────────────────────────────────────────────────────────────

import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      {/* Fondo decorativo */}
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.content}>
        {/* Número 404 */}
        <div className={styles.code} aria-hidden="true">
          <span className={styles.codeDigit}>4</span>
          <span className={styles.codeGlass}>
            {/* Copa decorativa inline SVG */}
            <svg
              viewBox="0 0 48 80"
              fill="none"
              className={styles.glassIcon}
              aria-hidden="true"
            >
              {/* Copa */}
              <path
                d="M8 4 h32 L32 36 Q24 48 24 48 Q24 48 16 36 Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Pie */}
              <line x1="24" y1="48" x2="24" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <line x1="12" y1="68" x2="36" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              {/* Burbujas */}
              <circle cx="20" cy="22" r="2" fill="currentColor" opacity="0.5" />
              <circle cx="28" cy="16" r="1.5" fill="currentColor" opacity="0.4" />
              <circle cx="24" cy="30" r="1" fill="currentColor" opacity="0.3" />
            </svg>
          </span>
          <span className={styles.codeDigit}>4</span>
        </div>

        {/* Texto */}
        <h1 className={styles.title}>Esta mesa no existe</h1>
        <p className={styles.description}>
          Parece que la ruta que buscás no está en nuestra carta.
          <br />
          Pero hay mucho más para descubrir.
        </p>

        {/* Acciones */}
        <div className={styles.actions}>
          <Link href="/cliente" className={styles.primaryBtn}>
            Ir al inicio
          </Link>
          <Link href="/cliente/carta" className={styles.secondaryBtn}>
            Ver la carta
          </Link>
        </div>

        {/* Hint sutil */}
        <p className={styles.hint}>
          Si llegaste acá desde un link, puede que haya cambiado de lugar.
        </p>
      </div>
    </main>
  );
}
