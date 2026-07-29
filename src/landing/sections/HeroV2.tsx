"use client";

import { memo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, GlassWater, Sparkles } from "lucide-react";

function HeroV2() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{
    width: number;
    height: number;
    left: string;
    top: string;
    delay: number;
    duration: number;
    xRange: number;
  }>>([]);

  useEffect(() => {
    setMounted(true);
    setParticles(
      [...Array(12)].map(() => ({
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 3,
        duration: Math.random() * 8 + 6,
        xRange: Math.random() * 40 - 20,
      }))
    );
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Cinematic Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2070"
          alt="Nebula Restaurant Atmosphere"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
      </div>

      {/* Ambient Glow */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--landing-accent-gold)]/20 via-[var(--landing-accent-purple)]/10 to-[var(--landing-accent-red)]/20 blur-3xl" />
      </motion.div>

      {/* Floating Particles */}
      {mounted && particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[var(--landing-accent-gold)]/20 blur-sm"
          style={{
            width: particle.width,
            height: particle.height,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, particle.xRange, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}

      <div className="landing-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-5xl mx-auto text-center"
        >
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8"
          >
            <Sparkles className="w-5 h-5 text-[var(--landing-accent-gold)]" />
            <span className="text-sm font-medium text-[var(--landing-accent-gold)] tracking-widest uppercase">
              Experiencia Gastronómica Premium
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-semibold leading-[1.05] tracking-tight mb-8"
          >
            Donde los sabores
            <span className="block landing-gradient-text mt-4">
              cruzan la galaxia
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1.2 }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            En <span className="text-white font-semibold">Nebula</span>, la gastronomía,
            la coctelería y el ambiente se fusionan en una experiencia única.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/cliente/carta"
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[var(--landing-accent-gold)] text-black text-base sm:text-lg font-semibold transition-all hover:bg-[var(--landing-accent-gold-light)] hover:scale-105 landing-focus-visible"
              aria-label="Ver carta de platos y cócteles"
            >
              <GlassWater className="w-5 h-5" />
              Ver carta
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/cliente/reservas"
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-full border-2 border-white/20 bg-white/5 text-white text-base sm:text-lg font-medium backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/30 landing-focus-visible"
              aria-label="Reservar mesa en Nebula"
            >
              <CalendarDays className="w-5 h-5" />
              Reservar mesa
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1.2 }}
            className="mt-24 grid gap-6 border-t border-white/10 pt-12 sm:grid-cols-3"
          >
            {[
              { label: "Gastronomía", color: "text-[var(--landing-accent-gold)]", desc: "Platos diseñados para acompañar cada momento." },
              { label: "Coctelería", color: "text-[var(--landing-accent-purple)]", desc: "Tragos de autor inspirados en lo cósmico." },
              { label: "Experiencia", color: "text-[var(--landing-accent-red)]", desc: "Música, ambiente y diseño para una noche distinta." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -8 }}
                className="landing-glass rounded-2xl p-6 sm:p-8 transition-all"
              >
                <p className="text-xs uppercase tracking-widest font-semibold mb-4">
                  <span className={feature.color}>{feature.label}</span>
                </p>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3 text-white/40"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-white/60"
            />
          </div>
          <span className="text-xs uppercase tracking-widest">Scroll</span>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default memo(HeroV2);
