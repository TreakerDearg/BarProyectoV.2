"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, CalendarDays, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import styles from "./Hero.module.css";

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  showCTA?: boolean;
}

export const Hero = memo(function Hero({
  title = "Nuestra Carta",
  subtitle = "Sabores Auténticos",
  description = "Descubre una experiencia gastronómica única con platos artesanales y bebidas premium preparadas con pasión.",
  backgroundImage,
  showCTA = true,
}: HeroProps) {
  return (
    <section className={styles.hero}>
      {/* Background with gradient overlay */}
      <div className={styles.heroBackground}>
        {backgroundImage ? (
          <div 
            className={styles.heroImage}
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          <div className={styles.heroPattern} />
        )}
        <div className={styles.heroOverlay} />
      </div>

      {/* Content */}
      <div className={styles.heroContent}>
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <motion.div
            className={styles.heroBadge}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sparkles className={styles.heroBadgeIcon} />
            <span>Exclusivo Nebula</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className={styles.heroTitleMain}>{title}</span>
            <span className={styles.heroTitleAccent}>{subtitle}</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className={styles.heroDescription}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          {showCTA && (
            <motion.div
              className={styles.heroActions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Link href="#menu" className={styles.heroButtonPrimary}>
                <UtensilsCrossed className={styles.heroButtonIcon} />
                <span>Ver Menú</span>
                <ArrowRight className={styles.heroButtonArrow} />
              </Link>
              
              <Link href="/cliente/reservas" className={styles.heroButtonSecondary}>
                <CalendarDays className={styles.heroButtonIcon} />
                <span>Reservar Mesa</span>
              </Link>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            className={styles.heroStats}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>50+</span>
              <span className={styles.heroStatLabel}>Platos</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>15+</span>
              <span className={styles.heroStatLabel}>Cócteles</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>4.9</span>
              <span className={styles.heroStatLabel}>Rating</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className={styles.heroDecor} />
      <div className={styles.heroGlow} />
    </section>
  );
});
