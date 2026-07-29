"use client";

import { memo, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassWater, MapPin, Clock, Phone, Mail, MessageCircle, Share2, AtSign } from "lucide-react";

const footerLinks = [
  { href: "/cliente/carta", label: "Carta" },
  { href: "/cliente/reservas", label: "Reservas" },
  { href: "/cliente/pedido", label: "Pedidos" },
  { href: "/cliente/ruleta", label: "Experiencia" },
];

const socialLinks = [
  { href: "#", icon: MessageCircle, label: "Instagram" },
  { href: "#", icon: Share2, label: "Facebook" },
  { href: "#", icon: AtSign, label: "Twitter" },
  { href: "mailto:hola@nebula.com", icon: Mail, label: "Email" },
];

function Footer() {
  const [year, setYear] = useState(2024);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative border-t border-white/10 bg-[var(--landing-bg-secondary)] backdrop-blur-xl">
      {/* Ambient Glow */}
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gradient-to-t from-[var(--landing-accent-purple)]/10 via-transparent to-transparent pointer-events-none"
      />

      <div className="landing-container py-16 sm:py-20">
        <div className="grid gap-12 sm:gap-16 lg:grid-cols-4">
          {/* Brand - Larger */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-4 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group-hover:bg-white/10 group-hover:border-white/20 transition-all"
              >
                <GlassWater className="h-7 w-7 text-[var(--landing-accent-gold)]" />
              </motion.div>
              <div>
                <span className="text-2xl font-semibold">Nebula</span>
                <p className="text-sm text-[var(--landing-text-tertiary)]">Food & Beverage</p>
              </div>
            </Link>

            <p className="text-base text-white/70 leading-relaxed max-w-md">
              Una experiencia gastronómica donde los sabores y la coctelería
              se encuentran en una atmósfera única inspirada en lo cósmico.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-widest text-[var(--landing-accent-gold)] mb-6">
              Navegación
            </p>

            <ul className="space-y-4">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-base text-white/70 hover:text-white hover:text-[var(--landing-accent-gold)] transition-colors duration-300"
                    aria-label={`Navegar a ${link.label}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-widest text-[var(--landing-accent-gold)] mb-6">
              Información
            </p>

            <div className="space-y-5 text-base text-white/70">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[var(--landing-accent-gold)] flex-shrink-0" />
                <span>Villa Dolores, Misiones</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[var(--landing-accent-gold)] flex-shrink-0" />
                <span>18:00 - 03:00</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[var(--landing-accent-gold)] flex-shrink-0" />
                <span>+54 9 3755 00-0000</span>
              </div>

              <div className="flex items-center gap-4 pt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-[var(--landing-accent-gold)] transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center text-sm text-white/50">
          <p>© {year} Nebula Food & Beverage. Todos los derechos reservados.</p>

          <p className="text-center sm:text-right">
            Diseño & experiencia Nebula · Obsidian Theme
          </p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
