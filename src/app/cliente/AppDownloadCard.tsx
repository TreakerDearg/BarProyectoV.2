"use client";

import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";
import styles from "./AppDownloadCard.module.css";

export function AppDownloadCard() {
  return (
    <section className={styles.card} aria-labelledby="download-app-title">
      <div className={styles.icon} aria-hidden="true"><Smartphone size={20} /></div>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Experiencia móvil</p>
        <h2 id="download-app-title">Lleva Nebula contigo</h2>
        <p>Accede más rápido a tus pedidos, reservas y beneficios desde la app.</p>
      </div>
      <Link href="/cliente/app" className={styles.link}>
        Descargar app <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
