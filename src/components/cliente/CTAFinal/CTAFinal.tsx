"use client";

import Link from "next/link";
import { Sparkles, UtensilsCrossed, Calendar, MapPin, Clock, MessageSquare, ArrowRight } from "lucide-react";
import styles from "./CTAFinal.module.css";

export function CTAFinal() {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaBadge}>
            <Sparkles className="h-3.5 w-3.5 text-[#F0B429]" />
            Experiencia Nocturna Completa
          </div>

          <h2 className={styles.ctaTitle}>
            Vení a Vivir la Noche en Nebula
          </h2>

          <p className={styles.ctaDescription}>
            Una cena íntima de fuegos y tapas, una ronda de cócteles clarificados
            frente a los bartenders o una noche distendida en nuestros boxes VIP.
            Tu mesa está lista.
          </p>

          <div className={styles.ctaButtons}>
            <Link href="/cliente/carta" className={styles.primaryBtn}>
              <UtensilsCrossed className="h-4 w-4" />
              <span>Explorar Menú & Pedir</span>
            </Link>

            <Link href="/cliente/reservas" className={styles.secondaryBtn}>
              <Calendar className="h-4 w-4 text-[#F0B429]" />
              <span>Reservar Mesa</span>
            </Link>
          </div>

          {/* Ficha de Información del Local */}
          <div className={styles.venueInfoBar}>
            <div className={styles.venueInfoItem}>
              <Clock size={15} className="text-[#F0B429]" />
              <div className={styles.venueInfoText}>
                <span className={styles.venueLabel}>Horarios de Servicio</span>
                <span className={styles.venueValue}>Mar a Jue: 18:00 - 02:00 | Vie y Sáb: 18:00 - 04:00</span>
              </div>
            </div>

            <div className={styles.venueDivider} />

            <div className={styles.venueInfoItem}>
              <MapPin size={15} className="text-[#F0B429]" />
              <div className={styles.venueInfoText}>
                <span className={styles.venueLabel}>Ubicación</span>
                <span className={styles.venueValue}>Av. Principal 123 • Valet Parking & Salón Climatizado</span>
              </div>
            </div>

            <div className={styles.venueDivider} />

            <div className={styles.venueInfoItem}>
              <MessageSquare size={15} className="text-[#F0B429]" />
              <div className={styles.venueInfoText}>
                <span className={styles.venueLabel}>Atención Rápida</span>
                <a
                  href="https://wa.me/5491112345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappLink}
                >
                  WhatsApp Barra VIP <ArrowRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
