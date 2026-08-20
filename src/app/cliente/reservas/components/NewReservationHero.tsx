"use client";

import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";
import ui from "../../cliente-ui.module.css";

export function NewReservationHero() {
  return (
    <section className={ui.newReservationHero}>
      <div className={ui.newReservationHeroContent}>
        {/* Badge */}
        <motion.div
          className={ui.newReservationHeroBadge}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className={ui.newReservationHeroBadgeIcon} />
          <span>Reserva tu mesa</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className={ui.newReservationHeroTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Disfrutá de Nebula
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className={ui.newReservationHeroSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Elegí cuándo venir y nosotros nos encargamos del resto.
        </motion.p>

        {/* Decorative */}
        <motion.div
          className={ui.newReservationHeroGlow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
      </div>
    </section>
  );
}
