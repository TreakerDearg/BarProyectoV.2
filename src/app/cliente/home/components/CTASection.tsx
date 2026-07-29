"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UtensilsCrossed, CalendarDays, Sparkles } from "lucide-react";
import ui from "../../cliente-ui.module.css";

export default function CTASection() {
  return (
    <section className={ui.ctaSection}>
      <div className={ui.ctaContainer}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className={ui.ctaContent}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className={ui.ctaIcon}
          >
            <Sparkles className={ui.ctaIconSvg} />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className={ui.ctaTitle}
          >
            ¿Listo para una experiencia única?
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className={ui.ctaDescription}
          >
            Descubre nuestra selección de cócteles artesanales, platos gourmet y un ambiente exclusivo diseñado para crear momentos inolvidables.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className={ui.ctaActions}
          >
            <Link href="/cliente/carta" className={ui.ctaBtnPrimary}>
              <UtensilsCrossed className={ui.ctaBtnIcon} />
              Ver Carta
            </Link>
            <Link href="/cliente/pedido" className={ui.ctaBtnSecondary}>
              <Sparkles className={ui.ctaBtnIcon} />
              Realizar Pedido
            </Link>
            <Link href="/cliente/reservas" className={ui.ctaBtnTertiary}>
              <CalendarDays className={ui.ctaBtnIcon} />
              Reservar Mesa
            </Link>
          </motion.div>
        </motion.div>

        {/* Decorative Elements */}
        <div className={ui.ctaDecor} />
      </div>
    </section>
  );
}
