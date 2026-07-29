"use client";

import { memo } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Wine, Music, Moon, Star } from "lucide-react";

function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const experiences = [
    {
      icon: Wine,
      color: "from-[var(--landing-accent-gold)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-gold)]",
      title: "Coctelería de autor",
      description: "Tragos exclusivos creados por nuestros mixólogos.",
    },
    {
      icon: Sparkles,
      color: "from-[var(--landing-accent-purple)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-purple)]",
      title: "Ambiente inmersivo",
      description: "Un espacio diseñado para despertar los sentidos.",
    },
    {
      icon: Music,
      color: "from-[var(--landing-accent-red)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-red)]",
      title: "Música en vivo",
      description: "DJs y artistas que crean la atmósfera perfecta.",
    },
    {
      icon: Moon,
      color: "from-[var(--landing-accent-blue)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-blue)]",
      title: "Noches únicas",
      description: "Cada visita es una experiencia diferente.",
    },
  ];

  return (
    <section id="experience" ref={ref} className="landing-section relative">
      <div className="landing-container">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 1 }}
          className="text-center mb-20 sm:mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          >
            <Star className="w-5 h-5 text-[var(--landing-accent-gold)]" />
            <span className="text-sm font-medium text-[var(--landing-accent-gold)] tracking-widest uppercase">
              Sobre Nebula
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-8">
            Una experiencia fuera de este mundo
          </h2>

          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Nebula no es solo un lugar para comer o beber. Es un espacio donde la
            gastronomía, la coctelería y el ambiente se combinan para crear una
            experiencia única.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.03, y: -12 }}
              className="group relative overflow-hidden landing-glass rounded-2xl p-6 sm:p-8 transition-all duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${exp.color} opacity-0 transition-opacity group-hover:opacity-100`} />
              
              <exp.icon className={`relative z-10 w-8 h-8 ${exp.iconColor}`} />
              <h3 className="relative z-10 mt-4 text-lg font-semibold">
                {exp.title}
              </h3>
              <p className="relative z-10 mt-2 text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                {exp.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Experience);
