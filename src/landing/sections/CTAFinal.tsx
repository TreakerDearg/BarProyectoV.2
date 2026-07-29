"use client";

import { memo } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

function CTAFinal() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="landing-section relative">
      <div className="landing-container">
        {/* Ambient Glow Behind */}
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-20 bg-gradient-to-r from-[var(--landing-accent-gold)]/20 via-[var(--landing-accent-purple)]/15 to-[var(--landing-accent-wine)]/15 blur-3xl pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-8"
          >
            ¿Listo para una experiencia
            <span className="landing-gradient-text block mt-2">
              fuera de este mundo?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-16"
          >
            Descubre una experiencia gastronómica diferente en Nebula.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link
              href="/cliente"
              className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-[var(--landing-accent-gold)] text-black text-base sm:text-lg font-semibold transition-all hover:bg-[var(--landing-accent-gold-light)] hover:scale-105 landing-focus-visible"
              aria-label="Entrar al sistema del cliente"
            >
              Entrar al Restaurante
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default memo(CTAFinal);
