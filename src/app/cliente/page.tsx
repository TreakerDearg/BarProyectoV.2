"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChefHat,
  ClipboardList,
  Sparkles,
  CalendarDays,
  Wine,
  UtensilsCrossed,
  PartyPopper,
} from "lucide-react";
import { motion } from "framer-motion";
import ui from "./cliente-ui.module.css";

const features = [
  {
    href: "/cliente/carta",
    title: "Explorar Carta",
    desc: "Descubre nuestros platos y bebidas disponibles",
    icon: ChefHat,
    color: "gold",
  },
  {
    href: "/cliente/pedido",
    title: "Tu Pedido",
    desc: "Arma tu pedido y envialo a cocina",
    icon: ClipboardList,
    color: "green",
  },
  {
    href: "/cliente/ruleta",
    title: "Ruleta",
    desc: "Dejá que el azar elija tu trago",
    icon: Sparkles,
    color: "amber",
  },
  {
    href: "/cliente/reservas",
    title: "Reservar",
    desc: "Elegí horario y asegurá tu lugar",
    icon: CalendarDays,
    color: "red",
  },
];

const stats = [
  { value: "15+", label: "Años trayectoria" },
  { value: "50K+", label: "Clientes" },
  { value: "4.8", label: "Estrellas" },
];

export default function ClienteHomePage() {
  return (
    <div className={ui.homeContainer}>

      {/* HERO SECTION */}
      <section className={ui.homeHero}>
        <div className={ui.homeHeroContent}>
          <div className={ui.homeBadge}>
            <PartyPopper className="h-3 w-3" />
            <span>Bienvenido a Nebula</span>
          </div>

          <h1 className={ui.homeTitle}>
            Vive la experiencia
            <span className={ui.homeTitleGold}> Nebula</span>
          </h1>

          <p className={ui.homeSubtitle}>
            Sabores únicos en un ambiente exclusivo. Pedí, explorá y disfrutá
            sin interrupciones.
          </p>

          <div className={ui.homeHeroActions}>
            <Link href="/cliente/carta" className={ui.homeBtnPrimary}>
              <UtensilsCrossed className="h-5 w-5" />
              Ver Carta
            </Link>
            <Link href="/cliente/reservas" className={ui.homeBtnSecondary}>
              <CalendarDays className="h-5 w-5" />
              Reservar Mesa
            </Link>
          </div>
        </div>

        <div className={ui.homeHeroDecor} />
      </section>

      {/* STATS */}
      <section className={ui.homeStats}>
        {stats.map((stat, i) => (
          <div key={i} className={ui.homeStatItem}>
            <span className={ui.homeStatValue}>{stat.value}</span>
            <span className={ui.homeStatLabel}>{stat.label}</span>
          </div>
        ))}
      </section>

      {/* FEATURES GRID */}
      <section className={ui.homeFeatures}>
        <h2 className={ui.homeSectionTitle}>Navegá rápido</h2>

        <div className={ui.homeFeaturesGrid}>
          {features.map(({ href, title, desc, icon: Icon, color }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={href} className={ui.homeFeatureCard}>
                <div className={ui.homeFeatureIcon} data-color={color}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className={ui.homeFeatureContent}>
                  <h3 className={ui.homeFeatureTitle}>{title}</h3>
                  <p className={ui.homeFeatureDesc}>{desc}</p>
                </div>
                <ArrowRight className={ui.homeFeatureArrow} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={ui.homeCta}>
        <div className={ui.homeCtaContent}>
          < Wine className={ui.homeCtaIcon} />
          <h3 className={ui.homeCtaTitle}>¿Primer visita?</h3>
          <p className={ui.homeCtaDesc}>
            Crea una cuenta para pedidos más rápidos y acumular beneficios.
          </p>
          <Link href="/cliente/cuenta" className={ui.homeCtaBtn}>
            Crear Cuenta
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}