"use client";

import Link from "next/link";
import { Sparkles, GlassWater, UtensilsCrossed, Music, ArrowRight } from "lucide-react";
import styles from "./ExperienceSection.module.css";

export function ExperienceSection() {
  return (
    <section className={styles.experienceSection}>
      <div className={styles.container}>
        <div className={styles.experienceCard}>
          <div className={styles.experienceImage}>
            <div className={styles.experienceOverlay} />
          </div>
          
          <div className={styles.experienceContent}>
            <div className={styles.experienceBadge}>
              <Sparkles className="h-4 w-4" />
              Nuestra experiencia
            </div>
            
            <h2 className={styles.experienceTitle}>
              No es solo pedir.
              Es disfrutar el momento.
            </h2>
            
            <p className={styles.experienceDescription}>
              Nebula no es solo un lugar para comer. Es un espacio donde cada cóctel, 
              cada plato y cada momento están diseñados para crear memorias. 
              Desde nuestra cocina hasta nuestra barra, todo está pensado para ti.
            </p>
            
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <GlassWater className="h-5 w-5" />
                </div>
                <span className={styles.featureText}>Cócteles</span>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <span className={styles.featureText}>Gastronomía</span>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Music className="h-5 w-5" />
                </div>
                <span className={styles.featureText}>Ambiente</span>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className={styles.featureText}>Reservas</span>
              </div>
            </div>
            
            <Link href="/cliente/reservas" className={styles.experienceCTA}>
              Reservar tu mesa
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}