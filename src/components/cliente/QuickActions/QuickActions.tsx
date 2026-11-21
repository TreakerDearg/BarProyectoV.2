"use client";

import Link from "next/link";
import { UtensilsCrossed, ShoppingCart, Calendar, Sparkles, Award } from "lucide-react";
import styles from "./QuickActions.module.css";

const quickActions = [
  {
    icon: UtensilsCrossed,
    label: "Carta Completa",
    desc: "Coctelería & Menú",
    href: "/cliente/carta",
  },
  {
    icon: ShoppingCart,
    label: "Mi Pedido",
    desc: "En mesa o take-away",
    href: "/cliente/pedido",
  },
  {
    icon: Calendar,
    label: "Reservar Mesa",
    desc: "Salón & Barra VIP",
    href: "/cliente/reservas",
  },
  {
    icon: Sparkles,
    label: "Ruleta Royale",
    desc: "Ganá tragos y premios",
    href: "/cliente/ruleta",
  },
  {
    icon: Award,
    label: "Club Nebula",
    desc: "Puntos y beneficios",
    href: "/cliente/cuenta",
  },
];

export function QuickActions() {
  return (
    <section className={styles.quickActions}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Tu Noche en Nebula</h2>
          <p>Acciones rápidas para comenzar tu experiencia resto-bar</p>
        </div>

        <div className={styles.actionsGrid}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={styles.actionTextWrap}>
                  <span className={styles.actionLabel}>{action.label}</span>
                  <span className={styles.actionDesc}>{action.desc}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
