"use client";

import Link from "next/link";
import { Sparkles, GlassWater, Flame, Music, ArrowRight, Award, ShieldCheck } from "lucide-react";
import styles from "./ExperienceSection.module.css";

export function ExperienceSection() {
  return (
    <section className={styles.experienceSection}>
      <div className={styles.container}>
        <div className={styles.experienceCard}>
          <div className={styles.experienceImage}>
            <div className={styles.experienceOverlay} />
            <div className={styles.imageBadge}>
              <Sparkles size={12} className="text-[#F0B429]" />
              <span>Experiencia Nebula Signature</span>
            </div>
          </div>

          <div className={styles.experienceContent}>
            <div className={styles.experienceBadge}>
              <Sparkles className="h-3.5 w-3.5 text-[#F0B429]" />
              Nuestra Filosofía Resto-Bar
            </div>

            <h2 className={styles.experienceTitle}>
              La Alquimia de la Barra &
              <span className="text-[#F0B429]"> el Fuego de la Cocina</span>
            </h2>

            <p className={styles.experienceDescription}>
              En Nebula no creemos en cartas estándar. Cada cóctel nace de infusiones
              propias, clarificados meticulosos y hielo de alta densidad. Cada plato
              sale de nuestras brasas pensado específicamente para elevar las notas
              aromáticas de lo que estás bebiendo.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <GlassWater className="h-4 w-4" />
                </div>
                <div className={styles.featureTextWrap}>
                  <span className={styles.featureTitle}>Hielo Cristalino</span>
                  <span className={styles.featureDesc}>Tallado a mano para cero dilución</span>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Flame className="h-4 w-4" />
                </div>
                <div className={styles.featureTextWrap}>
                  <span className={styles.featureTitle}>Fuegos & Brasa</span>
                  <span className={styles.featureDesc}>Tapas gourmet y cortes madurados</span>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Music className="h-4 w-4" />
                </div>
                <div className={styles.featureTextWrap}>
                  <span className={styles.featureTitle}>Atmósfera Nocturna</span>
                  <span className={styles.featureDesc}>Sonido curado e iluminación tenue</span>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Award className="h-4 w-4" />
                </div>
                <div className={styles.featureTextWrap}>
                  <span className={styles.featureTitle}>Club Royale</span>
                  <span className={styles.featureDesc}>Ruleta y beneficios en cada visita</span>
                </div>
              </div>
            </div>

            <div className={styles.ctaRow}>
              <Link href="/cliente/reservas" className={styles.experienceCTA}>
                <span>Reservar Mesa o Barra VIP</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
