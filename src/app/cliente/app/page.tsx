"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ChefHat, Clock3, GlassWater, Gift, Sparkles, ShoppingBag } from "lucide-react";
import { useClienteStore } from "@/stores/useClienteStore";
import { usePromotions } from "@/hooks/usePromotions";
import styles from "./page.module.css";

export default function ClientAppHomePage() {
  const user = useClienteStore((state) => state.user);
  const tableCode = useClienteStore((state) => state.tableCode);
  const cartCount = useClienteStore((state) => state.cart.reduce((total, line) => total + line.quantity, 0));
  const firstName = user?.name?.split(" ")[0] ?? "invitado";
  const { promotions } = usePromotions("app");
  const featuredPromotion = promotions.find((promotion) => promotion.active) ?? null;

  return (
    <div>
      <section className={styles.welcome} aria-labelledby="app-title">
        <span className={styles.eyebrow}>Nebula en tu bolsillo</span>
        <h1 id="app-title" className={styles.title}>Hola, {firstName}.</h1>
        <p className={styles.subtitle}>Todo lo que quieres disfrutar, a un toque de distancia.</p>
      </section>

      <section className={styles.orderCard} aria-labelledby="order-title">
        <div className={styles.cardHeader}>
          <span id="order-title" className={styles.cardLabel}>Tu experiencia de hoy</span>
          <span className={styles.table}>{tableCode ? `Mesa ${tableCode}` : "Modo invitado"}</span>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.status}><span className={styles.statusDot} /> {cartCount ? "Pedido listo para enviar" : "¿Comenzamos?"}</span>
          <span className={styles.statusHint}>{cartCount ? `${cartCount} ${cartCount === 1 ? "producto" : "productos"}` : "Carta abierta"}</span>
        </div>
        <div className={styles.actionRow}>
          <Link href="/cliente/app/carta" className={styles.primaryAction}>
            {cartCount ? "Continuar pedido" : "Ver la carta"} <ArrowRight size={16} aria-hidden="true" />
          </Link>
          {cartCount > 0 && <Link href="/cliente/app/pedido" className={styles.secondaryAction}>Revisar</Link>}
        </div>
      </section>

      <section className={styles.promo} aria-labelledby="promo-title">
        <div className={styles.promoContent}>
          <span className={styles.promoLabel}>{featuredPromotion ? "Exclusivo en la app" : "Beneficio de hoy"}</span>
          <h2 id="promo-title" className={styles.promoTitle}>{featuredPromotion?.name ?? "Una ronda para compartir"}</h2>
          <p className={styles.promoText}>{featuredPromotion?.description ?? "Promociones exclusivas y novedades aparecerán aquí."}</p>
          <Link href="/cliente/app/carta" className={styles.promoLink}>Descubrir la carta <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
        <span className={styles.promoIcon}><Gift size={22} aria-hidden="true" /></span>
      </section>

      <section className={styles.section} aria-labelledby="quick-title">
        <div className={styles.sectionHeading}>
          <h2 id="quick-title" className={styles.sectionTitle}>Accesos rápidos</h2>
        </div>
        <div className={styles.actionsGrid}>
          <Link href="/cliente/app/carta" className={styles.actionTile}>
            <span className={styles.tileIcon}><ChefHat size={19} aria-hidden="true" /></span>
            <span className={styles.tileText}>Pedir ahora<span className={styles.tileHint}>Bebidas y cocina</span></span>
          </Link>
          <Link href="/cliente/app/pedido" className={styles.actionTile}>
            <span className={styles.tileIcon}><ShoppingBag size={19} aria-hidden="true" /></span>
            <span className={styles.tileText}>Mi pedido<span className={styles.tileHint}>Ver estado y cuenta</span></span>
          </Link>
          <Link href="/cliente/app/reservas" className={styles.actionTile}>
            <span className={styles.tileIcon}><CalendarDays size={19} aria-hidden="true" /></span>
            <span className={styles.tileText}>Reservar mesa<span className={styles.tileHint}>Elige tu próximo plan</span></span>
          </Link>
          <Link href="/cliente/app/ruleta" className={styles.actionTile}>
            <span className={styles.tileIcon}><Sparkles size={19} aria-hidden="true" /></span>
            <span className={styles.tileText}>Ruleta<span className={styles.tileHint}>Una sorpresa para ti</span></span>
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="categories-title">
        <div className={styles.sectionHeading}>
          <h2 id="categories-title" className={styles.sectionTitle}>¿Qué te provoca?</h2>
          <Link href="/cliente/app/carta" className={styles.sectionLink}>Ver todo</Link>
        </div>
        <div className={styles.categoryGrid}>
          <Link href="/cliente/app/carta?category=bebidas" className={styles.categoryTile}>
            <span className={styles.tileIcon}><GlassWater size={18} aria-hidden="true" /></span>
            <span className={styles.tileText}>Bebidas</span>
          </Link>
          <Link href="/cliente/app/carta?category=cocina" className={styles.categoryTile}>
            <span className={styles.tileIcon}><ChefHat size={18} aria-hidden="true" /></span>
            <span className={styles.tileText}>Cocina</span>
          </Link>
          <Link href="/cliente/app/reservas" className={styles.categoryTile}>
            <span className={styles.tileIcon}><Clock3 size={18} aria-hidden="true" /></span>
            <span className={styles.tileText}>Planes</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
