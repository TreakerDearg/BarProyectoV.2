"use client";

import { memo } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, Users, Music, Sparkles } from "lucide-react";

function Atmosphere() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Clock,
      color: "from-[var(--landing-accent-gold)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-gold)]",
      title: "Horarios Extendidos",
      description: "Abierto de 18:00 a 04:00 para que disfrutes cuando quieras.",
    },
    {
      icon: Users,
      color: "from-[var(--landing-accent-purple)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-purple)]",
      title: "Ambiente Exclusivo",
      description: "Un espacio diseñado para momentos especiales con amigos.",
    },
    {
      icon: Music,
      color: "from-[var(--landing-accent-red)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-red)]",
      title: "Música en Vivo",
      description: "DJs y artistas que crean la atmósfera perfecta.",
    },
    {
      icon: Sparkles,
      color: "from-[var(--landing-accent-blue)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-blue)]",
      title: "Eventos Temáticos",
      description: "Noches únicas con decoración y menús especiales.",
    },
  ];

  return (
    <section id="atmosphere" ref={ref} className="landing-section relative">
      <div className="landing-container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
          >
            <span className="text-sm font-medium text-[var(--landing-accent-gold)] tracking-wider uppercase">
              🌟 El Ambiente
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-8">
            Más que un restaurante
          </h2>

          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Cada elemento está diseñado para crear memorias inolvidables.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.03, y: -12 }}
              className="group relative overflow-hidden landing-glass rounded-2xl p-6 sm:p-8 transition-all duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-100`} />
              
              <feature.icon className={`relative z-10 w-8 h-8 ${feature.iconColor}`} />
              <h3 className="relative z-10 mt-4 text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="relative z-10 mt-2 text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Atmosphere);
