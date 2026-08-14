"use client";

import Link from "next/link";
import { UtensilsCrossed, ShoppingCart, Calendar, Sparkles, MapPin } from "lucide-react";
import styles from "./QuickActions.module.css";

const quickActions = [
  {
    icon: UtensilsCrossed,
    label: "Ver menú",
    href: "/cliente/carta",
  },
  {
    icon: ShoppingCart,
    label: "Hacer pedido",
    href: "/cliente/carta",
  },
  {
    icon: Calendar,
    label: "Reservar",
    href: "/cliente/reservas",
  },
  {
    icon: Sparkles,
    label: "Promociones",
    href: "/cliente/ruleta",
  },
  {
    icon: MapPin,
    label: "Ver local",
    href: "/cliente",
  },
];

export function QuickActions() {
  return (
    <section className={styles.quickActions}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>¿Qué deseas hacer?</h2>
          <p>Acciones rápidas para comenzar tu experiencia</p>
        </div>
        
        <div className={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className={styles.actionLabel}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}