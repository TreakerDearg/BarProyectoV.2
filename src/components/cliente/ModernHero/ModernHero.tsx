"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UtensilsCrossed, Sparkles, GlassWater, ChefHat, Calendar, Wine, Compass, ArrowRight } from "lucide-react";
import { getProductCategories } from "@/lib/api/bartender";
import styles from "./ModernHero.module.css";

export function ModernHero() {
  const [stats, setStats] = useState({ drinks: 0, food: 0, total: 0 });
  const [isOpenNow, setIsOpenNow] = useState(true);

  useEffect(() => {
    // Verificar si el bar está en horario de servicio nocturno (18:00 a 04:00)
    const hour = new Date().getHours();
    setIsOpenNow(hour >= 18 || hour < 4);

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
      <div className={styles.heroSpotlight} />
      <div className={styles.heroOverlay} />

      <div className={styles.heroContent}>
        {/* Status Pill Live */}
        <div className={styles.statusPill}>
          <span className={`${styles.statusDot} ${isOpenNow ? styles.statusDotLive : styles.statusDotOff}`} />
          <span className={styles.statusText}>
            {isOpenNow ? "Barra & Fuegos en Servicio • Abierto hasta 04:00 AM" : "Abrimos hoy 18:00 HS • Reservas Online Disponibles"}
          </span>
        </div>

        {/* Badge Superior */}
        <div className={styles.heroBadge}>
          <Sparkles className="h-3.5 w-3.5 text-[#F0B429]" />
          <span>Nebula Resto-Bar • Cocktail Lounge & Fuegos</span>
        </div>

        {/* Título Principal */}
        <h1 className={styles.heroTitle}>
          Alta Coctelería &
          <span className={styles.heroTitleGold}> Cocina de Autor</span>
        </h1>

        {/* Subtítulo Evocativo */}
        <p className={styles.heroSubtitle}>
          Donde la mixología botánica, los destilados añejos y los fuegos a la brasa
          se encuentran en una atmósfera íntima diseñada para despertar los sentidos.
        </p>

        {/* Botones de Acción */}
        <div className={styles.heroActions}>
          <Link href="/cliente/carta" className={styles.primaryButton}>
            <UtensilsCrossed className="h-4 w-4" />
            <span>Explorar Carta</span>
          </Link>

          <Link href="/cliente/reservas" className={styles.secondaryButton}>
            <Calendar className="h-4 w-4 text-[#F0B429]" />
            <span>Reservar Mesa</span>
          </Link>

          <Link href="/cliente/ruleta" className={styles.roulettePill}>
            <Sparkles className="h-4 w-4 text-[#F0B429]" />
            <span>Girar Ruleta</span>
          </Link>
        </div>

        {/* Chips de Firma / Pilares de Estilo */}
        <div className={styles.featureChips}>
          <span className={styles.featureChip}>
            <GlassWater size={12} className="text-[#F0B429]" /> Hielo Cristalino Tallado
          </span>
          <span className={styles.featureChip}>
            <ChefHat size={12} className="text-[#F0B429]" /> Cocina de Fuegos & Tapas
          </span>
          <span className={styles.featureChip}>
            <Wine size={12} className="text-[#F0B429]" /> Cava & Destilados Puros
          </span>
        </div>

        {/* Stats del Local */}
        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}><GlassWater size={16} /></div>
            <div className={styles.statValue}>
              {stats.drinks > 0 ? `${stats.drinks}+` : "24+"}
            </div>
            <div className={styles.statLabel}>Cócteles de Autor</div>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.statItem}>
            <div className={styles.statIcon}><ChefHat size={16} /></div>
            <div className={styles.statValue}>
              {stats.food > 0 ? `${stats.food}+` : "18+"}
            </div>
            <div className={styles.statLabel}>Platos Gourmet</div>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.statItem}>
            <div className={styles.statIcon}><Wine size={16} /></div>
            <div className={styles.statValue}>
              {stats.total > 0 ? `${stats.total}+` : "45+"}
            </div>
            <div className={styles.statLabel}>Opciones en Carta</div>
          </div>
        </div>
      </div>
    </section>
  );
}
