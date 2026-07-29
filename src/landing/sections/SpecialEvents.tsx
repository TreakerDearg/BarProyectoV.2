"use client";

import { memo } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Music, Sparkles, Star } from "lucide-react";

function SpecialEvents() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const events = [
    {
      icon: Music,
      color: "from-[var(--landing-accent-purple)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-purple)]",
      title: "Noches de DJ",
      description: "DJs internacionales cada fin de semana.",
      day: "Viernes",
    },
    {
      icon: Sparkles,
      color: "from-[var(--landing-accent-gold)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-gold)]",
      title: "Cócteles Temáticos",
      description: "Menús especiales inspirados en la temporada.",
      day: "Sábados",
    },
    {
      icon: Star,
      color: "from-[var(--landing-accent-red)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-red)]",
      title: "Eventos Privados",
      description: "Celebra tus momentos especiales con nosotros.",
      day: "Todos",
    },
    {
      icon: Calendar,
      color: "from-[var(--landing-accent-blue)]/20 to-transparent",
      iconColor: "text-[var(--landing-accent-blue)]",
      title: "Happy Hour",
      description: "Promociones especiales de 18:00 a 21:00.",
      day: "Lun-Jue",
    },
  ];

  return (
    <section id="events" ref={ref} className="landing-section relative">
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
              🎉 Eventos
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-8">
            Experiencias únicas
          </h2>

          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Cada semana algo nuevo para descubrir.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.03, y: -12 }}
              className="group relative overflow-hidden landing-glass rounded-2xl p-6 sm:p-8 transition-all duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-0 transition-opacity group-hover:opacity-100`} />
              
              <event.icon className={`relative z-10 w-8 h-8 ${event.iconColor}`} />
              <h3 className="relative z-10 mt-4 text-lg font-semibold">
                {event.title}
              </h3>
              <p className="relative z-10 mt-2 text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                {event.description}
              </p>
              <div className="relative z-10 mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-[var(--landing-accent-gold)]">
                {event.day}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(SpecialEvents);
