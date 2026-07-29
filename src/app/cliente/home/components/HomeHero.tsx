"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UtensilsCrossed, CalendarDays, ChevronDown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import ui from "../../cliente-ui.module.css";

interface HomeHeroProps {
  restaurantName?: string;
  tagline?: string;
  description?: string;
}

export default function HomeHero({ 
  restaurantName = "Nebula", 
  tagline = "Sabores Únicos",
  description = "Descubre una experiencia gastronómica excepcional en un ambiente exclusivo. Cócteles artesanales, platos gourmet y momentos inolvidables."
}: HomeHeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight * 0.9,
      behavior: "smooth"
    });
  };

  return (
    <section className={ui.homeHeroSection}>
      {/* Background with gradient and subtle pattern */}
      <div className={ui.homeHeroBackground}>
        <div className={ui.homeHeroGradient} />
        <div className={ui.homeHeroPattern} />
      </div>

      {/* Content */}
      <div className={ui.homeHeroContainer}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className={ui.homeHeroContent}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={ui.homeHeroBadge}
          >
            <Sparkles className={ui.homeHeroBadgeIcon} />
            <span>Experiencia Premium</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={ui.homeHeroTitle}
          >
            {tagline}
            <span className={ui.homeHeroTitleHighlight}> {restaurantName}</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className={ui.homeHeroDescription}
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className={ui.homeHeroActions}
          >
            <Link href="/cliente/carta" className={ui.homeHeroBtnPrimary}>
              <UtensilsCrossed className={ui.homeHeroBtnIcon} />
              Ver Carta
            </Link>
            <Link href="/cliente/reservas" className={ui.homeHeroBtnSecondary}>
              <CalendarDays className={ui.homeHeroBtnIcon} />
              Reservar Mesa
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          onClick={scrollToNext}
          className={ui.homeHeroScrollIndicator}
          aria-label="Scroll para explorar más"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className={ui.homeHeroScrollIcon} />
          </motion.div>
        </motion.button>
      </div>

      {/* Decorative Elements */}
      <div className={ui.homeHeroDecor} />
    </section>
  );
}
