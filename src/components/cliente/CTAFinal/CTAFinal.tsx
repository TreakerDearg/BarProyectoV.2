"use client";

import Link from "next/link";
import { Sparkles, UtensilsCrossed, ArrowRight, MapPin, Phone } from "lucide-react";
import styles from "./CTAFinal.module.css";

export function CTAFinal() {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.ctaBadge}>
          <Sparkles className="h-4 w-4" />
          ¿Listo para empezar?
        </div>
        
        <h2 className={styles.ctaTitle}>
          ¿Qué vas a pedir hoy?
        </h2>
        
        <p className={styles.ctaDescription}>
          Explora nuestro menú completo, descubre promociones exclusivas y 
          disfruta de la mejor experiencia gastronómica. Tu próximo plato favorito te espera.
        </p>
        
        <Link href="/cliente/carta" className={styles.ctaButton}>
          <UtensilsCrossed className="h-5 w-5" />
          Explorar menú
          <ArrowRight className="h-5 w-5" />
        </Link>
        
        <div className={styles.ctaLinks}>
          <Link href="/cliente/reservas" className={styles.ctaLink}>
            <MapPin className="h-4 w-4" />
            Reservar mesa
          </Link>
          <Link href="/cliente/carta" className={styles.ctaLink}>
            <Phone className="h-4 w-4" />
            Ver promociones
          </Link>
        </div>
      </div>
    </section>
  );
}