"use client";

import { AppRoulette } from "@/components/cliente-app/AppRoulette";
import styles from "./page.module.css";

export default function AppRoulettePage() {
  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>Experiencia Nebula</span>
        <h1 className={styles.title}>Deja que la noche elija</h1>
        <p className={styles.description}>Gira la ruleta y descubre una bebida para tu momento.</p>
      </header>
      <section className={styles.experience} aria-label="Ruleta de bebidas">
        <div className={styles.hero}><AppRoulette /></div>
      </section>
    </main>
  );
}
