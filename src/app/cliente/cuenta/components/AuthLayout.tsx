"use client";

import Link from "next/link";
import styles from "./AuthLayout.module.css";

// ─────────────────────────────────────────────────────────────────
// AuthLayout — contenedor visual compartido para Login y Register
// ─────────────────────────────────────────────────────────────────

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.wrapper}>
      {/* Panel izquierdo — Brand (oculto en mobile) */}
      <div className={styles.brand} aria-hidden="true">
        <div className={styles.brandInner}>
          {/* Logo */}
          <Link href="/" className={styles.logoLink} tabIndex={-1}>
            <div className={styles.logoMark}>N</div>
            <span className={styles.logoText}>Nebula</span>
          </Link>

          {/* Tagline */}
          <p className={styles.tagline}>
            Tu mesa, tus pedidos<br />y tu próxima noche.
          </p>

          {/* Decoración */}
          <div className={styles.brandDecoration} />
        </div>
      </div>

      {/* Panel derecho — Formulario */}
      <div className={styles.formPanel}>
        {/* Logo mobile (solo visible en mobile) */}
        <Link href="/" className={styles.logoMobile}>
          <div className={styles.logoMarkSm}>N</div>
          <span className={styles.logoTextSm}>Nebula</span>
        </Link>

        <div className={styles.formContent}>
          {children}
        </div>
      </div>
    </div>
  );
}
