"use client";

import { memo } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CalendarDays, GlassWater, ArrowRight } from "lucide-react";

function Reservations() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="reservations" ref={ref} className="landing-section relative">
      <div className="landing-container">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 1.2 }}
          className="relative overflow-hidden landing-glass rounded-3xl p-10 sm:p-12 md:p-16"
        >
          {/* Ambient Glow Behind */}
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-4 bg-gradient-to-r from-[var(--landing-accent-gold)]/30 via-[var(--landing-accent-purple)]/20 to-[var(--landing-accent-wine)]/20 blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--landing-accent-gold)]/20 via-[var(--landing-accent-purple)]/20 to-[var(--landing-accent-red)]/20 blur-3xl" />
          </motion.div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
            >
              <span className="text-sm font-medium text-[var(--landing-accent-gold)] tracking-wider uppercase">
                🎉 Reservas
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-8"
            >
              Viví la experiencia Nebula
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
            >
              Asegurá tu lugar y descubrí una noche donde cada detalle está
              pensado para sorprender.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/cliente/reservas"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[var(--landing-accent-gold)] text-black text-base font-semibold transition-all hover:bg-[var(--landing-accent-gold-light)] hover:scale-105 landing-focus-visible"
                aria-label="Reservar mesa ahora"
              >
                <CalendarDays className="w-5 h-5" />
                Reservar ahora
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/cliente/carta"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 bg-white/5 text-white text-base font-medium backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30 landing-focus-visible"
                aria-label="Ver carta de platos y cócteles"
              >
                <GlassWater className="w-5 h-5" />
                Ver carta
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default memo(Reservations);
