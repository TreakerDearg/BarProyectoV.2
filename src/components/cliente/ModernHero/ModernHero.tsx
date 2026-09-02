"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UtensilsCrossed, Sparkles, GlassWater, ChefHat } from "lucide-react";
import { getProductCategories } from "@/lib/api/bartender";
import styles from "./ModernHero.module.css";

export function ModernHero() {
  const [stats, setStats] = useState({ drinks: 0, food: 0, total: 0 });

  useEffect(() => {
    getProductCategories()
      .then((cats) => {
        const drinks = cats.reduce((s, c) => s + (c.drinks ?? 0), 0);
        const food   = cats.reduce((s, c) => s + (c.food   ?? 0), 0);
        if (drinks + food > 0) setStats({ drinks, food, total: drinks + food });
      })
      .catch(() => { /* silencioso — fallback estático */ });
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground} />
      <div className={styles.heroImage} />
      <div className={styles.heroOverlay} />

      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <Sparkles className="h-4 w-4" />
          Experiencia gastronómica premium
        </div>

        <h1 className={styles.heroTitle}>
          Tu próximo momento
          <span className={styles.heroTitleGold}> empieza acá</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Descubrí nuestra selección de cócteles exclusivos, platos artesanales
          y un ambiente que transforma cada visita en una experiencia memorable.
        </p>

        <div className={styles.heroActions}>
          <Link href="/cliente/carta" className={styles.primaryButton}>
            <UtensilsCrossed className="h-5 w-5" />
            Ver carta
          </Link>
          <Link href="/cliente/reservas" className={styles.secondaryButton}>
            Reservar mesa
          </Link>
        </div>

        {/* Stats — reales si cargaron, estáticos si no */}
        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}><GlassWater size={18} /></div>
            <div className={styles.statValue}>
              {stats.drinks > 0 ? `${stats.drinks}+` : "20+"}
            </div>
            <div className={styles.statLabel}>Cócteles</div>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.statItem}>
            <div className={styles.statIcon}><ChefHat size={18} /></div>
            <div className={styles.statValue}>
              {stats.food > 0 ? `${stats.food}+` : "30+"}
            </div>
            <div className={styles.statLabel}>Platos</div>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.statItem}>
            <div className={styles.statIcon}><Sparkles size={18} /></div>
            <div className={styles.statValue}>
              {stats.total > 0 ? `${stats.total}+` : "50+"}
            </div>
            <div className={styles.statLabel}>En carta</div>
          </div>
        </div>
      </div>
    </section>
  );
}
