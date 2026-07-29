"use client";

import { motion } from "framer-motion";
import { Sparkles, GlassWater, Dice1 } from "lucide-react";
import { memo } from "react";
import styles from "./RouletteHero.module.css";

interface RouletteHeroProps {
  onSpinStart?: () => void;
  disabled?: boolean;
}

export const RouletteHero = memo(function RouletteHero({ onSpinStart, disabled = false }: RouletteHeroProps) {
  return (
    <section className={styles.hero}>
      {/* Background with gradient */}
      <div className={styles.heroBackground} />
      
      {/* Glow effects */}
      <div className={styles.heroGlow} />
      <div className={styles.heroGlowSecondary} />

      {/* Content */}
      <div className={styles.heroContent}>
        <motion.div 
          className={styles.heroBadge}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Sparkles className={styles.heroBadgeIcon} />
          <span>Ruleta Nebula</span>
        </motion.div>

        <motion.h1 
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Dejá que el azar elija tu próximo trago
        </motion.h1>

        <motion.p 
          className={styles.heroDescription}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Una experiencia única donde cada giro puede revelar tu cóctel favorito. 
          ¿Te animás a probar tu suerte?
        </motion.p>

        <motion.div 
          className={styles.heroActions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.button
            type="button"
            onClick={onSpinStart}
            disabled={disabled}
            className={styles.heroCTA}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlassWater className={styles.heroCTAIcon} />
            Comenzar a Girar
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className={styles.heroStats}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className={styles.heroStat}>
            <Dice1 className={styles.heroStatIcon} />
            <div>
              <span className={styles.heroStatValue}>100%</span>
              <span className={styles.heroStatLabel}>Probabilidad justa</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className={styles.heroDecor} />
      <div className={styles.heroDecorSecondary} />
    </section>
  );
});
