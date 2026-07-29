"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import ui from "../../cliente-ui.module.css";

export default function ReservationHero() {
  return (
    <section className={ui.reservationHero}>
      <div className={ui.reservationHeroContainer}>
        {/* Background Image with Overlay */}
        <div className={ui.reservationHeroBackground}>
          <div className={ui.reservationHeroOverlay} />
        </div>

        {/* Content */}
        <motion.div
          className={ui.reservationHeroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            className={ui.reservationHeroBadge}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sparkles className={ui.reservationHeroBadgeIcon} />
            <span>Exclusiva</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className={ui.reservationHeroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Reservá tu Mesa en
            <span className={ui.reservationHeroTitleHighlight}> Nebula</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className={ui.reservationHeroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Viví una experiencia gastronómica excepcional en un ambiente exclusivo.
            Cócteles artesanales, gastronomía de autor y música en vivo.
          </motion.p>

          {/* Info Cards */}
          <motion.div
            className={ui.reservationHeroInfo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className={ui.reservationHeroInfoItem}>
              <Clock className={ui.reservationHeroInfoIcon} />
              <div>
                <span className={ui.reservationHeroInfoLabel}>Horarios</span>
                <span className={ui.reservationHeroInfoValue}>18:00 - 04:00</span>
              </div>
            </div>
            <div className={ui.reservationHeroInfoItem}>
              <CalendarDays className={ui.reservationHeroInfoIcon} />
              <div>
                <span className={ui.reservationHeroInfoLabel}>Reservas</span>
                <span className={ui.reservationHeroInfoValue}>Anticipada</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            className={ui.reservationHeroCTA}
            onClick={() => {
              const formSection = document.querySelector('[data-reservation-form]');
              formSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Reservar Ahora</span>
            <ArrowRight className={ui.reservationHeroCTAIcon} />
          </motion.button>

          {/* Secondary Link */}
          <motion.div
            className={ui.reservationHeroSecondary}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Link href="/cliente/carta" className={ui.reservationHeroLink}>
              Ver nuestra carta primero
            </Link>
          </motion.div>
        </motion.div>

        {/* Decorative Elements */}
        <div className={ui.reservationHeroGlow} />
        <div className={ui.reservationHeroParticles} />
      </div>
    </section>
  );
}
