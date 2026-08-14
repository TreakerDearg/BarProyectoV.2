"use client";

import Link from "next/link";
import { UtensilsCrossed, Sparkles, Clock } from "lucide-react";
import styles from "./ModernHero.module.css";

export function ModernHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground} />
      <div className={styles.heroImage} />
      <div className={styles.heroOverlay} />
      
      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <Sparkles className="h-4 w-4" />
          Nueva experiencia gastronómica
        </div>
        
        <h1 className={styles.heroTitle}>
          Tu próximo momento empieza acá
        </h1>
        
        <p className={styles.heroSubtitle}>
          Descubre nuestra selección de platos artesanales, cócteles exclusivos y un ambiente que transforma cada visita en una experiencia memorable.
        </p>
        
        <div className={styles.heroActions}>
          <Link href="/cliente/carta" className={styles.primaryButton}>
            <UtensilsCrossed className="h-5 w-5" />
            Ver menú
          </Link>
          <Link href="/cliente/reservas" className={styles.secondaryButton}>
            Reservar mesa
          </Link>
        </div>
        
        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>50+</div>
            <div className={styles.statLabel}>Platos</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>20+</div>
            <div className={styles.statLabel}>Cócteles</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>15min</div>
            <div className={styles.statLabel}>Entrega</div>
          </div>
        </div>
      </div>
    </section>
  );
}